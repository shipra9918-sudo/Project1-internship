const mongoose = require('mongoose');
require('dotenv').config();

console.log('🔍 Testing MongoDB Connection...\n');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully!');
    console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
    console.log(`📝 Port: ${mongoose.connection.port}`);
    
    // Test creating indexes
    return Promise.all([
      mongoose.connection.db.collection('restaurants').createIndex({ location: '2dsphere' }),
      mongoose.connection.db.collection('users').createIndex({ 'address.location': '2dsphere' })
    ]);
  })
  .then(() => {
    console.log('✅ Geospatial indexes created');
    console.log('\n✨ All tests passed! Your database is ready.\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ MongoDB Connection Failed!');
    console.error(`\nError: ${error.message}\n`);
    console.log('💡 Solutions:');
    console.log('   1. Install MongoDB locally: https://www.mongodb.com/try/download/community');
    console.log('   2. Use MongoDB Atlas (free cloud): https://www.mongodb.com/cloud/atlas/register');
    console.log('   3. Update MONGODB_URI in .env file with your connection string\n');
    process.exit(1);
  });
