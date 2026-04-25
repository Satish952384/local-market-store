/**
 * Product Model
 * -------------
 * Represents individual products listed by vendors.
 * Each product belongs to a shop and is linked to a vendor.
 */

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    minlength: [2, 'Product name must be at least 2 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  imageUrl: {
    type: String,
    default: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'
  },
  category: {
    type: String,
    enum: ['grocery', 'clothing', 'electronics', 'food', 'handicrafts', 'books', 'health', 'other'],
    default: 'other'
  },
  stock: {
    type: Number,
    required: true,
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient searching and filtering
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ shop: 1 });
productSchema.index({ vendor: 1 });

module.exports = mongoose.model('Product', productSchema);
