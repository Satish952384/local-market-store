/**
 * Product Routes
 * --------------
 * Public: browse/search products
 * Private/Vendor: create, update, delete products
 */

const express = require('express');
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  getProductById,
  getMyProducts,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getAllProducts);

// Protected vendor routes (before /:id to avoid route conflict)
router.get('/vendor/my-products', protect, authorize('vendor'), getMyProducts);
router.post('/', protect, authorize('vendor'), createProduct);
router.put('/:id', protect, authorize('vendor'), updateProduct);
router.delete('/:id', protect, authorize('vendor'), deleteProduct);

// Public: single product (after /vendor/* routes to avoid conflict)
router.get('/:id', getProductById);

module.exports = router;
