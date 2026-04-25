/**
 * Order Routes
 * ------------
 * Private: create orders, view own orders
 * Private/Vendor: view vendor orders, update order status
 */

const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getVendorOrders,
  updateOrderStatus
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

// All order routes are protected
router.use(protect);

// Customer routes
router.post('/', createOrder);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrderById);

// Vendor routes
router.get('/vendor/orders', authorize('vendor'), getVendorOrders);
router.put('/:id/status', authorize('vendor'), updateOrderStatus);

module.exports = router;
