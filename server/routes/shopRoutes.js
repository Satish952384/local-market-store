/**
 * Shop Routes
 * -----------
 * Public: browse shops
 * Private/Vendor: create, update, delete shops
 */

const express = require('express');
const router = express.Router();
const {
  createShop,
  getAllShops,
  getShopById,
  getMyShop,
  updateShop,
  deleteShop
} = require('../controllers/shopController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getAllShops);

// Protected vendor routes (must be before /:id to avoid conflict)
router.get('/my/shop', protect, authorize('vendor'), getMyShop);
router.post('/', protect, authorize('vendor'), createShop);
router.put('/:id', protect, authorize('vendor'), updateShop);
router.delete('/:id', protect, authorize('vendor'), deleteShop);

// Public: get single shop (after /my/shop to avoid route conflict)
router.get('/:id', getShopById);

module.exports = router;
