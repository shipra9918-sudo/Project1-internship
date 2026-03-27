# Hospitality Platform Backend

Multi-vertical hospitality platform with geospatial search, real-time tracking, and gamified reviews.

## Features

- 🔐 **JWT Authentication** - Secure user authentication with role-based access control
- 🗺️ **Geospatial Search** - MongoDB $geoNear aggregation for proximity-based restaurant discovery
- 📦 **Real-time Tracking** - WebSocket-based order status and courier location streaming
- 💳 **Payment Processing** - Mock payment gateway with transaction management
- 🎮 **Gamified Reviews** - AI-assisted review prompts with loyalty point rewards
- 🏪 **Merchant Dashboard** - Comprehensive order and menu management
- 🚴 **Courier Interface** - Route optimization and earnings tracking

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with 2dsphere indexing
- **Real-time**: Socket.io
- **Authentication**: JWT
- **NLP**: Natural, Compromise

## Installation

\`\`\`bash
npm install
\`\`\`

## Configuration

Create a \`.env\` file:

\`\`\`env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
FRONTEND_URL=http://localhost:5173
\`\`\`

## Running the Server

\`\`\`bash
# Development
npm run dev

# Production
npm start
\`\`\`

## API Endpoints

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user
- GET /api/auth/me - Get current user profile

### Restaurants
- GET /api/restaurants/discover - Geospatial restaurant discovery
- GET /api/restaurants/:id - Get restaurant details
- POST /api/restaurants - Create restaurant (Merchant)

### Orders
- POST /api/orders - Create new order
- GET /api/orders/my-orders - Get user orders
- PUT /api/orders/:id/status - Update order status

### Payments
- POST /api/payments/checkout - Process payment
- POST /api/payments/refund - Request refund

### Reviews
- POST /api/reviews - Submit review
- POST /api/reviews/suggest-keywords - Get AI keyword suggestions
- GET /api/reviews/restaurant/:id - Get restaurant reviews

## WebSocket Events

### Client → Server
- subscribeToOrder - Subscribe to order updates
- updateCourierLocation - Update courier GPS location
- toggleAvailability - Toggle courier availability

### Server → Client
- orderStatusUpdate - Order status changed
- courierLocationUpdate - Courier location updated
- newOrder - New order notification (Merchant)

## Database Indexes

Critical 2dsphere indexes:
- Restaurant.location
- User.address.location
- User.courierProfile.currentLocation
- Order.deliveryAddress.location

## Testing

\`\`\`bash
npm test
\`\`\`

## License

MIT
