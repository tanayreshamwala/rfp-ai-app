const express = require("express");
const router = express.Router();
const { processInboundEmail } = require("../controllers/emailController");

// Process inbound email webhook
router.post("/inbound", processInboundEmail);

module.exports = router;
