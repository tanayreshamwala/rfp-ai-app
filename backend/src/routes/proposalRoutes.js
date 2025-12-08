const express = require("express");
const router = express.Router();
const {
  getProposalById,
  updateProposalStatus,
} = require("../controllers/proposalController");

// Get proposal by ID
router.get("/:id", getProposalById);

// Update proposal status
router.put("/:id/status", updateProposalStatus);

module.exports = router;
