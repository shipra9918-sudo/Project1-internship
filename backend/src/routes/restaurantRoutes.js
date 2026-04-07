const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const { createRestaurant } = require('../controllers/restaurantController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/discover', restaurantController.discoverRestaurants);
router.get('/search', restaurantController.searchRestaurants);
router.get('/my-restaurant', protect, authorize('merchant', 'admin'), restaurantController.getMyRestaurant);
router.get('/:id', restaurantController.getRestaurant);

// Protected routes (Merchant only)
router.post('/restaurants', protect, createRestaurant);
router.post('/', protect, authorize('merchant', 'admin'), restaurantController.createRestaurant);
router.put('/:id', protect, authorize('merchant', 'admin'), restaurantController.updateRestaurant);
router.put('/:id/menu/:itemId/toggle', protect, authorize('merchant', 'admin'), restaurantController.toggleMenuItem);

module.exports = router;
