/**
 * Product Controller
 * ------------------
 * Handles CRUD operations for products.
 * Vendors manage their own products; customers can browse all.
 */

const Product = require('../models/Product');
const Shop = require('../models/Shop');

/**
 * @route   POST /api/products
 * @desc    Create a new product (vendor only)
 * @access  Private/Vendor
 */
const createProduct = async (req, res) => {
  try {
    // Find the vendor's shop
    const shop = await Shop.findOne({ owner: req.user._id });
    if (!shop) {
      return res.status(400).json({
        success: false,
        message: 'You need to create a shop before adding products'
      });
    }

    const { name, description, price, imageUrl, category, stock } = req.body;

    const product = await Product.create({
      name,
      description,
      price,
      imageUrl: imageUrl || undefined,
      category: category || 'other',
      stock: stock || 0,
      shop: shop._id,
      vendor: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
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
      message: 'Server error creating product'
    });
  }
};

/**
 * @route   GET /api/products
 * @desc    Get all products with optional filtering
 * @query   category, search, minPrice, maxPrice, shop, page, limit
 * @access  Public
 */
const getAllProducts = async (req, res) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      shop,
      page = 1,
      limit = 20
    } = req.query;

    // Build filter object
    const filter = { isActive: true };

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (shop) {
      filter.shop = shop;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Text search (uses the text index on name and description)
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find(filter)
      .populate('shop', 'name')
      .populate('vendor', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      count: products.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching products'
    });
  }
};

/**
 * @route   GET /api/products/:id
 * @desc    Get a single product by ID
 * @access  Public
 */
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('shop', 'name description')
      .populate('vendor', 'name email');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching product'
    });
  }
};

/**
 * @route   GET /api/products/vendor/my-products
 * @desc    Get all products for the current vendor
 * @access  Private/Vendor
 */
const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ vendor: req.user._id })
      .populate('shop', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching your products'
    });
  }
};

/**
 * @route   PUT /api/products/:id
 * @desc    Update a product (owner vendor only)
 * @access  Private/Vendor
 */
const updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Verify ownership
    if (product.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own products'
      });
    }

    const { name, description, price, imageUrl, category, stock, isActive } = req.body;

    if (name) product.name = name;
    if (description) product.description = description;
    if (price !== undefined) product.price = price;
    if (imageUrl !== undefined) product.imageUrl = imageUrl;
    if (category) product.category = category;
    if (stock !== undefined) product.stock = stock;
    if (isActive !== undefined) product.isActive = isActive;

    await product.save();

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error updating product'
    });
  }
};

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete a product (owner vendor only)
 * @access  Private/Vendor
 */
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Verify ownership
    if (product.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own products'
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error deleting product'
    });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  getMyProducts,
  updateProduct,
  deleteProduct
};
