const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const User = require('../models/User');

// @desc    Create new order with cart validation
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const { restaurantId, items, orderType, deliveryAddress, tableReservation, paymentMethod } = req.body;

    // Validate restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    if (!restaurant.isActive || !restaurant.isOpen) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant is currently closed'
      });
    }

    // Validate all items exist and are available
    const validatedItems = [];
    let subtotal = 0;

    for (const item of items) {
      const menuItem = restaurant.menu.id(item.menuItem);
      
      if (!menuItem) {
        return res.status(400).json({
          success: false,
          message: `Menu item ${item.menuItem} not found`
        });
      }

      if (!menuItem.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `${menuItem.name} is currently unavailable`
        });
      }

      validatedItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
        specialInstructions: item.specialInstructions
      });

      subtotal += menuItem.price * item.quantity;
    }

    // Check minimum order
    if (subtotal < restaurant.minimumOrder) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount is $${restaurant.minimumOrder}`
      });
    }

    // Calculate pricing
    const deliveryFee = orderType === 'delivery' ? restaurant.deliveryFee : 0;
    const tax = subtotal * 0.08;
    const total = subtotal + deliveryFee + tax;

    // Estimate delivery time
    let estimatedDeliveryTime = null;
    if (orderType === 'delivery') {
      const prepTime = items.reduce((max, item) => {
        const menuItem = restaurant.menu.id(item.menuItem);
        return Math.max(max, menuItem.preparationTime || 15);
      }, 0);
      
      estimatedDeliveryTime = new Date(Date.now() + (prepTime + restaurant.estimatedDeliveryTime) * 60000);
    }

    // Create order
    const order = await Order.create({
      customer: req.user.id,
      restaurant: restaurantId,
      items: validatedItems,
      orderType,
      deliveryAddress: orderType === 'delivery' ? deliveryAddress : undefined,
      tableReservation: orderType === 'dineIn' ? tableReservation : undefined,
      pricing: {
        subtotal,
        deliveryFee,
        tax,
        total
      },
      payment: {
        method: paymentMethod,
        status: 'pending'
      },
      estimatedDeliveryTime,
      preparationTime: items.reduce((max, item) => {
        const menuItem = restaurant.menu.id(item.menuItem);
        return Math.max(max, menuItem.preparationTime || 15);
      }, 0)
    });

    // Calculate total
    order.calculateTotal();
    await order.save();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user orders
// @route   GET /api/orders/my-orders
// @access  Private
exports.getMyOrders = async (req, res, next) => {
  try {
    const { status, limit = 20, page = 1 } = req.query;

    const query = { customer: req.user.id };
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('restaurant', 'name address coverImage')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: { orders }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('restaurant', 'name address phone')
      .populate('courier', 'name phone courierProfile.vehicleType');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization
    const isAuthorized = 
      order.customer._id.toString() === req.user.id ||
      order.restaurant.owner?.toString() === req.user.id ||
      order.courier?._id.toString() === req.user.id ||
      req.user.role === 'admin';

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.status(200).json({
      success: true,
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get courier's deliveries
// @route   GET /api/orders/courier-deliveries
// @access  Private (Courier only)
exports.getCourierDeliveries = async (req, res, next) => {
  try {
    // Show orders that are either ready for pickup or assigned to this courier
    const orders = await Order.find({
      $or: [
        { status: 'ready', orderType: 'delivery' },
        { courier: req.user.id }
      ]
    })
    .populate('restaurant', 'name address location')
    .populate('customer', 'name phone address')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: { orders }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept delivery
// @route   PUT /api/orders/:id/accept-delivery
// @access  Private (Courier only)
exports.acceptDelivery = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.status !== 'ready') {
      return res.status(400).json({
        success: false,
        message: 'Order is not ready for delivery'
      });
    }

    if (order.courier) {
      return res.status(400).json({
        success: false,
        message: 'Order already assigned to another courier'
      });
    }

    order.courier = req.user.id;
    order.status = 'dispatched';
    await order.updateStatus('dispatched', `Courier ${req.user.name} accepted delivery`);

    res.status(200).json({
      success: true,
      message: 'Delivery accepted',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete delivery
// @route   PUT /api/orders/:id/complete-delivery
// @access  Private (Courier only)
exports.completeDelivery = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.courier?.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to complete this delivery'
      });
    }

    order.status = 'delivered';
    order.actualDeliveryTime = new Date();
    await order.updateStatus('delivered', 'Order delivered successfully');

    // Update courier stats
    req.user.courierProfile.totalDeliveries += 1;
    req.user.courierProfile.earnings += order.pricing.deliveryFee;
    await req.user.save();

    res.status(200).json({
      success: true,
      message: 'Delivery completed',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (Merchant/Courier)
// @route   PUT /api/orders/:id/status
// @access  Private
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id).populate('restaurant');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization
    const isMerchant = order.restaurant.owner.toString() === req.user.id;
    const isCourier = order.courier?.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isMerchant && !isCourier && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this order'
      });
    }

    await order.updateStatus(status, note);

    // Emit WebSocket event
    if (global.io) {
      global.io.to(`order-${order._id}`).emit('orderStatusUpdate', {
        orderId: order._id,
        status: order.status,
        timestamp: new Date()
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order status updated',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign courier to order
// @route   PUT /api/orders/:id/assign-courier
// @access  Private (Admin/System)
exports.assignCourier = async (req, res, next) => {
  try {
    const { courierId } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const courier = await User.findById(courierId);
    if (!courier || courier.role !== 'courier') {
      return res.status(400).json({
        success: false,
        message: 'Invalid courier'
      });
    }

    order.courier = courierId;
    await order.updateStatus('dispatched', `Assigned to courier ${courier.name}`);

    res.status(200).json({
      success: true,
      message: 'Courier assigned successfully',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

//// @desc    Get merchant's restaurant orders
// @route   GET /api/orders/merchant-orders
// @access  Private (Merchant only)
exports.getMerchantOrders = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user.id });
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'No restaurant found for this merchant'
      });
    }

    const orders = await Order.find({ restaurant: restaurant._id })
      .populate('customer', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: { orders }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get restaurant orders
// @route   GET /api/orders/restaurant/:restaurantId
// @access  Private
exports.getRestaurantOrders = async (req, res, next) => {
  try {
    const { status, startDate, endDate, limit = 50, page = 1 } = req.query;
    const restaurant = await Restaurant.findById(req.params.restaurantId);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Check ownership
    if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const query = { restaurant: req.params.restaurantId };
    
    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(query)
      .populate('customer', 'name phone')
      .populate('courier', 'name phone')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Order.countDocuments(query);

    // Calculate statistics
    const stats = await Order.aggregate([
      { $match: { restaurant: restaurant._id } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$pricing.total' },
          averageOrderValue: { $avg: '$pricing.total' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      stats: stats[0] || { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0 },
      data: { orders }
    });
  } catch (error) {
    next(error);
  }
};
