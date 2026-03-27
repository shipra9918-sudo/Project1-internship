const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const http = require('http');
const socketIO = require('socket.io');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

// SaaS routes
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const workspaceRoutes = require('./routes/workspaceRoutes');

// Import middleware
const { errorHandler } = require('./middleware/error');

// Import WebSocket service
const wsService = require('./services/websocket');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize WebSocket
const io = socketIO(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Initialize WebSocket service
wsService.initializeWebSocket(io);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ MongoDB Connected');
})
.catch((error) => {
  console.error('❌ MongoDB Connection Error:', error.message);
  process.exit(1);
});

// Health check route
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);

// SaaS Routes
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/workspaces', workspaceRoutes);

// Error Handler (must be last)
app.use(errorHandler);

// Server Configuration
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

server.listen(PORT, () => {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║   🚀 Hospitality Platform SaaS API Server               ║');
  console.log(`║   📡 Server running on port ${PORT}                         ║`);
  console.log(`║   🌐 Environment: ${NODE_ENV}                            ║`);
  console.log('║   📦 WebSocket: Enabled                                   ║');
  console.log('║   💼 SaaS Features: Active                                ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  server.close(() => process.exit(1));
});

module.exports = { app, server, io };
