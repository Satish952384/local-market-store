/**
 * Shop Model
 * ----------
 * Represents a vendor's shop/storefront.
 * Each vendor can have one shop. The shop acts as
 * the container for all their products.
 */

const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Shop name is required'],
    trim: true,
    minlength: [2, 'Shop name must be at least 2 characters']
  },
  description: {
    type: String,
    required: [true, 'Shop description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // One shop per vendor
  },
  logo: {
    type: String,
    default: '' // URL to shop logo/image
  },
  category: {
    type: String,
    enum: ['grocery', 'clothing', 'electronics', 'food', 'handicrafts', 'books', 'health', 'other'],
    default: 'other'
  },
  address: {
    type: String,
    trim: true,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Shop', shopSchema);
