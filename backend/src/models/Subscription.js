const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  // Workspace/Organization
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true,
    index: true
  },
  
  // Subscription Details
  plan: {
    type: String,
    enum: ['free', 'starter', 'professional', 'enterprise'],
    default: 'free',
    required: true
  },
  
  status: {
    type: String,
    enum: ['active', 'canceled', 'past_due', 'trialing', 'expired'],
    default: 'trialing',
    required: true
  },
  
  // Pricing
  pricing: {
    monthlyPrice: { type: Number, default: 0 },
    yearlyPrice: { type: Number, default: 0 },
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly'],
      default: 'monthly'
    },
    currency: { type: String, default: 'USD' }
  },
  
  // Features & Limits
  features: {
    maxRestaurants: { type: Number, default: 1 },
    maxOrders: { type: Number, default: 100 },
    maxCouriers: { type: Number, default: 5 },
    analyticsEnabled: { type: Boolean, default: false },
    customBranding: { type: Boolean, default: false },
    apiAccess: { type: Boolean, default: false },
    prioritySupport: { type: Boolean, default: false },
    whiteLabel: { type: Boolean, default: false },
    customDomain: { type: Boolean, default: false }
  },
  
  // Usage Tracking
  usage: {
    restaurants: { type: Number, default: 0 },
    ordersThisMonth: { type: Number, default: 0 },
    couriers: { type: Number, default: 0 },
    apiCalls: { type: Number, default: 0 }
  },
  
  // Trial Period
  trial: {
    isTrialing: { type: Boolean, default: true },
    trialEndsAt: { type: Date },
    trialDays: { type: Number, default: 14 }
  },
  
  // Billing Dates
  currentPeriodStart: { type: Date, default: Date.now },
  currentPeriodEnd: { type: Date },
  cancelAt: { type: Date },
  canceledAt: { type: Date },
  
  // Payment
  paymentMethod: {
    type: { type: String, enum: ['card', 'bank', 'paypal'] },
    last4: String,
    brand: String
  },
  
  // Stripe/Payment Integration
  stripeCustomerId: String,
  stripeSubscriptionId: String,
  
  // Metadata
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Indexes
subscriptionSchema.index({ workspace: 1, status: 1 });
subscriptionSchema.index({ stripeSubscriptionId: 1 });

// Virtual for days remaining in trial
subscriptionSchema.virtual('trialDaysRemaining').get(function() {
  if (!this.trial.isTrialing || !this.trial.trialEndsAt) return 0;
  const now = new Date();
  const daysLeft = Math.ceil((this.trial.trialEndsAt - now) / (1000 * 60 * 60 * 24));
  return Math.max(0, daysLeft);
});

// Check if subscription is active
subscriptionSchema.methods.isActive = function() {
  return this.status === 'active' || this.status === 'trialing';
};

// Check if feature is available
subscriptionSchema.methods.hasFeature = function(feature) {
  return this.features[feature] === true;
};

// Check usage limits
subscriptionSchema.methods.canAddRestaurant = function() {
  return this.usage.restaurants < this.features.maxRestaurants;
};

subscriptionSchema.methods.canAddCourier = function() {
  return this.usage.couriers < this.features.maxCouriers;
};

subscriptionSchema.methods.canProcessOrder = function() {
  return this.usage.ordersThisMonth < this.features.maxOrders;
};

// Reset monthly usage
subscriptionSchema.methods.resetMonthlyUsage = function() {
  this.usage.ordersThisMonth = 0;
  this.usage.apiCalls = 0;
  return this.save();
};

module.exports = mongoose.model('Subscription', subscriptionSchema);
