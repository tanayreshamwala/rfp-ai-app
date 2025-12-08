const mongoose = require("mongoose");

/**
 * Proposal Schema
 * Represents a vendor's response to an RFP, parsed from email using AI
 */
const proposalItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    quantity: {
      type: Number,
      min: 0,
    },
    unitPrice: {
      type: Number,
      min: 0,
    },
    totalPrice: {
      type: Number,
      min: 0,
    },
    specs: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const parsedDataSchema = new mongoose.Schema(
  {
    items: {
      type: [proposalItemSchema],
      default: [],
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "USD",
      trim: true,
    },
    deliveryDays: {
      type: Number,
      min: 0,
    },
    paymentTerms: {
      type: String,
      trim: true,
    },
    warranty: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    otherTerms: {
      type: mongoose.Schema.Types.Mixed, // Flexible for additional fields
    },
  },
  { _id: false }
);

const proposalSchema = new mongoose.Schema(
  {
    rfpId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rfp",
      required: true,
      index: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },
    // Raw email data
    rawEmailBody: {
      type: String,
      required: true,
    },
    emailMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmailMessage",
    },
    // Parsed structured data (from AI)
    parsed: {
      type: parsedDataSchema,
      required: true,
    },
    // AI comparison results (populated when comparison is run)
    aiScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    aiSummary: {
      type: String,
      trim: true,
    },
    aiPros: {
      type: [String],
      default: [],
    },
    aiCons: {
      type: [String],
      default: [],
    },
    aiRecommendation: {
      type: Boolean,
      default: false, // true if this is the recommended vendor
    },
    // Status
    status: {
      type: String,
      enum: ["pending", "reviewed", "accepted", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Compound index to ensure one proposal per vendor per RFP
proposalSchema.index({ rfpId: 1, vendorId: 1 }, { unique: true });
// proposalSchema.index({ rfpId: 1 });
proposalSchema.index({ aiScore: -1 }); // For sorting by score

const Proposal = mongoose.model("Proposal", proposalSchema);

module.exports = Proposal;
