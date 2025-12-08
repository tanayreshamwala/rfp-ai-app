const mongoose = require("mongoose");

/**
 * Vendor Schema
 * Represents a vendor/supplier that can receive RFPs and submit proposals
 */
const vendorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    category: {
      type: String,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    notes: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Indexes for better query performance
// vendorSchema.index({ email: 1 });
// vendorSchema.index({ name: 1 });
vendorSchema.index({ category: 1 });

const Vendor = mongoose.model("Vendor", vendorSchema);

module.exports = Vendor;
