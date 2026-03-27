const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Ensure geospatial indexes are created
    await ensureIndexes();
    
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

const ensureIndexes = async () => {
  try {
    const Restaurant = require('../models/Restaurant');
    const User = require('../models/User');
    const Order = require('../models/Order');
    
    // Ensure 2dsphere indexes are created
    await Restaurant.collection.createIndex({ location: '2dsphere' });
    await User.collection.createIndex({ 'address.location': '2dsphere' });
    await User.collection.createIndex({ 'courierProfile.currentLocation': '2dsphere' });
    await Order.collection.createIndex({ 'deliveryAddress.location': '2dsphere' });
    
    console.log('✅ Geospatial indexes verified');
  } catch (error) {
    console.error('⚠️  Index creation warning:', error.message);
  }
};

module.exports = connectDB;
