const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema({
  // Basic Info
  name: {
    type: String,
    required: [true, 'Workspace name is required'],
    trim: true,
    maxlength: [100, 'Workspace name cannot exceed 100 characters']
  },
  
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  
  // Owner
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Branding
  branding: {
    logo: String,
    primaryColor: { type: String, default: '#EF4444' },
    secondaryColor: { type: String, default: '#1F2937' },
    customDomain: String,
    favicon: String
  },
  
  // Contact Info
  contact: {
    email: String,
    phone: String,
    website: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },
  
  // Settings
  settings: {
    timezone: { type: String, default: 'America/New_York' },
    currency: { type: String, default: 'USD' },
    language: { type: String, default: 'en' },
    dateFormat: { type: String, default: 'MM/DD/YYYY' },
    allowPublicSignup: { type: Boolean, default: false },
    requireEmailVerification: { type: Boolean, default: true }
  },
  
  // Team Members
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'manager', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Subscription Reference
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription'
  },
  
  // Statistics
  stats: {
    totalRestaurants: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    totalCustomers: { type: Number, default: 0 },
    totalCouriers: { type: Number, default: 0 }
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  isSuspended: {
    type: Boolean,
    default: false
  },
  
  suspendedReason: String,
  
  // Metadata
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Indexes
workspaceSchema.index({ slug: 1 }, { unique: true });
workspaceSchema.index({ owner: 1 });
workspaceSchema.index({ 'members.user': 1 });

// Generate unique slug
workspaceSchema.pre('save', async function(next) {
  if (this.isNew && !this.slug) {
    const baseSlug = this.name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    let slug = baseSlug;
    let counter = 1;
    
    while (await mongoose.model('Workspace').findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    this.slug = slug;
  }
  next();
});

// Check if user is member
workspaceSchema.methods.isMember = function(userId) {
  return this.members.some(m => m.user.toString() === userId.toString()) || 
         this.owner.toString() === userId.toString();
};

// Check if user has role
workspaceSchema.methods.hasRole = function(userId, role) {
  const member = this.members.find(m => m.user.toString() === userId.toString());
  if (this.owner.toString() === userId.toString()) return true;
  return member && member.role === role;
};

// Add member
workspaceSchema.methods.addMember = function(userId, role = 'member') {
  if (!this.isMember(userId)) {
    this.members.push({ user: userId, role });
    return this.save();
  }
  return this;
};

// Remove member
workspaceSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(m => m.user.toString() !== userId.toString());
  return this.save();
};

module.exports = mongoose.model('Workspace', workspaceSchema);
