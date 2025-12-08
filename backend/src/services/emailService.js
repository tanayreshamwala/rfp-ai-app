const nodemailer = require("nodemailer");
const Rfp = require("../models/Rfp");
const Vendor = require("../models/Vendor");
const EmailMessage = require("../models/EmailMessage");

/**
 * Email Service
 * Handles sending and receiving emails
 */

// Create email transporter (will be configured based on environment)
let transporter = null;

/**
 * Initialize email transporter
 */
const initializeEmailTransporter = () => {
  if (transporter) {
    return transporter;
  }

  // Check if using SMTP
  if (process.env.EMAIL_SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SMTP_HOST,
      port: parseInt(process.env.EMAIL_SMTP_PORT || "587"),
      secure: process.env.EMAIL_SMTP_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_SMTP_USER,
        pass: process.env.EMAIL_SMTP_PASS,
      },
    });
  } else {
    // If no email config, create a mock transporter for development
    console.warn(
      "No email configuration found. Email sending will be mocked. Set EMAIL_SMTP_* variables to enable real email sending."
    );
    transporter = {
      sendMail: async (options) => {
        console.log("📧 [MOCK EMAIL] Would send email:", {
          to: options.to,
          subject: options.subject,
          text: options.text?.substring(0, 100) + "...",
        });
        return {
          messageId: `mock-${Date.now()}`,
          accepted: [options.to],
        };
      },
    };
  }

  return transporter;
};

/**
 * Send RFP to vendors via email
 * @param {string} rfpId - RFP ID
 * @param {Array<string>} vendorIds - Array of vendor IDs
 * @param {string} customMessage - Optional custom message to include
 * @returns {Promise<Array>} Array of email send results
 */
const sendRfpToVendors = async (rfpId, vendorIds, customMessage = "") => {
  // Get RFP
  const rfp = await Rfp.findById(rfpId);
  if (!rfp) {
    throw new Error("RFP not found");
  }

  // Get vendors
  const vendors = await Vendor.find({
    _id: { $in: vendorIds },
    isActive: true,
  });
  if (vendors.length === 0) {
    throw new Error("No valid vendors found");
  }

  // Initialize email transporter
  const emailTransporter = initializeEmailTransporter();

  // Prepare email content
  const emailSubject = `RFP: ${rfp.title} [ID: ${rfpId}]`;
  const emailBody = generateRfpEmailBody(rfp, customMessage);

  // Send emails to each vendor
  const sendResults = [];
  const sentToVendors = [];

  for (const vendor of vendors) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_SMTP_USER || "rfp-system@example.com",
        to: vendor.email,
        subject: emailSubject,
        text: emailBody,
        replyTo:
          process.env.EMAIL_REPLY_TO ||
          process.env.EMAIL_SMTP_USER ||
          "rfp-system@example.com",
      };

      const info = await emailTransporter.sendMail(mailOptions);

      // Log email message
      const emailMessage = await EmailMessage.create({
        direction: "sent",
        rfpId,
        vendorId: vendor._id,
        from: mailOptions.from,
        to: vendor.email,
        subject: emailSubject,
        body: emailBody,
        messageId: info.messageId,
        processed: true,
      });

      sentToVendors.push({
        vendorId: vendor._id,
        sentAt: new Date(),
        emailMessageId: emailMessage._id,
      });

      sendResults.push({
        vendorId: vendor._id,
        vendorName: vendor.name,
        vendorEmail: vendor.email,
        success: true,
        messageId: info.messageId,
      });
    } catch (error) {
      console.error(`Failed to send email to ${vendor.email}:`, error);
      sendResults.push({
        vendorId: vendor._id,
        vendorName: vendor.name,
        vendorEmail: vendor.email,
        success: false,
        error: error.message,
      });
    }
  }

  // Update RFP with sent vendors and status
  if (sentToVendors.length > 0) {
    rfp.sentToVendors = [...(rfp.sentToVendors || []), ...sentToVendors];
    rfp.status = "sent";
    await rfp.save();
  }

  return sendResults;
};

/**
 * Generate email body for RFP
 * @param {Object} rfp - RFP document
 * @param {string} customMessage - Optional custom message
 * @returns {string} Email body text
 */
const generateRfpEmailBody = (rfp, customMessage = "") => {
  let body = `Dear Vendor,\n\n`;
  body += `We are requesting a proposal for the following procurement:\n\n`;
  body += `RFP Title: ${rfp.title}\n`;
  body += `Description: ${rfp.description}\n\n`;

  if (rfp.budgetAmount) {
    body += `Budget: ${rfp.budgetCurrency} ${rfp.budgetAmount}\n`;
  }

  if (rfp.deliveryDeadline) {
    body += `Delivery Deadline: ${new Date(
      rfp.deliveryDeadline
    ).toLocaleDateString()}\n`;
  }

  if (rfp.paymentTerms) {
    body += `Payment Terms Required: ${rfp.paymentTerms}\n`;
  }

  if (rfp.warrantyTerms) {
    body += `Warranty Required: ${rfp.warrantyTerms}\n`;
  }

  body += `\nRequired Items:\n`;
  rfp.items.forEach((item, index) => {
    body += `${index + 1}. ${item.name} - Quantity: ${item.quantity}`;
    if (item.specs) {
      body += ` - Specs: ${item.specs}`;
    }
    body += `\n`;
  });

  if (customMessage) {
    body += `\nAdditional Notes:\n${customMessage}\n`;
  }

  body += `\nPlease reply to this email with your proposal including:\n`;
  body += `- Item-wise pricing\n`;
  body += `- Total price\n`;
  body += `- Delivery timeline\n`;
  body += `- Payment terms\n`;
  body += `- Warranty details\n`;
  body += `- Any other relevant information\n\n`;
  body += `Please include the RFP ID [${rfp._id}] in your response subject line.\n\n`;
  body += `Thank you,\nRFP Management System`;

  return body;
};

/**
 * Process inbound email (called by webhook)
 * @param {Object} emailData - Email data from webhook
 * @returns {Promise<Object>} Processing result
 */
const processInboundEmail = async (emailData) => {
  const { from, to, subject, text, html, messageId } = emailData;

  // Extract email body (prefer text over html)
  const emailBody = text || (html ? stripHtml(html) : "");

  if (!emailBody) {
    throw new Error("Email body is empty");
  }

  // Try to extract RFP ID from subject
  // Format: "RFP: [Title] [ID: <rfpId>]" or "Re: RFP: [Title] [ID: <rfpId>]"
  const rfpIdMatch = subject.match(/\[ID:\s*([a-f0-9]{24})\]/i);
  if (!rfpIdMatch) {
    throw new Error("Could not extract RFP ID from email subject");
  }

  const rfpId = rfpIdMatch[1];

  // Find vendor by email
  const vendor = await Vendor.findOne({ email: from.toLowerCase() });
  if (!vendor) {
    throw new Error(`Vendor not found for email: ${from}`);
  }

  // Log email message
  const emailMessage = await EmailMessage.create({
    direction: "received",
    rfpId,
    vendorId: vendor._id,
    from,
    to,
    subject,
    body: emailBody,
    htmlBody: html,
    messageId,
    processed: false,
  });

  return {
    emailMessageId: emailMessage._id,
    rfpId,
    vendorId: vendor._id,
    emailBody,
  };
};

/**
 * Strip HTML tags from text (simple implementation)
 * @param {string} html - HTML string
 * @returns {string} Plain text
 */
const stripHtml = (html) => {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .trim();
};

module.exports = {
  sendRfpToVendors,
  processInboundEmail,
  initializeEmailTransporter,
};
