const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const http = require('http');
const socketIO = require('socket.io');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

// Import DB connection (also calls ensureIndexes after connect)
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/authRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');

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
app.disable('x-powered-by');

// Initialize WebSocket
const io = socketIO(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});
global.io = io;

// Initialize WebSocket service
wsService.initializeWebSocket(io);

// Middleware
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(compression());
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 250,
  standardHeaders: true,
  legacyHeaders: false
}));

// MongoDB Connection (uses connectDB which also ensures geospatial indexes)
connectDB();

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
app.use('/api/chatbot', chatbotRoutes);

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
