const emailService = require("../services/emailService");
const proposalService = require("../services/proposalService");
const EmailMessage = require("../models/EmailMessage");

/**
 * Email Controller
 * Handles HTTP requests for email operations (webhooks)
 */

/**
 * Process inbound email webhook
 * POST /api/email/inbound
 */
const processInboundEmail = async (req, res) => {
  try {
    // Extract email data from webhook payload
    // Different email providers have different formats, so we try to handle common ones
    let emailData = {};

    // Try SendGrid format
    if (req.body.from && req.body.text) {
      emailData = {
        from: req.body.from,
        to: req.body.to || req.body.recipient,
        subject: req.body.subject,
        text: req.body.text,
        html: req.body.html,
        messageId: req.body["message-id"] || req.body.messageId,
      };
    }
    // Try Mailgun format
    else if (req.body["sender"] && req.body["body-plain"]) {
      emailData = {
        from: req.body.sender,
        to: req.body.recipient,
        subject: req.body.subject,
        text: req.body["body-plain"],
        html: req.body["body-html"],
        messageId: req.body["Message-Id"] || req.body.messageId,
      };
    }
    // Try generic format (for manual testing)
    else {
      emailData = {
        from: req.body.from,
        to: req.body.to,
        subject: req.body.subject,
        text: req.body.text || req.body.body,
        html: req.body.html,
        messageId: req.body.messageId,
      };
    }

    // Validate required fields
    if (!emailData.from || !emailData.subject || !emailData.text) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: from, subject, and text/body are required",
      });
    }

    // Process inbound email (extracts RFP ID and vendor)
    const processResult = await emailService.processInboundEmail(emailData);

    // Create proposal from parsed email
    let proposal;
    try {
      proposal = await proposalService.createProposalFromEmail(
        processResult.rfpId,
        processResult.vendorId,
        processResult.emailBody,
        processResult.emailMessageId
      );

      // Mark email as processed
      await EmailMessage.findByIdAndUpdate(processResult.emailMessageId, {
        processed: true,
        proposalId: proposal._id,
      });
    } catch (proposalError) {
      // Log error but don't fail the webhook
      console.error("Error creating proposal from email:", proposalError);
      await EmailMessage.findByIdAndUpdate(processResult.emailMessageId, {
        processed: false,
        error: proposalError.message,
      });

      // Return error but with 200 status (so email provider doesn't retry)
      return res.status(200).json({
        success: false,
        message: "Email received but failed to create proposal",
        error: proposalError.message,
        emailMessageId: processResult.emailMessageId,
      });
    }

    res.status(200).json({
      success: true,
      message: "Email processed and proposal created",
      data: {
        proposalId: proposal._id,
        rfpId: processResult.rfpId,
        vendorId: processResult.vendorId,
      },
    });
  } catch (error) {
    console.error("Error processing inbound email:", error);

    // Return 200 to prevent email provider from retrying
    // (we'll handle the error internally)
    res.status(200).json({
      success: false,
      message: error.message || "Failed to process inbound email",
    });
  }
};

module.exports = {
  processInboundEmail,
};
