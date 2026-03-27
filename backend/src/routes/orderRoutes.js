const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

// Consumer routes
router.post('/', protect, orderController.createOrder);
router.get('/my-orders', protect, orderController.getMyOrders);
router.get('/:id', protect, orderController.getOrder);

// Merchant routes
router.get('/merchant-orders', protect, authorize('merchant', 'admin'), orderController.getMerchantOrders);
router.get('/restaurant/:restaurantId', protect, authorize('merchant', 'admin'), orderController.getRestaurantOrders);
router.put('/:id/status', protect, authorize('merchant', 'courier', 'admin'), orderController.updateOrderStatus);

// Courier routes
router.get('/courier-deliveries', protect, authorize('courier', 'admin'), orderController.getCourierDeliveries);
router.put('/:id/accept-delivery', protect, authorize('courier', 'admin'), orderController.acceptDelivery);
router.put('/:id/complete-delivery', protect, authorize('courier', 'admin'), orderController.completeDelivery);

// System routes
router.put('/:id/assign-courier', protect, authorize('admin'), orderController.assignCourier);

module.exports = router;
