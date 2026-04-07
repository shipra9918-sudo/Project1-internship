const Restaurant = require('../models/Restaurant');

// @desc    Discover nearby restaurants with geospatial search
// @route   GET /api/restaurants/discover
// @access  Public
exports.createRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.create({
      ...req.body,
      owner: req.user.id // 🔥 required
    });

    res.status(201).json({
      success: true,
      data: restaurant
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating restaurant" });
  }
};
exports.discoverRestaurants = async (req, res, next) => {
  try {
    const {
      longitude,
      latitude,
      maxDistance = 10000, // 10km default
      cuisineType,
      minRating,
      priceRange,
      limit = 20,
      page = 1
    } = req.query;

    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        message: 'Longitude and latitude are required'
      });
    }

    const lng = parseFloat(longitude);
    const lat = parseFloat(latitude);

    // Build aggregation pipeline with $geoNear
    const pipeline = [
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          distanceField: 'distance',
          maxDistance: parseInt(maxDistance),
          spherical: true,
          query: {
            isActive: true,
            isOpen: true
          }
        }
      }
    ];

    // Add cuisine filter
    if (cuisineType) {
      pipeline.push({
        $match: {
          cuisineType: { $in: Array.isArray(cuisineType) ? cuisineType : [cuisineType] }
        }
      });
    }

    // Add rating filter
    if (minRating) {
      pipeline.push({
        $match: {
          'rating.average': { $gte: parseFloat(minRating) }
        }
      });
    }

    // Add price range filter
    if (priceRange) {
      pipeline.push({
        $match: {
          priceRange: { $in: Array.isArray(priceRange) ? priceRange : [priceRange] }
        }
      });
    }

    // Sort by distance and rating
    pipeline.push({
      $addFields: {
        distanceInKm: { $divide: ['$distance', 1000] },
        combinedScore: {
          $add: [
            { $multiply: ['$rating.average', 2] },
            { $divide: [10, { $add: [{ $divide: ['$distance', 1000] }, 1] }] }
          ]
        }
      }
    });

    pipeline.push({
      $sort: { combinedScore: -1, 'rating.average': -1 }
    });

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parseInt(limit) });

    // Project fields
    pipeline.push({
      $project: {
        name: 1,
        cuisineType: 1,
        'rating.average': 1,
        'rating.count': 1,
        priceRange: 1,
        address: 1,
        distance: 1,
        distanceInKm: 1,
        deliveryFee: 1,
        estimatedDeliveryTime: 1,
        coverImage: 1,
        features: 1,
        isOpen: 1,
        minimumOrder: 1
      }
    });

    const restaurants = await Restaurant.aggregate(pipeline);

    // Get total count for pagination
    const countPipeline = pipeline.slice(0, -3); // Remove skip, limit, project
    const totalDocs = await Restaurant.aggregate([
      ...countPipeline,
      { $count: 'total' }
    ]);
    const total = totalDocs.length > 0 ? totalDocs[0].total : 0;

    res.status(200).json({
      success: true,
      count: restaurants.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: { restaurants }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get restaurant for current merchant
// @route   GET /api/restaurants/my-restaurant
// @access  Private (Merchant only)
exports.getMyRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user.id });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'No restaurant found for this merchant'
      });
    }

    res.status(200).json({
      success: true,
      data: { restaurant }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get restaurant by ID with menu
// @route   GET /api/restaurants/:id
// @access  Public
exports.getRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)
      .populate('owner', 'name email phone');

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { restaurant }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create restaurant
// @route   POST /api/restaurants
// @access  Private (Merchant only)
exports.createRestaurant = async (req, res, next) => {
  try {
    // Add owner from authenticated user
    req.body.owner = req.user.id;

    const restaurant = await Restaurant.create(req.body);

    // Update user's merchant profile
    req.user.merchantProfile = {
      restaurantId: restaurant._id,
      businessName: restaurant.name
    };
    await req.user.save();

    res.status(201).json({
      success: true,
      message: 'Restaurant created successfully',
      data: { restaurant }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update restaurant
// @route   PUT /api/restaurants/:id
// @access  Private (Merchant only)
exports.updateRestaurant = async (req, res, next) => {
  try {
    let restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Check ownership
    if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this restaurant'
      });
    }

    restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Restaurant updated successfully',
      data: { restaurant }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle menu item availability
// @route   PUT /api/restaurants/:id/menu/:itemId/toggle
// @access  Private (Merchant only)
exports.toggleMenuItem = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Check ownership
    if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const { isAvailable } = req.body;
    const item = await restaurant.toggleMenuItem(req.params.itemId, isAvailable);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Menu item updated',
      data: { item }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search restaurants by text
// @route   GET /api/restaurants/search
// @access  Public
exports.searchRestaurants = async (req, res, next) => {
  try {
    const { query, limit = 20 } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const restaurants = await Restaurant.find(
      {
        $text: { $search: query },
        isActive: true
      },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(parseInt(limit))
      .select('name cuisineType rating address coverImage priceRange');

    res.status(200).json({
      success: true,
      count: restaurants.length,
      data: { restaurants }
    });
  } catch (error) {
    next(error);
  }
};
