const express = require("express");
const router = express.Router();
const {
  createRfpFromText,
  getAllRfps,
  getRfpById,
  updateRfp,
  deleteRfp,
  sendRfpToVendors,
} = require("../controllers/rfpController");
const {
  getProposalsForRfp,
  compareProposals,
} = require("../controllers/proposalController");

// Create RFP from natural language text
router.post("/from-text", createRfpFromText);

// Get all RFPs
router.get("/", getAllRfps);

// Get all proposals for an RFP
router.get("/:id/proposals", getProposalsForRfp);

// Compare proposals for an RFP
router.post("/:id/compare", compareProposals);

// Send RFP to vendors
router.post("/:id/send", sendRfpToVendors);

// Get RFP by ID
router.get("/:id", getRfpById);

// Update RFP
router.put("/:id", updateRfp);

// Delete RFP
router.delete("/:id", deleteRfp);

module.exports = router;
