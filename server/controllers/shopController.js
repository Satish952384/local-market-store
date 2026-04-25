/**
 * Shop Controller
 * ---------------
 * Handles CRUD operations for vendor shops.
 * Only vendors can create/manage shops.
 */

const Shop = require('../models/Shop');

/**
 * @route   POST /api/shops
 * @desc    Create a new shop (vendor only)
 * @access  Private/Vendor
 */
const createShop = async (req, res) => {
  try {
    // Check if vendor already has a shop
    const existingShop = await Shop.findOne({ owner: req.user._id });
    if (existingShop) {
      return res.status(400).json({
        success: false,
        message: 'You already have a shop. Each vendor can only have one shop.'
      });
    }

    const { name, description, logo, category, address } = req.body;

    const shop = await Shop.create({
      name,
      description,
      owner: req.user._id,
      logo: logo || '',
      category: category || 'other',
      address: address || ''
    });

    res.status(201).json({
      success: true,
      message: 'Shop created successfully',
      data: shop
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error creating shop'
    });
  }
};

/**
 * @route   GET /api/shops
 * @desc    Get all active shops
 * @access  Public
 */
const getAllShops = async (req, res) => {
  try {
    const shops = await Shop.find({ isActive: true })
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: shops.length,
      data: shops
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching shops'
    });
  }
};

/**
 * @route   GET /api/shops/:id
 * @desc    Get a single shop by ID
 * @access  Public
 */
const getShopById = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id)
      .populate('owner', 'name email');

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    res.json({
      success: true,
      data: shop
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching shop'
    });
  }
};

/**
 * @route   GET /api/shops/my/shop
 * @desc    Get current vendor's shop
 * @access  Private/Vendor
 */
const getMyShop = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.user._id });

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'You have not created a shop yet'
      });
    }

    res.json({
      success: true,
      data: shop
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching your shop'
    });
  }
};

/**
 * @route   PUT /api/shops/:id
 * @desc    Update a shop (owner only)
 * @access  Private/Vendor
 */
const updateShop = async (req, res) => {
  try {
    let shop = await Shop.findById(req.params.id);

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    // Verify ownership
    if (shop.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own shop'
      });
    }

    const { name, description, logo, category, address, isActive } = req.body;

    if (name) shop.name = name;
    if (description) shop.description = description;
    if (logo !== undefined) shop.logo = logo;
    if (category) shop.category = category;
    if (address !== undefined) shop.address = address;
    if (isActive !== undefined) shop.isActive = isActive;

    await shop.save();

    res.json({
      success: true,
      message: 'Shop updated successfully',
      data: shop
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error updating shop'
    });
  }
};

/**
 * @route   DELETE /api/shops/:id
 * @desc    Delete a shop (owner only)
 * @access  Private/Vendor
 */
const deleteShop = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    // Verify ownership
    if (shop.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own shop'
      });
    }

    await Shop.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Shop deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error deleting shop'
    });
  }
};

module.exports = {
  createShop,
  getAllShops,
  getShopById,
  getMyShop,
  updateShop,
  deleteShop
};
