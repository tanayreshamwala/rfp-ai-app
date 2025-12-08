const mongoose = require("mongoose");

/**
 * RFP (Request for Proposal) Schema
 * Represents a procurement request that can be sent to vendors
 */
const rfpItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    specs: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const sentToVendorSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
    emailMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmailMessage",
    },
  },
  { _id: false }
);

const rfpSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    budgetAmount: {
      type: Number,
      min: 0,
    },
    budgetCurrency: {
      type: String,
      default: "USD",
      trim: true,
    },
    deliveryDeadline: {
      type: Date,
    },
    paymentTerms: {
      type: String,
      trim: true,
    },
    warrantyTerms: {
      type: String,
      trim: true,
    },
    items: {
      type: [rfpItemSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ["draft", "sent", "closed", "cancelled"],
      default: "draft",
    },
    sentToVendors: {
      type: [sentToVendorSchema],
      default: [],
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Indexes for better query performance
rfpSchema.index({ status: 1 });
rfpSchema.index({ createdAt: -1 });

const Rfp = mongoose.model("Rfp", rfpSchema);

module.exports = Rfp;
