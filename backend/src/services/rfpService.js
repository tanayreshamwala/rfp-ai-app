const Rfp = require("../models/Rfp");
const { generateRfpFromText } = require("./aiService");

/**
 * RFP Service
 * Business logic for RFP operations
 */

/**
 * Create RFP from natural language text using AI
 * @param {string} userText - Natural language description
 * @returns {Promise<Object>} Created RFP document
 */
const createRfpFromText = async (userText) => {
  // Call AI service to generate structured RFP
  const structuredRfp = await generateRfpFromText(userText);

  // Create RFP document in database
  const rfp = await Rfp.create({
    title: structuredRfp.title,
    description: structuredRfp.description,
    budgetAmount: structuredRfp.budgetAmount || null,
    budgetCurrency: structuredRfp.budgetCurrency || "USD",
    deliveryDeadline: structuredRfp.deliveryDeadline
      ? new Date(structuredRfp.deliveryDeadline)
      : null,
    paymentTerms: structuredRfp.paymentTerms || null,
    warrantyTerms: structuredRfp.warrantyTerms || null,
    items: structuredRfp.items || [],
    status: "draft",
  });

  return rfp;
};

/**
 * Get all RFPs
 * @param {Object} filters - Optional filters (status, etc.)
 * @returns {Promise<Array>} Array of RFP documents
 */
const getAllRfps = async (filters = {}) => {
  const query = {};
  if (filters.status) {
    query.status = filters.status;
  }

  const rfps = await Rfp.find(query)
    .sort({ createdAt: -1 })
    .populate("sentToVendors.vendorId", "name email")
    .lean();

  return rfps;
};

/**
 * Get RFP by ID
 * @param {string} rfpId - RFP ID
 * @returns {Promise<Object>} RFP document
 */
const getRfpById = async (rfpId) => {
  const rfp = await Rfp.findById(rfpId)
    .populate("sentToVendors.vendorId", "name email")
    .lean();

  if (!rfp) {
    throw new Error("RFP not found");
  }

  return rfp;
};

/**
 * Update RFP
 * @param {string} rfpId - RFP ID
 * @param {Object} updateData - Fields to update
 * @returns {Promise<Object>} Updated RFP document
 */
const updateRfp = async (rfpId, updateData) => {
  const rfp = await Rfp.findByIdAndUpdate(rfpId, updateData, {
    new: true,
    runValidators: true,
  })
    .populate("sentToVendors.vendorId", "name email")
    .lean();

  if (!rfp) {
    throw new Error("RFP not found");
  }

  return rfp;
};

/**
 * Delete RFP
 * @param {string} rfpId - RFP ID
 * @returns {Promise<boolean>} Success status
 */
const deleteRfp = async (rfpId) => {
  const rfp = await Rfp.findByIdAndDelete(rfpId);

  if (!rfp) {
    throw new Error("RFP not found");
  }

  return true;
};

/**
 * Update RFP status
 * @param {string} rfpId - RFP ID
 * @param {string} status - New status
 * @returns {Promise<Object>} Updated RFP document
 */
const updateRfpStatus = async (rfpId, status) => {
  const validStatuses = ["draft", "sent", "closed", "cancelled"];
  if (!validStatuses.includes(status)) {
    throw new Error(
      `Invalid status. Must be one of: ${validStatuses.join(", ")}`
    );
  }

  return await updateRfp(rfpId, { status });
};

module.exports = {
  createRfpFromText,
  getAllRfps,
  getRfpById,
  updateRfp,
  deleteRfp,
  updateRfpStatus,
};
