/**
 * Order Model
 * -----------
 * Represents customer orders containing one or more products.
 * Tracks order status from 'pending' through to 'delivered'.
 */

const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: true
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: {
    type: [orderItemSchema],
    validate: [arr => arr.length > 0, 'Order must have at least one item']
  },
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  shippingAddress: {
    type: String,
    required: [true, 'Shipping address is required'],
    trim: true
  },
  customerName: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

orderSchema.index({ customer: 1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);
