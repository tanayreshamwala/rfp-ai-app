const proposalService = require("../services/proposalService");

/**
 * Proposal Controller
 * Handles HTTP requests for Proposal operations
 */

/**
 * Get all proposals for an RFP
 * GET /api/rfps/:id/proposals
 */
const getProposalsForRfp = async (req, res) => {
  try {
    const { id: rfpId } = req.params;

    const proposals = await proposalService.getProposalsForRfp(rfpId);

    res.status(200).json({
      success: true,
      count: proposals.length,
      data: proposals,
    });
  } catch (error) {
    console.error("Error fetching proposals:", error);
    if (error.message === "RFP not found") {
      return res.status(404).json({
        success: false,
        message: "RFP not found",
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch proposals",
    });
  }
};

/**
 * Get proposal by ID
 * GET /api/proposals/:id
 */
const getProposalById = async (req, res) => {
  try {
    const { id } = req.params;

    const proposal = await proposalService.getProposalById(id);

    res.status(200).json({
      success: true,
      data: proposal,
    });
  } catch (error) {
    console.error("Error fetching proposal:", error);
    if (error.message === "Proposal not found") {
      return res.status(404).json({
        success: false,
        message: "Proposal not found",
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch proposal",
    });
  }
};

/**
 * Compare proposals for an RFP using AI
 * POST /api/rfps/:id/compare
 */
const compareProposals = async (req, res) => {
  try {
    const { id: rfpId } = req.params;

    const comparisonResult = await proposalService.compareProposalsForRfp(
      rfpId
    );

    res.status(200).json({
      success: true,
      data: comparisonResult,
    });
  } catch (error) {
    console.error("Error comparing proposals:", error);
    if (error.message === "RFP not found") {
      return res.status(404).json({
        success: false,
        message: "RFP not found",
      });
    }
    if (error.message.includes("At least 2 proposals")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || "Failed to compare proposals",
    });
  }
};

/**
 * Update proposal status
 * PUT /api/proposals/:id/status
 */
const updateProposalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const proposal = await proposalService.updateProposalStatus(id, status);

    res.status(200).json({
      success: true,
      data: proposal,
    });
  } catch (error) {
    console.error("Error updating proposal status:", error);
    if (error.message === "Proposal not found") {
      return res.status(404).json({
        success: false,
        message: "Proposal not found",
      });
    }
    if (error.message.includes("Invalid status")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update proposal status",
    });
  }
};

module.exports = {
  getProposalsForRfp,
  getProposalById,
  compareProposals,
  updateProposalStatus,
};
