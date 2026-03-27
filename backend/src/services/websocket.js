const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Order = require('../models/Order');

let io;

const initializeWebSocket = (ioInstance) => {
  io = ioInstance;

  // Authentication middleware for WebSocket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.user.name} (${socket.user.role})`);

    // Join user-specific room
    socket.join(`user-${socket.user.id}`);

    // Join role-specific room
    socket.join(`role-${socket.user.role}`);

    // Subscribe to specific order updates
    socket.on('subscribeToOrder', async (orderId) => {
      try {
        const order = await Order.findById(orderId);
        
        if (!order) {
          socket.emit('error', { message: 'Order not found' });
          return;
        }

        // Verify user has access to this order
        const hasAccess = 
          order.customer.toString() === socket.user.id ||
          order.courier?.toString() === socket.user.id ||
          socket.user.role === 'admin';

        if (hasAccess) {
          socket.join(`order-${orderId}`);
          socket.emit('subscribed', { orderId, currentStatus: order.status });
          console.log(`📦 User ${socket.user.name} subscribed to order ${orderId}`);
        } else {
          socket.emit('error', { message: 'Not authorized to view this order' });
        }
      } catch (error) {
        socket.emit('error', { message: 'Failed to subscribe to order' });
      }
    });

    // Unsubscribe from order updates
    socket.on('unsubscribeFromOrder', (orderId) => {
      socket.leave(`order-${orderId}`);
      console.log(`📦 User ${socket.user.name} unsubscribed from order ${orderId}`);
    });

    // Courier location update (real-time tracking)
    socket.on('updateCourierLocation', async (data) => {
      try {
        if (socket.user.role !== 'courier') {
          socket.emit('error', { message: 'Only couriers can update location' });
          return;
        }

        const { orderId, longitude, latitude } = data;
        const order = await Order.findById(orderId);

        if (!order || order.courier?.toString() !== socket.user.id) {
          socket.emit('error', { message: 'Order not found or not assigned to you' });
          return;
        }

        // Update courier location in order
        order.courierLocation = {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)]
        };
        await order.save();

        // Update user's courier profile location
        socket.user.courierProfile.currentLocation = {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)]
        };
        await socket.user.save();

        // Broadcast location to all subscribers of this order
        io.to(`order-${orderId}`).emit('courierLocationUpdate', {
          orderId,
          location: { longitude, latitude },
          timestamp: new Date()
        });

        console.log(`📍 Courier ${socket.user.name} location updated for order ${orderId}`);
      } catch (error) {
        socket.emit('error', { message: 'Failed to update location' });
      }
    });

    // Order status update notification
    socket.on('orderStatusChanged', async (data) => {
      try {
        const { orderId, status, note } = data;
        
        // Broadcast to all order subscribers
        io.to(`order-${orderId}`).emit('orderStatusUpdate', {
          orderId,
          status,
          note,
          timestamp: new Date()
        });

        // Notify customer specifically
        const order = await Order.findById(orderId);
        if (order) {
          io.to(`user-${order.customer}`).emit('notification', {
            type: 'order_status',
            message: `Your order status: ${status}`,
            orderId,
            timestamp: new Date()
          });
        }
      } catch (error) {
        console.error('Error broadcasting order status:', error);
      }
    });

    // New order notification for merchants
    socket.on('newOrderForRestaurant', (data) => {
      const { restaurantId, orderId } = data;
      
      // Notify all merchants connected to this restaurant
      io.to(`restaurant-${restaurantId}`).emit('newOrder', {
        orderId,
        timestamp: new Date()
      });
    });

    // Merchant joins restaurant room
    socket.on('joinRestaurant', (restaurantId) => {
      if (socket.user.role === 'merchant' || socket.user.role === 'admin') {
        socket.join(`restaurant-${restaurantId}`);
        console.log(`🏪 Merchant ${socket.user.name} joined restaurant ${restaurantId}`);
      }
    });

    // Courier availability toggle
    socket.on('toggleAvailability', async (isAvailable) => {
      try {
        if (socket.user.role !== 'courier') {
          socket.emit('error', { message: 'Only couriers can toggle availability' });
          return;
        }

        socket.user.courierProfile.isAvailable = isAvailable;
        await socket.user.save();

        socket.emit('availabilityUpdated', { isAvailable });
        console.log(`🚴 Courier ${socket.user.name} availability: ${isAvailable}`);
      } catch (error) {
        socket.emit('error', { message: 'Failed to update availability' });
      }
    });

    // Disconnect handler
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.user.name}`);
    });
  });

  // Make io globally available
  global.io = io;

  return io;
};

// Helper function to emit events from controllers
const emitOrderUpdate = (orderId, status, data = {}) => {
  if (global.io) {
    global.io.to(`order-${orderId}`).emit('orderStatusUpdate', {
      orderId,
      status,
      ...data,
      timestamp: new Date()
    });
  }
};

const emitCourierLocation = (orderId, location) => {
  if (global.io) {
    global.io.to(`order-${orderId}`).emit('courierLocationUpdate', {
      orderId,
      location,
      timestamp: new Date()
    });
  }
};

const emitNewOrderToMerchant = (restaurantId, orderData) => {
  if (global.io) {
    global.io.to(`restaurant-${restaurantId}`).emit('newOrder', {
      order: orderData,
      timestamp: new Date()
    });
  }
};

module.exports = {
  initializeWebSocket,
  emitOrderUpdate,
  emitCourierLocation,
  emitNewOrderToMerchant
};
