const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/checkout', protect, paymentController.processCheckout);
router.get('/verify/:transactionId', protect, paymentController.verifyPayment);
router.post('/refund', protect, paymentController.requestRefund);
router.get('/history', protect, paymentController.getPaymentHistory);

module.exports = router;
