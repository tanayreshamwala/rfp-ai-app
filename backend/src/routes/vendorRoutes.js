const express = require("express");
const router = express.Router();
const {
  createVendor,
  getAllVendors,
  getVendorById,
  updateVendor,
  deleteVendor,
} = require("../controllers/vendorController");

// Create vendor
router.post("/", createVendor);

// Get all vendors
router.get("/", getAllVendors);

// Get vendor by ID
router.get("/:id", getVendorById);

// Update vendor
router.put("/:id", updateVendor);

// Delete vendor
router.delete("/:id", deleteVendor);

module.exports = router;
