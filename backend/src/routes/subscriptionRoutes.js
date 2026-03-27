const express = require('express');
const router = express.Router();
const {
  getPricingPlans,
  getCurrentSubscription,
  subscribe,
  cancelSubscription,
  getUsageStats,
  getInvoices
} = require('../controllers/subscriptionController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/pricing', getPricingPlans);

// Protected routes
router.use(protect);
router.get('/current', getCurrentSubscription);
router.post('/subscribe', subscribe);
router.post('/cancel', cancelSubscription);
router.get('/usage', getUsageStats);
router.get('/invoices', getInvoices);

module.exports = router;
