const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/restaurant/:restaurantId', reviewController.getRestaurantReviews);

// Protected routes
router.post('/', protect, reviewController.createReview);
router.post('/suggest-keywords', protect, reviewController.suggestKeywords);
router.put('/:id/helpful', protect, reviewController.markHelpful);
router.put('/:id/respond', protect, authorize('merchant', 'admin'), reviewController.respondToReview);

module.exports = router;
