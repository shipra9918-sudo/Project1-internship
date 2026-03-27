const Review = require('../models/Review');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const User = require('../models/User');
const natural = require('natural');
const compromise = require('compromise');

// @desc    Create review with gamification
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res, next) => {
  try {
    const { orderId, rating, reviewText, foodRating, serviceRating, deliveryRating, images, keywords } = req.body;

    // Find order
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify order belongs to user
    if (order.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to review this order'
      });
    }

    // Check if order is completed
    if (order.status !== 'delivered' && order.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only review completed orders'
      });
    }

    // Check if already reviewed
    if (order.hasReview) {
      return res.status(400).json({
        success: false,
        message: 'Order already reviewed'
      });
    }

    // Create review
    const review = await Review.create({
      order: orderId,
      customer: req.user.id,
      restaurant: order.restaurant,
      rating,
      reviewText,
      foodRating,
      serviceRating,
      deliveryRating,
      images: images || [],
      keywords: keywords || []
    });

    // Extract keywords automatically
    review.extractKeywords();
    await review.save();

    // Update order
    order.hasReview = true;
    order.review = review._id;
    await order.save();

    // Update restaurant rating
    const restaurant = await Restaurant.findById(order.restaurant);
    await restaurant.updateRating(rating);

    // Award loyalty points for review
    const pointsEarned = review.gamification.totalPoints;
    await req.user.addLoyaltyPoints(pointsEarned);

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: {
        review,
        pointsEarned,
        totalLoyaltyPoints: req.user.loyaltyPoints
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get AI-suggested keywords for review
// @route   POST /api/reviews/suggest-keywords
// @access  Private
exports.suggestKeywords = async (req, res, next) => {
  try {
    const { orderId, partialReview } = req.body;

    // Find order to get context
    const order = await Order.findById(orderId).populate('restaurant');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Generate AI-assisted keyword suggestions
    const suggestions = generateKeywordSuggestions(partialReview, order);

    res.status(200).json({
      success: true,
      data: { suggestions }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get restaurant reviews
// @route   GET /api/reviews/restaurant/:restaurantId
// @access  Public
exports.getRestaurantReviews = async (req, res, next) => {
  try {
    const { limit = 20, page = 1, minRating, sortBy = 'recent' } = req.query;

    const query = { restaurant: req.params.restaurantId };
    
    if (minRating) {
      query.rating = { $gte: parseInt(minRating) };
    }

    let sort = { createdAt: -1 }; // Default: most recent
    
    if (sortBy === 'helpful') {
      sort = { helpful: -1 };
    } else if (sortBy === 'rating') {
      sort = { rating: -1 };
    }

    const reviews = await Review.find(query)
      .populate('customer', 'name profileImage')
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Review.countDocuments(query);

    // Calculate rating distribution
    const ratingDistribution = await Review.aggregate([
      { $match: { restaurant: require('mongoose').Types.ObjectId(req.params.restaurantId) } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]).catch(() => []); // Handle aggregation errors gracefully

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      ratingDistribution,
      data: { reviews }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark review as helpful
// @route   PUT /api/reviews/:id/helpful
// @access  Private
exports.markHelpful = async (req, res, next) => {
  try {
    const { isHelpful } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    if (isHelpful) {
      review.helpful += 1;
    } else {
      review.notHelpful += 1;
    }

    await review.save();

    res.status(200).json({
      success: true,
      data: { review }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Restaurant response to review
// @route   PUT /api/reviews/:id/respond
// @access  Private (Merchant)
exports.respondToReview = async (req, res, next) => {
  try {
    const { responseText } = req.body;
    const review = await Review.findById(req.params.id).populate('restaurant');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user owns the restaurant
    if (review.restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to respond to this review'
      });
    }

    review.restaurantResponse = {
      text: responseText,
      respondedAt: new Date()
    };

    await review.save();

    res.status(200).json({
      success: true,
      message: 'Response added successfully',
      data: { review }
    });
  } catch (error) {
    next(error);
  }
};

// Helper function: Generate AI keyword suggestions
function generateKeywordSuggestions(text, order) {
  const suggestions = {
    foodKeywords: [],
    serviceKeywords: [],
    experienceKeywords: [],
    contextualSuggestions: []
  };

  // Food-related keywords
  const foodKeywords = [
    'delicious', 'tasty', 'fresh', 'hot', 'cold', 'spicy', 'sweet', 'savory',
    'crispy', 'tender', 'juicy', 'flavorful', 'aromatic', 'perfectly cooked',
    'well-seasoned', 'authentic', 'generous portion', 'presentation'
  ];

  // Service keywords
  const serviceKeywords = [
    'fast delivery', 'on time', 'late', 'friendly', 'professional', 'courteous',
    'helpful', 'responsive', 'attentive', 'quick service', 'efficient'
  ];

  // Experience keywords
  const experienceKeywords = [
    'excellent', 'outstanding', 'amazing', 'good', 'satisfactory', 'disappointing',
    'poor', 'terrible', 'value for money', 'highly recommend', 'will order again'
  ];

  // Analyze partial review text
  if (text && text.length > 0) {
    const doc = compromise(text.toLowerCase());
    
    // Extract adjectives
    const adjectives = doc.adjectives().out('array');
    
    // Suggest related keywords based on context
    if (adjectives.length > 0) {
      suggestions.contextualSuggestions = adjectives.slice(0, 5);
    }
  }

  // Based on order type, suggest relevant keywords
  if (order.orderType === 'delivery') {
    suggestions.serviceKeywords = serviceKeywords.filter(k => 
      k.includes('delivery') || k.includes('time') || k.includes('fast')
    ).slice(0, 5);
  }

  // Random selection from categories
  suggestions.foodKeywords = shuffleArray(foodKeywords).slice(0, 5);
  suggestions.serviceKeywords = [...suggestions.serviceKeywords, ...shuffleArray(serviceKeywords)].slice(0, 5);
  suggestions.experienceKeywords = shuffleArray(experienceKeywords).slice(0, 5);

  return suggestions;
}

// Helper: Shuffle array
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

module.exports = exports;
