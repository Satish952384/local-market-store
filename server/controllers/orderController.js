/**
 * Order Controller
 * ----------------
 * Handles order creation and retrieval.
 * Customers can place orders; vendors can view orders for their products.
 */

const Order = require('../models/Order');
const Product = require('../models/Product');

/**
 * @route   POST /api/orders
 * @desc    Create a new order
 * @access  Private
 */
const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item'
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required'
      });
    }

    // Validate products and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product not found: ${item.productId}`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}`
        });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product: product._id,
        productName: product.name,
        quantity: item.quantity,
        price: product.price
      });

      // Reduce stock
      product.stock -= item.quantity;
      await product.save();
    }

    const order = await Order.create({
      customer: req.user._id,
      items: orderItems,
      totalAmount,
      shippingAddress,
      customerName: req.user.name,
      customerEmail: req.user.email
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error creating order'
    });
  }
};

/**
 * @route   GET /api/orders/my-orders
 * @desc    Get current user's orders
 * @access  Private
 */
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate('items.product', 'name imageUrl')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching orders'
    });
  }
};

/**
 * @route   GET /api/orders/:id
 * @desc    Get a single order by ID
 * @access  Private
 */
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name imageUrl price');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify the order belongs to the current user
    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching order'
    });
  }
};

/**
 * @route   GET /api/orders/vendor/orders
 * @desc    Get orders containing the vendor's products
 * @access  Private/Vendor
 */
const getVendorOrders = async (req, res) => {
  try {
    // Find all products by this vendor
    const vendorProducts = await Product.find({ vendor: req.user._id }).select('_id');
    const productIds = vendorProducts.map(p => p._id);

    // Find orders containing any of the vendor's products
    const orders = await Order.find({
      'items.product': { $in: productIds }
    })
      .populate('items.product', 'name imageUrl price')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching vendor orders'
    });
  }
};

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Update order status (vendor only)
 * @access  Private/Vendor
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.status = status;
    await order.save();

    res.json({
      success: true,
      message: 'Order status updated',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error updating order status'
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getVendorOrders,
  updateOrderStatus
};
