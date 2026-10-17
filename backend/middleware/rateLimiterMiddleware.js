const rateLimit = require('express-rate-limit');
const { sendResponse } = require('../utils/responseHandler');

// Dedicated rate limiters for specific authentication endpoints
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 30, // Max 30 registration requests per IP per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendResponse(
      res,
      429,
      false,
      'Too many registration attempts from this IP. Please try again after 15 minutes.'
    );
  }
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 30, // Max 30 login requests per IP per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendResponse(
      res,
      429,
      false,
      'Too many login attempts from this IP. Please try again after 15 minutes.'
    );
  }
});

// Stricter rate limiter for email resend requests (5 attempts per 15 minutes per IP/email)
const resendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 resend attempts per 15 minutes per IP/email
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const email = req.body && req.body.email ? req.body.email.toLowerCase().trim() : '';
    return email ? `${req.ip}_${email}` : req.ip;
  },
  handler: (req, res) => {
    return sendResponse(
      res,
      429,
      false,
      'Too many verification email requests. Please wait 15 minutes before requesting again.'
    );
  }
});

// Dedicated high-capacity rate limiter for 2-second PC verification status polling
const verificationStatusLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 600, // Max 600 polling status checks per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendResponse(
      res,
      429,
      false,
      'Too many verification status checks. Please slow down.'
    );
  }
});

const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Max 15 password reset attempts per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendResponse(
      res,
      429,
      false,
      'Too many password reset requests. Please wait 15 minutes before trying again.'
    );
  }
});

// Dedicated rate limiter for AI Natural Language Search
const aiSearchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Max 20 search requests per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendResponse(
      res,
      429,
      false,
      'Too many AI search requests. Please wait a few minutes before searching again.'
    );
  }
});

module.exports = {
  registerLimiter,
  loginLimiter,
  resendLimiter,
  verificationStatusLimiter,
  passwordResetLimiter,
  aiSearchLimiter
};
