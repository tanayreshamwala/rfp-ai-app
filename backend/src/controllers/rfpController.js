const rfpService = require("../services/rfpService");

/**
 * RFP Controller
 * Handles HTTP requests for RFP operations
 */

/**
 * Create RFP from natural language text
 * POST /api/rfps/from-text
 */
const createRfpFromText = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Text is required and must be a non-empty string",
      });
    }

    const rfp = await rfpService.createRfpFromText(text);

    res.status(201).json({
      success: true,
      data: rfp,
    });
  } catch (error) {
    console.error("Error creating RFP from text:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create RFP from text",
    });
  }
};

/**
 * Get all RFPs
 * GET /api/rfps
 */
const getAllRfps = async (req, res) => {
  try {
    const filters = {};
    if (req.query.status) {
      filters.status = req.query.status;
    }

    const rfps = await rfpService.getAllRfps(filters);

    res.status(200).json({
      success: true,
      count: rfps.length,
      data: rfps,
    });
  } catch (error) {
    console.error("Error fetching RFPs:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch RFPs",
    });
  }
};

/**
 * Get RFP by ID
 * GET /api/rfps/:id
 */
const getRfpById = async (req, res) => {
  try {
    const { id } = req.params;

    const rfp = await rfpService.getRfpById(id);

    res.status(200).json({
      success: true,
      data: rfp,
    });
  } catch (error) {
    console.error("Error fetching RFP:", error);
    if (error.message === "RFP not found") {
      return res.status(404).json({
        success: false,
        message: "RFP not found",
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch RFP",
    });
  }
};

/**
 * Update RFP
 * PUT /api/rfps/:id
 */
const updateRfp = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.sentToVendors; // Use send endpoint instead

    const rfp = await rfpService.updateRfp(id, updateData);

    res.status(200).json({
      success: true,
      data: rfp,
    });
  } catch (error) {
    console.error("Error updating RFP:", error);
    if (error.message === "RFP not found") {
      return res.status(404).json({
        success: false,
        message: "RFP not found",
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update RFP",
    });
  }
};

/**
 * Delete RFP
 * DELETE /api/rfps/:id
 */
const deleteRfp = async (req, res) => {
  try {
    const { id } = req.params;

    await rfpService.deleteRfp(id);

    res.status(200).json({
      success: true,
      message: "RFP deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting RFP:", error);
    if (error.message === "RFP not found") {
      return res.status(404).json({
        success: false,
        message: "RFP not found",
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete RFP",
    });
  }
};

/**
 * Send RFP to vendors
 * POST /api/rfps/:id/send
 */
const sendRfpToVendors = async (req, res) => {
  try {
    const { id } = req.params;
    const { vendorIds, customMessage } = req.body;

    if (!vendorIds || !Array.isArray(vendorIds) || vendorIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "vendorIds is required and must be a non-empty array",
      });
    }

    const emailService = require("../services/emailService");
    const results = await emailService.sendRfpToVendors(
      id,
      vendorIds,
      customMessage || ""
    );

    // Update RFP status
    await rfpService.updateRfpStatus(id, "sent");

    res.status(200).json({
      success: true,
      message: `RFP sent to ${
        results.filter((r) => r.success).length
      } vendor(s)`,
      data: results,
    });
  } catch (error) {
    console.error("Error sending RFP to vendors:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to send RFP to vendors",
    });
  }
};

module.exports = {
  createRfpFromText,
  getAllRfps,
  getRfpById,
  updateRfp,
  deleteRfp,
  sendRfpToVendors,
};
