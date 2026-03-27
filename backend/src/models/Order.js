const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  specialInstructions: String
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  items: [orderItemSchema],
  orderType: {
    type: String,
    enum: ['delivery', 'dineIn', 'takeout'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'preparing', 'ready', 'dispatched', 'in_transit', 'delivered', 'completed', 'cancelled', 'rejected'],
    default: 'pending'
  },
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    location: {
      type: {
        type: String,
        enum: ['Point']
      },
      coordinates: [Number]
    },
    instructions: String
  },
  tableReservation: {
    tableNumber: String,
    numberOfGuests: Number,
    reservationTime: Date
  },
  pricing: {
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    deliveryFee: {
      type: Number,
      default: 0,
      min: 0
    },
    tax: {
      type: Number,
      default: 0,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
    }
  },
  payment: {
    method: {
      type: String,
      enum: ['credit_card', 'debit_card', 'cash', 'wallet', 'upi'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paidAt: Date
  },
  courier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  courierLocation: {
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: [Number]
  },
  estimatedDeliveryTime: Date,
  actualDeliveryTime: Date,
  preparationTime: {
    type: Number,
    default: 20
  },
  statusHistory: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String
  }],
  customerNotes: String,
  restaurantNotes: String,
  review: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  },
  hasReview: {
    type: Boolean,
    default: false
  },
  loyaltyPointsEarned: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for query optimization
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ restaurant: 1, status: 1 });
orderSchema.index({ courier: 1, status: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'deliveryAddress.location': '2dsphere' });
orderSchema.index({ 'courierLocation': '2dsphere' });

// Generate unique order number
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    this.orderNumber = `ORD-${timestamp}-${random}`;
    
    // Add initial status to history
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      note: 'Order created'
    });
  }
  next();
});

// Update status with history tracking
orderSchema.methods.updateStatus = async function(newStatus, note = '') {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    note
  });
  
  // Auto-set delivery time if completed
  if (newStatus === 'delivered' && !this.actualDeliveryTime) {
    this.actualDeliveryTime = new Date();
  }
  
  await this.save();
  return this;
};

// Calculate order total
orderSchema.methods.calculateTotal = function() {
  const subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + this.pricing.deliveryFee + tax - this.pricing.discount;
  
  this.pricing.subtotal = subtotal;
  this.pricing.tax = tax;
  this.pricing.total = total;
  
  return this.pricing;
};

module.exports = mongoose.model('Order', orderSchema);
