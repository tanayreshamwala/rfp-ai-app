const express = require("express");
const router = express.Router();

// Import route modules
const rfpRoutes = require("./rfpRoutes");
const vendorRoutes = require("./vendorRoutes");
const proposalRoutes = require("./proposalRoutes");
const emailRoutes = require("./emailRoutes");

// Mount routes
router.use("/rfps", rfpRoutes);
router.use("/vendors", vendorRoutes);
router.use("/proposals", proposalRoutes);
router.use("/email", emailRoutes);

module.exports = router;
