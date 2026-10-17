const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  adminBootstrap,
  verifyEmail,
  getVerificationStatus,
  resendVerification,
  forgotPassword,
  resetPassword,
  getMe
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const {
  registerLimiter,
  loginLimiter,
  resendLimiter,
  verificationStatusLimiter,
  passwordResetLimiter
} = require('../middleware/rateLimiterMiddleware');

router.post('/register', registerLimiter, registerUser);
router.post('/login', loginLimiter, loginUser);
router.post('/admin-bootstrap', resendLimiter, adminBootstrap);
router.get('/verify-email', verifyEmail);
router.post('/verify-email', verifyEmail);
router.get('/verification-status', verificationStatusLimiter, getVerificationStatus);
router.post('/resend-verification', resendLimiter, resendVerification);
router.post('/forgot-password', passwordResetLimiter, forgotPassword);
router.post('/reset-password', passwordResetLimiter, resetPassword);
router.get('/me', protect, getMe);

module.exports = router;
