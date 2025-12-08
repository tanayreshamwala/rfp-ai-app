const Proposal = require("../models/Proposal");
const Rfp = require("../models/Rfp");
const Vendor = require("../models/Vendor");
const { parseVendorResponse, compareProposals } = require("./aiService");

/**
 * Proposal Service
 * Business logic for Proposal operations
 */

/**
 * Create proposal from vendor email response
 * @param {string} rfpId - RFP ID
 * @param {string} vendorId - Vendor ID
 * @param {string} emailBody - Raw email body
 * @param {string} emailMessageId - Optional email message ID
 * @returns {Promise<Object>} Created Proposal document
 */
const createProposalFromEmail = async (
  rfpId,
  vendorId,
  emailBody,
  emailMessageId = null
) => {
  // Get RFP and Vendor for context
  const rfp = await Rfp.findById(rfpId).lean();
  if (!rfp) {
    throw new Error("RFP not found");
  }

  const vendor = await Vendor.findById(vendorId).lean();
  if (!vendor) {
    throw new Error("Vendor not found");
  }

  // Check if proposal already exists for this RFP and vendor
  const existingProposal = await Proposal.findOne({ rfpId, vendorId });
  if (existingProposal) {
    throw new Error("Proposal already exists for this vendor and RFP");
  }

  // Call AI service to parse vendor response
  const parsedData = await parseVendorResponse(rfp, emailBody);

  // Create Proposal document
  const proposal = await Proposal.create({
    rfpId,
    vendorId,
    rawEmailBody: emailBody,
    emailMessageId,
    parsed: parsedData,
    status: "pending",
  });

  // Populate vendor info for response
  const populatedProposal = await Proposal.findById(proposal._id)
    .populate("vendorId", "name email")
    .populate("rfpId", "title")
    .lean();

  return populatedProposal;
};

/**
 * Get all proposals for an RFP
 * @param {string} rfpId - RFP ID
 * @returns {Promise<Array>} Array of Proposal documents
 */
const getProposalsForRfp = async (rfpId) => {
  // Verify RFP exists
  const rfp = await Rfp.findById(rfpId);
  if (!rfp) {
    throw new Error("RFP not found");
  }

  const proposals = await Proposal.find({ rfpId })
    .populate("vendorId", "name email category")
    .sort({ createdAt: -1 })
    .lean();

  return proposals;
};

/**
 * Get proposal by ID
 * @param {string} proposalId - Proposal ID
 * @returns {Promise<Object>} Proposal document
 */
const getProposalById = async (proposalId) => {
  const proposal = await Proposal.findById(proposalId)
    .populate("vendorId", "name email category")
    .populate("rfpId", "title description budgetAmount budgetCurrency")
    .lean();

  if (!proposal) {
    throw new Error("Proposal not found");
  }

  return proposal;
};

/**
 * Compare proposals for an RFP using AI
 * @param {string} rfpId - RFP ID
 * @returns {Promise<Object>} Comparison results with scores and recommendations
 */
