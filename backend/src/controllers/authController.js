const User = require('../models/User');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, address } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'consumer',
      phone,
      address
    });

    // Generate token
    const token = user.generateAuthToken();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          loyaltyPoints: user.loyaltyPoints
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Generate token
    const token = user.generateAuthToken();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          loyaltyPoints: user.loyaltyPoints,
          phone: user.phone
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          address: user.address,
          loyaltyPoints: user.loyaltyPoints,
          totalOrders: user.totalOrders,
          averageRating: user.averageRating,
          profileImage: user.profileImage,
          merchantProfile: user.merchantProfile,
          courierProfile: user.courierProfile
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address, profileImage } = req.body;

    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (profileImage) user.profileImage = profileImage;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle courier availability
// @route   PUT /api/auth/courier/availability
// @access  Private (Courier only)
exports.toggleAvailability = async (req, res, next) => {
  try {
    const { isAvailable } = req.body;

    const user = await User.findById(req.user.id);

    if (user.role !== 'courier') {
      return res.status(403).json({
        success: false,
        message: 'Only couriers can update availability'
      });
    }

    user.courierProfile.isAvailable = isAvailable;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Availability updated to ${isAvailable}`,
      data: { isAvailable: user.courierProfile.isAvailable }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update courier location
// @route   PUT /api/auth/courier/location
// @access  Private (Courier only)
exports.updateCourierLocation = async (req, res, next) => {
  try {
    const { longitude, latitude } = req.body;

    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        message: 'Longitude and latitude are required'
      });
    }

    const user = await User.findById(req.user.id);

    if (user.role !== 'courier') {
      return res.status(403).json({
        success: false,
        message: 'Only couriers can update location'
      });
    }

    user.courierProfile.currentLocation = {
      type: 'Point',
      coordinates: [parseFloat(longitude), parseFloat(latitude)]
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Location updated successfully',
      data: { location: user.courierProfile.currentLocation }
    });
  } catch (error) {
    next(error);
  }
};
