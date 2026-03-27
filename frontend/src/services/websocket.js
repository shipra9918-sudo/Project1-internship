import { io } from 'socket.io-client';

const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL || 'http://localhost:5000';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(token) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(WEBSOCKET_URL, {
      auth: { token }
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  subscribeToOrder(orderId, callback) {
    if (!this.socket) return;
    
    this.socket.emit('subscribeToOrder', orderId);
    this.socket.on('orderStatusUpdate', callback);
    this.socket.on('courierLocationUpdate', callback);
  }

  unsubscribeFromOrder(orderId) {
    if (!this.socket) return;
    this.socket.emit('unsubscribeFromOrder', orderId);
  }

  updateCourierLocation(data) {
    if (!this.socket) return;
    this.socket.emit('updateCourierLocation', data);
  }

  joinRestaurant(restaurantId) {
    if (!this.socket) return;
    this.socket.emit('joinRestaurant', restaurantId);
  }

  onNewOrder(callback) {
    if (!this.socket) return;
    this.socket.on('newOrder', callback);
  }

  toggleAvailability(isAvailable) {
    if (!this.socket) return;
    this.socket.emit('toggleAvailability', isAvailable);
  }

  on(event, callback) {
    if (!this.socket) return;
    this.socket.on(event, callback);
  }

  off(event, callback) {
    if (!this.socket) return;
    this.socket.off(event, callback);
  }
}

export default new WebSocketService();
