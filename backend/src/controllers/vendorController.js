const Vendor = require("../models/Vendor");

/**
 * Vendor Controller
 * Handles HTTP requests for Vendor operations
 */

/**
 * Create vendor
 * POST /api/vendors
 */
const createVendor = async (req, res) => {
  try {
    const { name, email, category, tags, notes } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
    }

    const vendor = await Vendor.create({
      name,
      email,
      category: category || null,
      tags: tags || [],
      notes: notes || null,
    });

    res.status(201).json({
      success: true,
      data: vendor,
    });
  } catch (error) {
    console.error("Error creating vendor:", error);
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create vendor",
    });
  }
};

/**
 * Get all vendors
 * GET /api/vendors
 */
const getAllVendors = async (req, res) => {
  try {
    const query = {};

    // Filter by active status if provided
    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === "true";
    }

    // Filter by category if provided
    if (req.query.category) {
      query.category = req.query.category;
    }

    const vendors = await Vendor.find(query).sort({ name: 1 }).lean();

    res.status(200).json({
      success: true,
      count: vendors.length,
      data: vendors,
    });
  } catch (error) {
    console.error("Error fetching vendors:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch vendors",
    });
  }
};

/**
 * Get vendor by ID
 * GET /api/vendors/:id
 */
const getVendorById = async (req, res) => {
  try {
    const { id } = req.params;

    const vendor = await Vendor.findById(id).lean();

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    res.status(200).json({
      success: true,
      data: vendor,
    });
  } catch (error) {
    console.error("Error fetching vendor:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch vendor",
    });
  }
};

/**
 * Update vendor
 * PUT /api/vendors/:id
 */
const updateVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.createdAt;

    const vendor = await Vendor.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).lean();

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    res.status(200).json({
      success: true,
      data: vendor,
    });
  } catch (error) {
    console.error("Error updating vendor:", error);
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update vendor",
    });
  }
};

/**
 * Delete vendor
 * DELETE /api/vendors/:id
 */
const deleteVendor = async (req, res) => {
  try {
    const { id } = req.params;

    const vendor = await Vendor.findByIdAndDelete(id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Vendor deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting vendor:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete vendor",
    });
  }
};

module.exports = {
  createVendor,
  getAllVendors,
  getVendorById,
  updateVendor,
  deleteVendor,
};
