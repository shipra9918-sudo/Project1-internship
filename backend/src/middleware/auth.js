const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Session = require('../models/Session');

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.jti) {
      return res.status(401).json({
        success: false,
        message: 'Session invalid — please sign in again'
      });
    }

    const session = await Session.findOne({
      tokenId: decoded.jti,
      revokedAt: null
    });

    if (!session || session.expiresAt < new Date()) {
      return res.status(401).json({
        success: false,
        message: 'Session expired or logged out — please sign in again'
      });
    }

    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    req.auth = { jti: decoded.jti, sessionId: session._id };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};
