/**
 * Utility functions for safely parsing JSON responses from AI/LLM
 * Handles cases where LLM might return JSON wrapped in markdown code blocks or with extra text
 */

/**
 * Safely parse JSON string, handling common LLM response formats
 * @param {string} jsonString - Raw response from LLM
 * @returns {Object} Parsed JSON object
 * @throws {Error} If JSON cannot be parsed
 */
const parseAIResponse = (jsonString) => {
  if (!jsonString || typeof jsonString !== "string") {
    throw new Error("Invalid input: expected a string");
  }

  let cleaned = jsonString.trim();

  // Remove markdown code blocks if present
  // Handles cases like: ```json {...} ``` or ``` {...} ```
  if (cleaned.startsWith("```")) {
    const lines = cleaned.split("\n");
    // Remove first line (```json or ```)
    lines.shift();
    // Remove last line (```)
    if (lines.length > 0 && lines[lines.length - 1].trim() === "```") {
      lines.pop();
    }
    cleaned = lines.join("\n").trim();
  }

  // Try to extract JSON object if there's extra text
  // Look for first { and last }
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    // If parsing fails, try to find and extract JSON more aggressively
    console.error("Initial JSON parse failed, attempting recovery...");
    console.error("Raw response:", jsonString.substring(0, 500));

    // Try to extract JSON using regex (finds content between first { and last })
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        throw new Error(
          `Failed to parse JSON after recovery attempts: ${e.message}`
        );
      }
    }

    throw new Error(`Failed to parse JSON: ${error.message}`);
  }
};

/**
 * Validate that parsed JSON has required fields
 * @param {Object} data - Parsed JSON object
 * @param {Array<string>} requiredFields - Array of required field paths (e.g., ['title', 'items.0.name'])
 * @returns {Object} Validation result with isValid and missingFields
 */
const validateRequiredFields = (data, requiredFields = []) => {
  const missingFields = [];

  for (const field of requiredFields) {
    const value = getNestedValue(data, field);
    if (value === undefined || value === null) {
      missingFields.push(field);
    }
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
};

/**
 * Get nested value from object using dot notation
 * @param {Object} obj - Object to traverse
 * @param {string} path - Dot notation path (e.g., 'items.0.name')
 * @returns {*} Value at path or undefined
 */
const getNestedValue = (obj, path) => {
  return path.split(".").reduce((current, key) => {
    if (current === undefined || current === null) return undefined;
    // Handle array indices
    if (!isNaN(key) && Array.isArray(current)) {
      return current[parseInt(key)];
    }
    return current[key];
  }, obj);
};

module.exports = {
  parseAIResponse,
  validateRequiredFields,
  getNestedValue,
};
