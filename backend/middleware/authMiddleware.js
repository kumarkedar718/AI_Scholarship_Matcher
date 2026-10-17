const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendResponse } = require('../utils/responseHandler');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'scholarship_matcher_secret_jwt_key_2026_dev'
      );

      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return sendResponse(res, 401, false, 'User account no longer exists');
      }

      next();
    } catch (error) {
      console.error('JWT Auth Middleware Error:', error.message);
      return sendResponse(res, 401, false, 'Not authorized, token validation failed');
    }
  }

  if (!token) {
    return sendResponse(res, 401, false, 'Not authorized, no bearer token provided');
  }
};

module.exports = { protect };
