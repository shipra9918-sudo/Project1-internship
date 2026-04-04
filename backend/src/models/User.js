const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['consumer', 'merchant', 'courier', 'admin'],
    default: 'consumer'
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      }
    }
  },
  loyaltyPoints: {
    type: Number,
    default: 0,
    min: 0
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  isActive: {
    type: Boolean,
    default: true
  },
  profileImage: String,
  merchantProfile: {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant'
    },
    businessName: String,
    businessLicense: String
  },
  courierProfile: {
    vehicleType: {
      type: String,
      enum: ['bike', 'scooter', 'car', 'motorcycle']
    },
    licenseNumber: String,
    isAvailable: {
      type: Boolean,
      default: false
    },
    currentLocation: {
      type: {
        type: String,
        enum: ['Point']
      },
      coordinates: [Number]
    },
    totalDeliveries: {
      type: Number,
      default: 0
    },
    earnings: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Create 2dsphere index for geospatial queries on user address
userSchema.index({ 'address.location': '2dsphere' });
userSchema.index({ 'courierProfile.currentLocation': '2dsphere' });
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT + stable session id (jti) stored in MongoDB Session
userSchema.methods.generateAuthToken = function() {
  const jti = crypto.randomUUID();
  const token = jwt.sign(
    { id: this._id, role: this.role, jti },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
  const decoded = jwt.decode(token);
  const expiresAt = new Date(decoded.exp * 1000);
  return { token, jti, expiresAt };
};

// Add loyalty points
userSchema.methods.addLoyaltyPoints = async function(points) {
  this.loyaltyPoints += points;
  await this.save();
  return this.loyaltyPoints;
};

module.exports = mongoose.model('User', userSchema);
