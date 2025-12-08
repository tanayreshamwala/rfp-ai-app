/**
 * Prompt Templates for AI/LLM Integration
 * These prompts are designed to get structured JSON responses from the LLM
 */

/**
 * Prompt for converting natural language RFP description into structured RFP JSON
 * @param {string} userText - User's natural language description
 * @returns {string} Complete prompt for LLM
 */
const generateRfpPrompt = (userText) => {
  return `You are an expert procurement assistant. Convert the following natural language procurement request into a structured RFP (Request for Proposal) JSON format.

User's Request:
${userText}

Extract and structure the following information:
- title: A concise title for this RFP
- description: Detailed description of what needs to be procured
- budgetAmount: Numeric budget amount (if mentioned, otherwise null)
- budgetCurrency: Currency code (e.g., "USD", "EUR") - default to "USD" if not specified
- deliveryDeadline: ISO date string (YYYY-MM-DD) if a specific date is mentioned, or null
- paymentTerms: Payment terms mentioned (e.g., "Net 30", "50% upfront") or null
- warrantyTerms: Warranty requirements mentioned or null
- items: Array of line items, each with:
  - name: Item name
  - quantity: Numeric quantity
  - specs: Specifications/requirements for this item

IMPORTANT: Respond ONLY with valid JSON. Do not include any explanatory text, markdown formatting, or code blocks. Just the raw JSON object.

Example format:
{
  "title": "Office Equipment Procurement",
  "description": "Procurement of laptops and monitors for new office setup",
  "budgetAmount": 50000,
  "budgetCurrency": "USD",
  "deliveryDeadline": "2024-02-15",
  "paymentTerms": "Net 30",
  "warrantyTerms": "1 year warranty required",
  "items": [
    {
      "name": "Laptop",
      "quantity": 20,
      "specs": "16GB RAM, 512GB SSD, Intel i7 or equivalent"
    },
    {
      "name": "Monitor",
      "quantity": 15,
      "specs": "27-inch, 4K resolution"
    }
  ]
}`;
};

/**
 * Prompt for parsing vendor email response into structured proposal JSON
 * @param {Object} rfp - The original RFP object
 * @param {string} emailBody - Raw vendor email body text
 * @returns {string} Complete prompt for LLM
 */
const parseVendorResponsePrompt = (rfp, emailBody) => {
  const rfpSummary = `
RFP Title: ${rfp.title}
Description: ${rfp.description}
Budget: ${rfp.budgetCurrency} ${rfp.budgetAmount || "Not specified"}
Delivery Deadline: ${
    rfp.deliveryDeadline
      ? new Date(rfp.deliveryDeadline).toISOString().split("T")[0]
      : "Not specified"
  }
Payment Terms Required: ${rfp.paymentTerms || "Not specified"}
Warranty Required: ${rfp.warrantyTerms || "Not specified"}

Required Items:
${rfp.items
  .map(
    (item, idx) =>
      `${idx + 1}. ${item.name} - Quantity: ${item.quantity} - Specs: ${
        item.specs || "N/A"
      }`
  )
  .join("\n")}
`;

  return `You are an expert procurement assistant. Parse the following vendor email response and extract structured proposal data.

Original RFP Requirements:
${rfpSummary}

Vendor Email Response:
${emailBody}

Extract the following information from the vendor's response:
- items: Array matching the RFP items, each with:
  - name: Item name (should match or be similar to RFP item)
  - quantity: Quantity offered
  - unitPrice: Price per unit
  - totalPrice: Total price for this item (quantity × unitPrice)
  - specs: Any specifications mentioned
- totalPrice: Total price for the entire proposal (numeric)
- currency: Currency code (e.g., "USD", "EUR") - default to "USD" if not clear
- deliveryDays: Number of days until delivery (extract from text, convert dates to days if needed)
- paymentTerms: Payment terms offered (e.g., "Net 30", "50% upfront")
- warranty: Warranty details offered
- notes: Any additional important notes or terms

If information is missing or unclear, use null for optional fields. For required fields like totalPrice, make your best estimate from the email text.

IMPORTANT: Respond ONLY with valid JSON. Do not include any explanatory text, markdown formatting, or code blocks. Just the raw JSON object.

Example format:
{
  "items": [
    {
      "name": "Laptop",
      "quantity": 20,
      "unitPrice": 1200,
      "totalPrice": 24000,
      "specs": "Dell Latitude 7420, 16GB RAM, 512GB SSD"
    },
    {
      "name": "Monitor",
      "quantity": 15,
      "unitPrice": 350,
      "totalPrice": 5250,
      "specs": "27-inch 4K Dell UltraSharp"
    }
  ],
  "totalPrice": 29250,
  "currency": "USD",
  "deliveryDays": 21,
  "paymentTerms": "Net 30",
  "warranty": "1 year manufacturer warranty",
  "notes": "Free shipping included, setup assistance available"
}`;
};

