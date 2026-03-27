const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    unique: true
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
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  reviewText: {
    type: String,
    required: true,
    minlength: [10, 'Review must be at least 10 characters'],
    maxlength: [2000, 'Review cannot exceed 2000 characters']
  },
  foodRating: {
    type: Number,
    min: 1,
    max: 5
  },
  serviceRating: {
    type: Number,
    min: 1,
    max: 5
  },
  deliveryRating: {
    type: Number,
    min: 1,
    max: 5
  },
  images: [String],
  keywords: [String],
  aiSuggestedKeywords: [String],
  gamification: {
    characterCount: {
      type: Number,
      default: 0
    },
    wordCount: {
      type: Number,
      default: 0
    },
    keywordScore: {
      type: Number,
      default: 0
    },
    mediaBonus: {
      type: Number,
      default: 0
    },
    totalPoints: {
      type: Number,
      default: 0
    }
  },
  isVerifiedPurchase: {
    type: Boolean,
    default: true
  },
  helpful: {
    type: Number,
    default: 0
  },
  notHelpful: {
    type: Number,
    default: 0
  },
  restaurantResponse: {
    text: String,
    respondedAt: Date
  }
}, {
  timestamps: true
});

// Indexes
reviewSchema.index({ restaurant: 1, createdAt: -1 });
reviewSchema.index({ customer: 1 });
reviewSchema.index({ rating: -1 });
reviewSchema.index({ order: 1 });

// Calculate gamification points before saving
reviewSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('reviewText')) {
    const text = this.reviewText || '';
    
    // Character and word count
    this.gamification.characterCount = text.length;
    this.gamification.wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
    
    // Base points
    const BASE_POINTS = parseInt(process.env.BASE_POINTS_PER_REVIEW) || 10;
    const POINTS_PER_100_CHARS = parseInt(process.env.POINTS_PER_100_CHARS) || 5;
    const KEYWORD_BONUS = parseInt(process.env.KEYWORD_BONUS_POINTS) || 3;
    const MEDIA_BONUS = parseInt(process.env.MEDIA_UPLOAD_BONUS) || 15;
    
    let totalPoints = BASE_POINTS;
    
    // Length bonus
    const lengthBonus = Math.floor(this.gamification.characterCount / 100) * POINTS_PER_100_CHARS;
    totalPoints += lengthBonus;
    
    // Keyword bonus
    if (this.keywords && this.keywords.length > 0) {
      this.gamification.keywordScore = this.keywords.length * KEYWORD_BONUS;
      totalPoints += this.gamification.keywordScore;
    }
    
    // Media bonus
    if (this.images && this.images.length > 0) {
      this.gamification.mediaBonus = MEDIA_BONUS;
      totalPoints += this.gamification.mediaBonus;
    }
    
    this.gamification.totalPoints = totalPoints;
  }
  next();
});

// Extract keywords using NLP
reviewSchema.methods.extractKeywords = function() {
  const text = this.reviewText.toLowerCase();
  
  // Simple keyword extraction (in production, use NLP library)
  const foodKeywords = ['delicious', 'tasty', 'fresh', 'hot', 'cold', 'spicy', 'sweet', 'crispy', 'tender', 'flavorful'];
  const serviceKeywords = ['fast', 'slow', 'friendly', 'rude', 'professional', 'helpful', 'quick', 'late'];
  const qualityKeywords = ['excellent', 'good', 'bad', 'poor', 'amazing', 'terrible', 'average', 'outstanding'];
  
  const allKeywords = [...foodKeywords, ...serviceKeywords, ...qualityKeywords];
  const found = allKeywords.filter(keyword => text.includes(keyword));
  
  this.keywords = [...new Set([...this.keywords, ...found])];
  return this.keywords;
};

module.exports = mongoose.model('Review', reviewSchema);