const compareProposalsForRfp = async (rfpId) => {
  // Get RFP
  const rfp = await Rfp.findById(rfpId).lean();
  if (!rfp) {
    throw new Error("RFP not found");
  }

  // Get all proposals for this RFP
  const proposals = await Proposal.find({ rfpId })
    .populate("vendorId", "name email")
    .lean();

  if (proposals.length < 2) {
    throw new Error("At least 2 proposals are required for comparison");
  }

  // Prepare proposals data for AI comparison
  const proposalsForComparison = proposals.map((proposal) => ({
    vendorId: proposal.vendorId._id.toString(),
    vendorName: proposal.vendorId.name,
    parsed: proposal.parsed,
  }));

  // Call AI service to compare proposals
  const comparisonResult = await compareProposals(rfp, proposalsForComparison);

  // Replace "Vendor 1", "Vendor 2", etc. with actual vendor names in AI responses
  const vendorNameMap = proposalsForComparison.reduce(
    (map, proposal, index) => {
      map[`Vendor ${index + 1}`] = proposal.vendorName;
      map[`vendor ${index + 1}`] = proposal.vendorName;
      map[`VENDOR ${index + 1}`] = proposal.vendorName;
      return map;
    },
    {}
  );

  // Replace vendor references in summaries and explanations
  const replaceVendorNames = (text) => {
    if (!text) return text;
    let result = text;
    Object.entries(vendorNameMap).forEach(([placeholder, vendorName]) => {
      const regex = new RegExp(placeholder.replace(/\s+/g, "\\s+"), "gi");
      result = result.replace(regex, vendorName);
    });
    return result;
  };

  // Update summaries and explanations with actual vendor names
  comparisonResult.evaluations.forEach((evaluation) => {
    if (evaluation.summary) {
      evaluation.summary = replaceVendorNames(evaluation.summary);
    }
  });
  if (comparisonResult.overallExplanation) {
    comparisonResult.overallExplanation = replaceVendorNames(
      comparisonResult.overallExplanation
    );
  }

  // Update proposals with AI evaluation results
  // Match evaluations by vendorIndex to ensure correct mapping
  const updatePromises = comparisonResult.evaluations.map(
    async (evaluation) => {
      // Use vendorIndex from evaluation to find the correct proposal
      const proposalIndex = evaluation.vendorIndex;
      if (proposalIndex < 0 || proposalIndex >= proposals.length) {
        console.error(`Invalid vendorIndex ${proposalIndex} in evaluation`);
        return;
      }

      const proposal = proposals[proposalIndex];
      const updateData = {
        aiScore: evaluation.score,
        aiSummary: evaluation.summary,
        aiPros: evaluation.pros,
        aiCons: evaluation.cons,
        aiRecommendation:
          proposalIndex === comparisonResult.recommendedVendorIndex,
      };

      await Proposal.findByIdAndUpdate(proposal._id, updateData);
    }
  );

  await Promise.all(updatePromises);

  // Return comparison results with proposal IDs
  // Match by vendorIndex to ensure correct order
  const result = {
    evaluations: comparisonResult.evaluations
      .map((evaluation) => {
        const proposalIndex = evaluation.vendorIndex;
        if (proposalIndex < 0 || proposalIndex >= proposals.length) {
          console.error(`Invalid vendorIndex ${proposalIndex} in evaluation`);
          return null;
        }
        const proposal = proposals[proposalIndex];
        return {
          ...evaluation,
          proposalId: proposal._id.toString(),
          vendorId: proposal.vendorId._id.toString(),
          vendorName: proposal.vendorId.name,
        };
      })
      .filter((e) => e !== null), // Remove any null entries from invalid indices
    recommendedVendorIndex: comparisonResult.recommendedVendorIndex,
    recommendedProposalId:
      proposals[comparisonResult.recommendedVendorIndex]._id.toString(),
    overallExplanation: comparisonResult.overallExplanation,
  };

  return result;
};

/**
 * Update proposal status
 * @param {string} proposalId - Proposal ID
 * @param {string} status - New status
 * @returns {Promise<Object>} Updated Proposal document
 */
const updateProposalStatus = async (proposalId, status) => {
  const validStatuses = ["pending", "reviewed", "accepted", "rejected"];
  if (!validStatuses.includes(status)) {
    throw new Error(
      `Invalid status. Must be one of: ${validStatuses.join(", ")}`
    );
  }

  const proposal = await Proposal.findByIdAndUpdate(
    proposalId,
    { status },
    { new: true, runValidators: true }
  )
    .populate("vendorId", "name email")
    .populate("rfpId", "title")
    .lean();

  if (!proposal) {
    throw new Error("Proposal not found");
  }

  return proposal;
};

module.exports = {
  createProposalFromEmail,
  getProposalsForRfp,
  getProposalById,
  compareProposalsForRfp,
  updateProposalStatus,
};
