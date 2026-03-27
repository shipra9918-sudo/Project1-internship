require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('./src/models/User');
const Restaurant = require('./src/models/Restaurant');
const Order = require('./src/models/Order');
const Review = require('./src/models/Review');

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// Sample data
const seedData = async () => {
  try {
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Restaurant.deleteMany({});
    await Order.deleteMany({});
    await Review.deleteMany({});

    // Create Users
    console.log('👥 Creating users...');
    
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const merchant = await User.create({
      name: 'John Merchant',
      email: 'merchant@example.com',
      password: hashedPassword,
      role: 'merchant',
      phone: '+1 (555) 100-0001',
      address: {
        street: '123 Business Ave',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        location: {
          type: 'Point',
          coordinates: [-74.006, 40.7128] // NYC coordinates
        }
      },
      loyaltyPoints: 0
    });

    const customer = await User.create({
      name: 'Jane Customer',
      email: 'customer@example.com',
      password: hashedPassword,
      role: 'consumer',
      phone: '+1 (555) 200-0002',
      address: {
        street: '456 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10002',
        location: {
          type: 'Point',
          coordinates: [-73.995, 40.720]
        }
      },
      loyaltyPoints: 150
    });

    const courier = await User.create({
      name: 'Mike Courier',
      email: 'courier@example.com',
      password: hashedPassword,
      role: 'courier',
      phone: '+1 (555) 300-0003',
      courierProfile: {
        vehicleType: 'bike',
        licenseNumber: 'COU-12345',
        isAvailable: true,
        currentLocation: {
          type: 'Point',
          coordinates: [-74.000, 40.715]
        },
        totalDeliveries: 48,
        earnings: 1250.50
      }
    });

    console.log('✅ Users created:', merchant.email, customer.email, courier.email);

    // Create Restaurants
    console.log('🍕 Creating restaurants...');

    const pizzaPalace = await Restaurant.create({
      name: 'Pizza Palace',
      owner: merchant._id,
      description: 'Authentic Italian pizza with fresh ingredients and traditional recipes passed down through generations.',
      cuisineType: ['italian', 'american'],
      location: {
        type: 'Point',
        coordinates: [-74.005, 40.718] // Close to customer
      },
      address: {
        street: '789 Pizza Lane',
        city: 'New York',
        state: 'NY',
        zipCode: '10003',
        country: 'USA'
      },
      phone: '+1 (555) 400-0004',
      email: 'info@pizzapalace.com',
      menu: [
        {
          name: 'Margherita Pizza',
          description: 'Classic tomato sauce, fresh mozzarella, basil',
          price: 14.99,
          category: 'main',
          image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002',
          isAvailable: true,
          preparationTime: 20,
          dietary: { vegetarian: true, vegan: false, glutenFree: false, spicy: false },
          tags: ['popular', 'classic']
        },
        {
          name: 'Pepperoni Pizza',
          description: 'Tomato sauce, mozzarella, pepperoni',
          price: 16.99,
          category: 'main',
          image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e',
          isAvailable: true,
          preparationTime: 20,
          dietary: { vegetarian: false, vegan: false, glutenFree: false, spicy: false },
          tags: ['popular', 'bestseller']
        },
        {
          name: 'Veggie Supreme',
          description: 'Bell peppers, onions, mushrooms, olives, tomatoes',
          price: 15.99,
          category: 'main',
          isAvailable: true,
          preparationTime: 22,
          dietary: { vegetarian: true, vegan: false, glutenFree: false, spicy: false },
          tags: ['healthy', 'vegetarian']
        },
        {
          name: 'Caesar Salad',
          description: 'Romaine lettuce, parmesan, croutons, Caesar dressing',
          price: 8.99,
          category: 'appetizer',
          isAvailable: true,
          preparationTime: 10,
          dietary: { vegetarian: true, vegan: false, glutenFree: false, spicy: false }
        },
        {
          name: 'Tiramisu',
          description: 'Classic Italian dessert with espresso and mascarpone',
          price: 7.99,
          category: 'dessert',
          isAvailable: true,
          preparationTime: 5,
          dietary: { vegetarian: true, vegan: false, glutenFree: false, spicy: false }
        },
        {
          name: 'Coca Cola',
          description: 'Refreshing soft drink',
          price: 2.99,
          category: 'beverage',
          isAvailable: true,
          preparationTime: 2,
          dietary: { vegetarian: true, vegan: true, glutenFree: true, spicy: false }
        }
      ],
      rating: {
        average: 4.5,
        count: 127
      },
      priceRange: '$$',
      operatingHours: {
        monday: { open: '11:00', close: '22:00', isClosed: false },
        tuesday: { open: '11:00', close: '22:00', isClosed: false },
        wednesday: { open: '11:00', close: '22:00', isClosed: false },
        thursday: { open: '11:00', close: '22:00', isClosed: false },
        friday: { open: '11:00', close: '23:00', isClosed: false },
        saturday: { open: '11:00', close: '23:00', isClosed: false },
        sunday: { open: '12:00', close: '21:00', isClosed: false }
      },
      features: {
        delivery: true,
        dineIn: true,
        tableReservation: true,
        takeout: true
      },
      deliveryFee: 3.99,
      minimumOrder: 15,
      deliveryRadius: 10,
      estimatedDeliveryTime: 35,
      coverImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591',
      isActive: true,
      isOpen: true,
      totalOrders: 342,
      totalRevenue: 8540.50,
      tags: ['italian', 'pizza', 'family-friendly']
    });

    const sushiExpress = await Restaurant.create({
      name: 'Sushi Express',
      owner: merchant._id,
      description: 'Fresh sushi and Japanese cuisine prepared by expert chefs with premium ingredients.',
      cuisineType: ['japanese'],
      location: {
        type: 'Point',
        coordinates: [-74.010, 40.725]
      },
      address: {
        street: '321 Sushi Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10004',
        country: 'USA'
      },
      phone: '+1 (555) 500-0005',
      email: 'contact@sushiexpress.com',
      menu: [
        {
          name: 'California Roll',
          description: 'Crab, avocado, cucumber',
          price: 12.99,
          category: 'main',
          isAvailable: true,
          preparationTime: 15,
          dietary: { vegetarian: false, vegan: false, glutenFree: true, spicy: false },
          tags: ['popular', 'classic']
        },
        {
          name: 'Spicy Tuna Roll',
          description: 'Fresh tuna, spicy mayo, cucumber',
          price: 14.99,
          category: 'main',
          isAvailable: true,
          preparationTime: 15,
          dietary: { vegetarian: false, vegan: false, glutenFree: true, spicy: true },
          tags: ['spicy', 'popular']
        },
        {
          name: 'Salmon Nigiri (6 pcs)',
          description: 'Fresh salmon over sushi rice',
          price: 16.99,
          category: 'main',
          isAvailable: true,
          preparationTime: 12,
          dietary: { vegetarian: false, vegan: false, glutenFree: true, spicy: false }
        },
        {
          name: 'Edamame',
          description: 'Steamed soybeans with sea salt',
          price: 5.99,
          category: 'appetizer',
          isAvailable: true,
          preparationTime: 8,
          dietary: { vegetarian: true, vegan: true, glutenFree: true, spicy: false },
          tags: ['healthy', 'vegan']
        },
        {
          name: 'Miso Soup',
          description: 'Traditional Japanese soup with tofu and seaweed',
          price: 3.99,
          category: 'appetizer',
          isAvailable: true,
          preparationTime: 5,
          dietary: { vegetarian: true, vegan: true, glutenFree: true, spicy: false }
        },
        {
          name: 'Green Tea',
          description: 'Hot Japanese green tea',
          price: 2.99,
          category: 'beverage',
          isAvailable: true,
          preparationTime: 3,
          dietary: { vegetarian: true, vegan: true, glutenFree: true, spicy: false }
        }
      ],
      rating: {
        average: 4.7,
        count: 89
      },
      priceRange: '$$$',
      operatingHours: {
        monday: { open: '12:00', close: '21:00', isClosed: false },
        tuesday: { open: '12:00', close: '21:00', isClosed: false },
        wednesday: { open: '12:00', close: '21:00', isClosed: false },
        thursday: { open: '12:00', close: '21:00', isClosed: false },
        friday: { open: '12:00', close: '22:00', isClosed: false },
        saturday: { open: '12:00', close: '22:00', isClosed: false },
        sunday: { open: '12:00', close: '21:00', isClosed: false }
      },
      features: {
        delivery: true,
        dineIn: true,
        tableReservation: true,
        takeout: true
      },
      deliveryFee: 4.99,
      minimumOrder: 20,
      deliveryRadius: 8,
      estimatedDeliveryTime: 40,
      coverImage: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351',
      isActive: true,
      isOpen: true,
      totalOrders: 256,
      totalRevenue: 6890.75,
      tags: ['japanese', 'sushi', 'healthy']
    });

    console.log('✅ Restaurants created:', pizzaPalace.name, sushiExpress.name);

    // Update merchant profile
    merchant.merchantProfile = {
      restaurantId: pizzaPalace._id,
      businessName: pizzaPalace.name,
      businessLicense: 'BL-2024-NYC-12345'
    };
    await merchant.save();

    console.log('✅ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log('   • 3 Users created (merchant, customer, courier)');
    console.log('   • 2 Restaurants created with full menus');
    console.log('   • Ready for local development!');
    console.log('\n🔐 Login Credentials:');
    console.log('   Merchant: merchant@example.com / password123');
    console.log('   Customer: customer@example.com / password123');
    console.log('   Courier:  courier@example.com / password123');

  } catch (error) {
    console.error('❌ Seeding Error:', error);
    throw error;
  }
};

// Run seeder
const runSeeder = async () => {
  await connectDB();
  await seedData();
  await mongoose.connection.close();
  console.log('\n✅ Database connection closed');
  process.exit(0);
};

runSeeder();
