const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Order = require('../models/Order');

let io;

// Throttle interval for persisting courier GPS coordinates to the database (ms)
const LOCATION_DB_WRITE_INTERVAL_MS = 10000; // write at most once every 10 seconds

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

    // Per-socket tracker: last time we persisted this courier's location to the DB
    socket._lastLocationWriteAt = 0;

    // Courier location update (real-time tracking)
    socket.on('updateCourierLocation', async (data) => {
      try {
        if (socket.user.role !== 'courier') {
          socket.emit('error', { message: 'Only couriers can update location' });
          return;
        }

        const { orderId, longitude, latitude } = data;
        const lng = parseFloat(longitude);
        const lat = parseFloat(latitude);

        // Always broadcast the live position to all order subscribers immediately
        io.to(`order-${orderId}`).emit('courierLocationUpdate', {
          orderId,
          location: { longitude: lng, latitude: lat },
          timestamp: new Date()
        });

        // Persist to the database at most once per LOCATION_DB_WRITE_INTERVAL_MS
        // to avoid hammering MongoDB on every GPS ping (which can arrive every 2-5 s)
        const now = Date.now();
        if (now - socket._lastLocationWriteAt < LOCATION_DB_WRITE_INTERVAL_MS) return;
        socket._lastLocationWriteAt = now;

        const order = await Order.findById(orderId);
        if (!order || order.courier?.toString() !== socket.user.id) {
          socket.emit('error', { message: 'Order not found or not assigned to you' });
          return;
        }

        const geoPoint = { type: 'Point', coordinates: [lng, lat] };

        // Use updateOne to avoid loading the full document just for a location field
        await Order.updateOne({ _id: orderId }, { $set: { courierLocation: geoPoint } });
        await User.updateOne(
          { _id: socket.user.id },
          { $set: { 'courierProfile.currentLocation': geoPoint } }
        );

        console.log(`📍 Courier ${socket.user.name} location persisted for order ${orderId}`);
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
    // Only the server-side (via emitNewOrderToMerchant) should trigger this;
    // guard against any consumer/courier spoofing fake order alerts.
    socket.on('newOrderForRestaurant', (data) => {
      if (socket.user.role !== 'merchant' && socket.user.role !== 'admin') {
        socket.emit('error', { message: 'Not authorized to broadcast order events' });
        return;
      }

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
