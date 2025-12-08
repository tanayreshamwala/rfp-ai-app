const mongoose = require("mongoose");

/**
 * EmailMessage Schema
 * Logs all sent and received emails for audit trail and debugging
 */
const emailMessageSchema = new mongoose.Schema(
  {
    direction: {
      type: String,
      required: true,
      enum: ["sent", "received"],
    },
    // References
    rfpId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rfp",
      index: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      index: true,
    },
    proposalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Proposal", // For received emails that created proposals
    },
    // Email content
    from: {
      type: String,
      required: true,
      trim: true,
    },
    to: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true, // Plain text or HTML converted to text
    },
    htmlBody: {
      type: String, // Original HTML if available
    },
    // Metadata
    messageId: {
      type: String, // Email provider's message ID
      trim: true,
    },
    replyTo: {
      type: String,
      trim: true,
    },
    rawPayload: {
      type: mongoose.Schema.Types.Mixed, // Full webhook payload for debugging
    },
    // Status
    processed: {
      type: Boolean,
      default: false, // For received emails, whether AI parsing completed
    },
    error: {
      type: String, // Error message if processing failed
      trim: true,
    },
  },
  {
    timestamps: false, // We only want createdAt, not updatedAt
  }
);

// Add createdAt manually since we disabled timestamps
emailMessageSchema.add({
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for better query performance
emailMessageSchema.index({ rfpId: 1, direction: 1 });
emailMessageSchema.index({ vendorId: 1, direction: 1 });
emailMessageSchema.index({ createdAt: -1 });

const EmailMessage = mongoose.model("EmailMessage", emailMessageSchema);

module.exports = EmailMessage;
