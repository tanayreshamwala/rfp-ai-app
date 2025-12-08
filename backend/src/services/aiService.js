const axios = require("axios");
const {
  generateRfpPrompt,
  parseVendorResponsePrompt,
  compareProposalsPrompt,
} = require("../utils/promptTemplates");
const {
  parseAIResponse,
  validateRequiredFields,
} = require("../utils/jsonParser");

/**
 * AI Service
 * Handles all LLM API calls for RFP generation, vendor response parsing, and proposal comparison
 */

// OpenAI API configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-4o-mini"; // Using a cost-effective model, can be changed to gpt-4 for better results

/**
 * Call OpenAI API with a prompt
 * @param {string} prompt - The prompt to send to the LLM
 * @param {number} maxRetries - Maximum number of retry attempts
 * @returns {Promise<Object>} Parsed JSON response from LLM
 */
const callOpenAI = async (prompt, maxRetries = 2) => {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not defined in environment variables");
  }

  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await axios.post(
        OPENAI_API_URL,
        {
          model: DEFAULT_MODEL,
          messages: [
            {
              role: "system",
              content:
                "You are a helpful assistant that responds ONLY with valid JSON. Never include markdown code blocks, explanations, or any text outside the JSON object.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.3, // Lower temperature for more consistent, structured outputs
          response_format: { type: "json_object" }, // Request JSON mode (if supported by model)
        },
        {
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 30000, // 30 second timeout
        }
      );

      const content = response.data.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No content in OpenAI response");
      }

      // Parse the JSON response
      const parsed = parseAIResponse(content);
      return parsed;
    } catch (error) {
      lastError = error;
      console.error(
        `OpenAI API call attempt ${attempt + 1} failed:`,
        error.message
      );

      // If it's a rate limit or server error, wait before retrying
      if (
        (error.response?.status === 429 || error.response?.status >= 500) &&
        attempt < maxRetries
      ) {
        const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.log(`Waiting ${waitTime}ms before retry...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }

      // If it's a JSON parsing error, try one more time with a different approach
      if (error.message.includes("parse JSON") && attempt < maxRetries) {
        continue;
      }

      // Otherwise, throw the error
      throw error;
    }
  }

  throw new Error(
    `Failed after ${maxRetries + 1} attempts: ${lastError?.message}`
  );
};

/**
 * Generate structured RFP from natural language text
 * @param {string} userText - User's natural language description
 * @returns {Promise<Object>} Structured RFP object
 */
const generateRfpFromText = async (userText) => {
  if (
    !userText ||
    typeof userText !== "string" ||
    userText.trim().length === 0
  ) {
    throw new Error("User text is required and must be a non-empty string");
  }

  try {
    const prompt = generateRfpPrompt(userText);
    const result = await callOpenAI(prompt);

    // Validate required fields
    const validation = validateRequiredFields(result, [
      "title",
      "description",
      "items",
    ]);
    if (!validation.isValid) {
      throw new Error(
        `Missing required fields in AI response: ${validation.missingFields.join(
          ", "
        )}`
      );
    }

    // Ensure items is an array
    if (!Array.isArray(result.items)) {
      throw new Error("Items must be an array");
    }

    // Ensure items have required fields
    for (const item of result.items) {
      if (!item.name || !item.quantity) {
        throw new Error("Each item must have name and quantity");
      }
    }

    return result;
  } catch (error) {
    console.error("Error generating RFP from text:", error);
    throw new Error(`Failed to generate RFP: ${error.message}`);
  }
};

/**
 * Parse vendor email response into structured proposal data
 * @param {Object} rfp - The original RFP object
 * @param {string} emailBody - Raw vendor email body text
 * @returns {Promise<Object>} Structured proposal data
 */
const parseVendorResponse = async (rfp, emailBody) => {
  if (!rfp || !emailBody) {
    throw new Error("RFP and email body are required");
  }

  if (typeof emailBody !== "string" || emailBody.trim().length === 0) {
    throw new Error("Email body must be a non-empty string");
  }

  try {
    const prompt = parseVendorResponsePrompt(rfp, emailBody);
    const result = await callOpenAI(prompt);

    // Validate required fields
    const validation = validateRequiredFields(result, ["totalPrice", "items"]);
    if (!validation.isValid) {
      throw new Error(
        `Missing required fields in AI response: ${validation.missingFields.join(
          ", "
        )}`
      );
    }

    // Ensure items is an array
    if (!Array.isArray(result.items)) {
      throw new Error("Items must be an array");
    }

    // Set defaults
    if (!result.currency) {
      result.currency = "USD";
    }

    return result;
  } catch (error) {
    console.error("Error parsing vendor response:", error);
    throw new Error(`Failed to parse vendor response: ${error.message}`);
  }
};

/**
 * Compare proposals and generate AI recommendations
 * @param {Object} rfp - The original RFP object
 * @param {Array} proposals - Array of proposal objects with vendor info and parsed data
 * @returns {Promise<Object>} Comparison results with scores, pros/cons, and recommendation
 */
const compareProposals = async (rfp, proposals) => {
  if (
    !rfp ||
    !proposals ||
    !Array.isArray(proposals) ||
    proposals.length === 0
  ) {
    throw new Error("RFP and at least one proposal are required");
  }

  if (proposals.length < 2) {
    throw new Error("At least 2 proposals are required for comparison");
  }

  try {
    // Prepare proposals data with vendor names for the prompt
    const proposalsWithVendorNames = proposals.map((proposal) => ({
      vendorName: proposal.vendorName || `Vendor ${proposal.vendorId}`,
      parsed: proposal.parsed,
    }));

    const prompt = compareProposalsPrompt(rfp, proposalsWithVendorNames);
    const result = await callOpenAI(prompt);

    // Validate required fields
    const validation = validateRequiredFields(result, [
      "evaluations",
      "recommendedVendorIndex",
      "overallExplanation",
    ]);
    if (!validation.isValid) {
      throw new Error(
        `Missing required fields in AI response: ${validation.missingFields.join(
          ", "
        )}`
      );
    }

    // Ensure evaluations array matches proposals length
    if (
      !Array.isArray(result.evaluations) ||
      result.evaluations.length !== proposals.length
    ) {
      throw new Error(
        "Evaluations array length must match proposals array length"
      );
    }

    // Validate recommended vendor index
    if (
      result.recommendedVendorIndex < 0 ||
      result.recommendedVendorIndex >= proposals.length
    ) {
      throw new Error("Recommended vendor index is out of range");
    }

    return result;
  } catch (error) {
    console.error("Error comparing proposals:", error);
    throw new Error(`Failed to compare proposals: ${error.message}`);
  }
};

module.exports = {
  generateRfpFromText,
  parseVendorResponse,
  compareProposals,
};
