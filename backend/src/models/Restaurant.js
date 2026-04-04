const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['appetizer', 'main', 'dessert', 'beverage', 'special']
  },
  image: String,
  isAvailable: {
    type: Boolean,
    default: true
  },
  preparationTime: {
    type: Number,
    default: 15,
    min: 0
  },
  dietary: {
    vegetarian: { type: Boolean, default: false },
    vegan: { type: Boolean, default: false },
    glutenFree: { type: Boolean, default: false },
    spicy: { type: Boolean, default: false }
  },
  tags: [String]
}, { _id: true });

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Restaurant name is required'],
    trim: true,
    maxlength: [200, 'Name cannot exceed 200 characters']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  cuisineType: [{
    type: String,
    required: true,
    enum: ['italian', 'chinese', 'indian', 'mexican', 'japanese', 'american', 'thai', 'mediterranean', 'french', 'korean', 'other']
  }],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function(coords) {
          return coords.length === 2 && 
                 coords[0] >= -180 && coords[0] <= 180 && 
                 coords[1] >= -90 && coords[1] <= 90;
        },
        message: 'Invalid coordinates. Format: [longitude, latitude]'
      }
    }
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, default: 'USA' }
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  menu: [menuItemSchema],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  priceRange: {
    type: String,
    enum: ['$', '$$', '$$$', '$$$$'],
    default: '$$'
  },
  operatingHours: {
    monday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
    tuesday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
    wednesday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
    thursday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
    friday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
    saturday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
    sunday: { open: String, close: String, isClosed: { type: Boolean, default: false } }
  },
  features: {
    delivery: { type: Boolean, default: true },
    dineIn: { type: Boolean, default: true },
    tableReservation: { type: Boolean, default: false },
    takeout: { type: Boolean, default: true }
  },
  deliveryFee: {
    type: Number,
    default: 0,
    min: 0
  },
  minimumOrder: {
    type: Number,
    default: 0,
    min: 0
  },
  deliveryRadius: {
    type: Number,
    default: 10,
    min: 0,
    max: 50
  },
  estimatedDeliveryTime: {
    type: Number,
    default: 30,
    min: 0
  },
  tables: [{
    tableNumber: String,
    capacity: Number,
    isAvailable: { type: Boolean, default: true },
    currentReservation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reservation'
    }
  }],
  images: [String],
  coverImage: String,
  isActive: {
    type: Boolean,
    default: true
  },
  isOpen: {
    type: Boolean,
    default: true
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  totalRevenue: {
    type: Number,
    default: 0
  },
  commissionRate: {
    type: Number,
    default: 0.15,
    min: 0,
    max: 1
  },
  tags: [String]
}, {
  timestamps: true
});

// CRITICAL: Create 2dsphere geospatial index for proximity queries
restaurantSchema.index({ location: '2dsphere' });

// Additional indexes for query optimization
restaurantSchema.index({ cuisineType: 1 });
restaurantSchema.index({ 'rating.average': -1 });
restaurantSchema.index({ isActive: 1, isOpen: 1 });
restaurantSchema.index({ owner: 1 });
restaurantSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Update rating when a new review is added — uses atomic $inc to avoid race conditions
restaurantSchema.methods.updateRating = async function(newRating) {
  // Atomically increment count and accumulate into a running sum stored alongside average
  // We recompute the average as: (old_avg * old_count + newRating) / (old_count + 1)
  // Using findByIdAndUpdate with $inc guarantees no lost-update under concurrent requests.
  const updated = await this.constructor.findByIdAndUpdate(
    this._id,
    [
      {
        $set: {
          'rating.count': { $add: ['$rating.count', 1] },
          'rating.average': {
            $min: [
              5,
              {
                $divide: [
                  { $add: [{ $multiply: ['$rating.average', '$rating.count'] }, newRating] },
                  { $add: ['$rating.count', 1] }
                ]
              }
            ]
          }
        }
      }
    ],
    { new: true }
  );
  return updated.rating;
};

// Check if restaurant is currently open based on operating hours (HH:MM strings)
restaurantSchema.methods.isCurrentlyOpen = function() {
  if (!this.isOpen || !this.isActive) return false;

  const now = new Date();
  const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
  const hours = this.operatingHours[dayName];

  if (!hours || hours.isClosed || !hours.open || !hours.close) return false;

  // Convert current time to total minutes since midnight
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Parse "HH:MM" strings into total minutes
  const parseTime = (str) => {
    const [h, m] = str.split(':').map(Number);
    return h * 60 + (m || 0);
  };

  const openMinutes = parseTime(hours.open);
  const closeMinutes = parseTime(hours.close);

  // Handle overnight hours (e.g. 22:00 – 02:00)
  if (closeMinutes < openMinutes) {
    return currentMinutes >= openMinutes || currentMinutes < closeMinutes;
  }

  return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
};

// Toggle menu item availability
restaurantSchema.methods.toggleMenuItem = async function(itemId, isAvailable) {
  const item = this.menu.id(itemId);
  if (item) {
    item.isAvailable = isAvailable;
    await this.save();
    return item;
  }
  return null;
};

module.exports = mongoose.model('Restaurant', restaurantSchema);