/**
 * Prompt for comparing proposals and generating recommendations
 * @param {Object} rfp - The original RFP object
 * @param {Array} proposals - Array of proposal objects with vendor info
 * @returns {string} Complete prompt for LLM
 */
const compareProposalsPrompt = (rfp, proposals) => {
  const rfpSummary = `
RFP Title: ${rfp.title}
Budget: ${rfp.budgetCurrency} ${rfp.budgetAmount || "Not specified"}
Delivery Deadline: ${
    rfp.deliveryDeadline
      ? new Date(rfp.deliveryDeadline).toISOString().split("T")[0]
      : "Not specified"
  }
Payment Terms Required: ${rfp.paymentTerms || "Not specified"}
Warranty Required: ${rfp.warrantyTerms || "Not specified"}
`;

  const proposalsSummary = proposals
    .map((proposal, idx) => {
      return `
Vendor ${idx + 1}: ${proposal.vendorName || "Unknown"}
- Total Price: ${proposal.parsed.currency} ${proposal.parsed.totalPrice}
- Delivery: ${
        proposal.parsed.deliveryDays
          ? `${proposal.parsed.deliveryDays} days`
          : "Not specified"
      }
- Payment Terms: ${proposal.parsed.paymentTerms || "Not specified"}
- Warranty: ${proposal.parsed.warranty || "Not specified"}
- Notes: ${proposal.parsed.notes || "None"}
`;
    })
    .join("\n");

  return `You are an expert procurement analyst. Analyze and compare the following vendor proposals for an RFP and provide recommendations.

RFP Requirements:
${rfpSummary}

Vendor Proposals:
${proposalsSummary}

For each vendor, provide:
- score: A score from 0-100 based on:
  * Price competitiveness (lower is better, but consider value)
  * Delivery timeline (meets deadline = higher score)
  * Payment terms alignment
  * Warranty coverage
  * Overall value proposition
- pros: Array of 2-4 key advantages/strengths
- cons: Array of 2-4 key disadvantages/concerns
- summary: 2-3 sentence summary of this vendor's proposal. IMPORTANT: Use the actual vendor name (e.g., "Tech Solutions Inc.") instead of "Vendor 1" or "Vendor 2" in the summary.

Then provide:
- recommendedVendorIndex: The index (0-based) of the vendor you recommend
- overallExplanation: A 3-5 sentence explanation of why this vendor is recommended, considering all factors. IMPORTANT: Use actual vendor names (e.g., "Tech Solutions Inc.", "Premium IT Solutions") instead of "Vendor 1", "Vendor 2", etc. in your explanation.

IMPORTANT: Respond ONLY with valid JSON. Do not include any explanatory text, markdown formatting, or code blocks. Just the raw JSON object.

Example format:
{
  "evaluations": [
    {
      "vendorIndex": 0,
      "score": 85,
      "pros": ["Competitive pricing", "Fast delivery", "Good warranty"],
      "cons": ["Payment terms less favorable", "Limited support"],
      "summary": "Strong overall value with competitive pricing and good delivery timeline."
    },
    {
      "vendorIndex": 1,
      "score": 72,
      "pros": ["Excellent warranty", "Flexible payment"],
      "cons": ["Higher price", "Longer delivery time"],
      "summary": "Premium option with better terms but at higher cost."
    }
  ],
  "recommendedVendorIndex": 0,
  "overallExplanation": "Tech Solutions Inc. offers the best balance of price, delivery speed, and value. While Premium IT Solutions has better warranty terms, the significant price difference and faster delivery from Tech Solutions Inc. make it the recommended choice for this procurement."
}`;
};

module.exports = {
  generateRfpPrompt,
  parseVendorResponsePrompt,
  compareProposalsPrompt,
};
