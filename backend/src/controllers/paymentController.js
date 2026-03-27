const Order = require('../models/Order');
const User = require('../models/User');
const paymentService = require('../services/paymentService');
const { emitOrderUpdate } = require('../services/websocket');

// @desc    Process checkout and payment
// @route   POST /api/payments/checkout
// @access  Private
exports.processCheckout = async (req, res, next) => {
  try {
    const { orderId, paymentMethod, cardNumber, cvv, expiryDate } = req.body;

    // Find order
    const order = await Order.findById(orderId).populate('restaurant');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify order belongs to user
    if (order.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to pay for this order'
      });
    }

    // Check if already paid
    if (order.payment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Order already paid'
      });
    }

    // Update payment status to processing
    order.payment.status = 'processing';
    await order.save();

    // Process payment through mock gateway
    const paymentResult = await paymentService.processPayment({
      amount: order.pricing.total,
      method: paymentMethod,
      cardNumber,
      orderId: order._id.toString()
    });

    if (!paymentResult.success) {
      // Payment failed
      order.payment.status = 'failed';
      await order.save();

      return res.status(400).json({
        success: false,
        message: paymentResult.message || 'Payment processing failed',
        errorCode: paymentResult.errorCode
      });
    }

    // Payment successful
    order.payment.status = 'completed';
    order.payment.transactionId = paymentResult.transactionId;
    order.payment.paidAt = new Date();
    order.status = 'accepted';
    await order.save();

    // Calculate and award loyalty points
    const pointsEarned = Math.floor(order.pricing.total * 0.1); // 10% of order value
    await req.user.addLoyaltyPoints(pointsEarned);
    order.loyaltyPointsEarned = pointsEarned;
    await order.save();

    // Update restaurant stats
    order.restaurant.totalOrders += 1;
    order.restaurant.totalRevenue += order.pricing.total;
    await order.restaurant.save();

    // Emit WebSocket event
    emitOrderUpdate(order._id, 'accepted', {
      message: 'Payment successful, order accepted'
    });

    res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        order,
        transaction: {
          id: paymentResult.transactionId,
          amount: paymentResult.amount,
          timestamp: paymentResult.timestamp
        },
        loyaltyPointsEarned: pointsEarned,
        totalLoyaltyPoints: req.user.loyaltyPoints
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify payment transaction
// @route   GET /api/payments/verify/:transactionId
// @access  Private
exports.verifyPayment = async (req, res, next) => {
  try {
    const { transactionId } = req.params;

    const verification = paymentService.verifyTransaction(transactionId);

    if (!verification.success) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.status(200).json({
      success: true,
      data: verification.transaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request refund
// @route   POST /api/payments/refund
// @access  Private
exports.requestRefund = async (req, res, next) => {
  try {
    const { orderId, reason } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify order belongs to user or is admin
    if (order.customer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Check if order is eligible for refund
    if (order.payment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Order payment not completed'
      });
    }

    if (order.status === 'delivered' || order.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot refund completed orders'
      });
    }

    // Process refund
    const refundResult = await paymentService.refundPayment(order.payment.transactionId);

    if (!refundResult.success) {
      return res.status(400).json({
        success: false,
        message: refundResult.message
      });
    }

    // Update order
    order.payment.status = 'refunded';
    order.status = 'cancelled';
    await order.updateStatus('cancelled', `Refunded: ${reason}`);

    // Deduct loyalty points if they were awarded
    if (order.loyaltyPointsEarned > 0) {
      req.user.loyaltyPoints = Math.max(0, req.user.loyaltyPoints - order.loyaltyPointsEarned);
      await req.user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        refundId: refundResult.refundId,
        amount: refundResult.amount,
        timestamp: refundResult.timestamp
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment history
// @route   GET /api/payments/history
// @access  Private
exports.getPaymentHistory = async (req, res, next) => {
  try {
    const { limit = 20, page = 1 } = req.query;

    const orders = await Order.find({
      customer: req.user.id,
      'payment.status': 'completed'
    })
      .populate('restaurant', 'name')
      .select('orderNumber pricing payment createdAt')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Order.countDocuments({
      customer: req.user.id,
      'payment.status': 'completed'
    });

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: { payments: orders }
    });
  } catch (error) {
    next(error);
  }
};
