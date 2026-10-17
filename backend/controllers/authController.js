const crypto = require('crypto');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendResponse } = require('../utils/responseHandler');
const { logAdminAction } = require('../services/auditLogService');
const {
  isValidEmailAddress,
  validateRegisterInput,
  validateLoginInput,
  validateResendVerificationInput,
  validateForgotPasswordInput,
  validateResetPasswordInput
} = require('../validators/authValidator');
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail
} = require('../services/emailService');

/**
 * Mobile-friendly HTML renderer for direct browser verification link clicks
 */
const renderVerificationHtmlPage = (title, heading, message, statusType = 'success') => {
  const iconSymbol = statusType === 'success' ? '✓' : statusType === 'already' ? '✓' : '✕';
  const iconBg = statusType === 'success' ? '#dcfce7' : statusType === 'already' ? '#e0e7ff' : '#fee2e2';
  const iconColor = statusType === 'success' ? '#15803d' : statusType === 'already' ? '#4338ca' : '#dc2626';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} - ScholarMatch</title>
      <style>
        * { box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px 16px; display: flex; align-items: center; justify-content: center; min-height: 100vh; text-align: center; }
        .card { background: #ffffff; padding: 40px 28px; border-radius: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.06); max-width: 420px; width: 100%; border: 1px solid #e2e8f0; }
        .icon { width: 72px; height: 72px; background: ${iconBg}; color: ${iconColor}; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; font-size: 36px; font-weight: bold; }
        h1 { font-size: 22px; color: #0f172a; margin: 0 0 12px; font-weight: 800; letter-spacing: -0.5px; }
        p { font-size: 14px; color: #475569; margin: 0 0 28px; line-height: 1.6; }
        .badge { display: inline-block; background: #4f46e5; color: #ffffff; padding: 10px 20px; border-radius: 9999px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="icon">${iconSymbol}</div>
        <h1>${heading}</h1>
        <p>${message}</p>
        <div class="badge">🎓 AI Scholarship Matcher</div>
      </div>
    </body>
    </html>
  `;
};

// @desc    Register a new user & send email verification link
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { isValid, errors } = validateRegisterInput(req.body);
    if (!isValid) {
      const firstError = Object.values(errors)[0] || 'Validation Failed';
      return sendResponse(res, 400, false, firstError, null, errors);
    }

    const { name, email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // Check existing email
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return sendResponse(res, 400, false, 'User already exists with this email address');
    }

    // SECURITY HARDENING: Public self-registration ALWAYS creates role = 'student'.
    // Request body parameters (role, isAdmin, permissions) are strictly ignored.
    const userRole = 'student';

    // Generate secure verification token
    const unhashedToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(unhashedToken).digest('hex');
    const tokenExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // Generate secure verification session token for PC polling
    const unhashedSessionToken = crypto.randomBytes(32).toString('hex');
    const hashedSessionToken = crypto.createHash('sha256').update(unhashedSessionToken).digest('hex');

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: userRole,
      isEmailVerified: false,
      emailVerificationToken: hashedToken,
      emailVerificationExpires: tokenExpires,
      verificationSessionToken: hashedSessionToken,
      verificationSessionExpires: tokenExpires,
      profile: {
        isProfileComplete: false
      }
    });

    if (user) {
      // Dispatch verification email
      let emailResult = { success: false };
      try {
        emailResult = await sendVerificationEmail(user, unhashedToken);
      } catch (mailErr) {
        console.error('Email Dispatch Exception:', mailErr);
      }

      if (emailResult && emailResult.success) {
        return sendResponse(
          res,
          201,
          true,
          'Registration successful! A verification email has been sent to your email address. Please check your inbox and Spam folder.',
          {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isEmailVerified: false,
            emailSent: true,
            verificationSessionId: unhashedSessionToken
          }
        );
      } else {
        return sendResponse(
          res,
          201,
          true,
          'Account created, but we could not send the verification email. Please click Resend Verification Email.',
          {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isEmailVerified: false,
            emailSent: false,
            verificationSessionId: unhashedSessionToken,
            emailError: emailResult ? emailResult.error : 'SMTP unavailable'
          }
        );
      }
    } else {
      return sendResponse(res, 400, false, 'Invalid user data provided');
    }
  } catch (error) {
    if (error.code === 11000) {
      return sendResponse(res, 400, false, 'User already exists with this email address');
    }
    next(error);
  }
};

// @desc    Authenticate user & get token (requires verified email)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { isValid, errors } = validateLoginInput(req.body);
    if (!isValid) {
      const firstError = Object.values(errors)[0] || 'Validation Failed';
      return sendResponse(res, 400, false, firstError, null, errors);
    }

    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });

    if (user && (await user.matchPassword(password))) {
      // Check if user account is disabled
      if (user.isActive === false) {
        if (user.role === 'admin') {
          await logAdminAction({
            adminId: user._id,
            adminEmail: user.email,
            action: 'ADMIN_LOGIN_DISABLED_ATTEMPT',
            req
          });
        }
        return sendResponse(res, 403, false, 'Account is disabled. Please contact an administrator.');
      }

      // Reject login if email is unverified
      if (!user.isEmailVerified) {
        const unhashedSessionToken = crypto.randomBytes(32).toString('hex');
        const hashedSessionToken = crypto.createHash('sha256').update(unhashedSessionToken).digest('hex');
        user.verificationSessionToken = hashedSessionToken;
        user.verificationSessionExpires = new Date(Date.now() + 30 * 60 * 1000);
        await user.save();

        return sendResponse(
          res,
          401,
          false,
          'Please verify your email address before logging in.',
          {
            isEmailVerified: false,
            email: user.email,
            verificationSessionId: unhashedSessionToken
          }
        );
      }

      if (user.role === 'admin') {
        await logAdminAction({
          adminId: user._id,
          adminEmail: user.email,
          action: 'ADMIN_LOGIN_SUCCESS',
          req
        });
      }

      const token = generateToken(user._id, user.role);
      return sendResponse(res, 200, true, 'Login successful', {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        profile: user.profile,
        token
      });
    } else {
      if (user && user.role === 'admin') {
        await logAdminAction({
          adminId: user._id,
          adminEmail: user.email,
          action: 'ADMIN_LOGIN_FAILURE',
          req
        });
      }
      return sendResponse(res, 401, false, 'Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Secure one-time Admin Bootstrap mechanism
// @route   POST /api/auth/admin-bootstrap
// @access  Public (Secured by ADMIN_BOOTSTRAP_ENABLED + ADMIN_BOOTSTRAP_SECRET)
const adminBootstrap = async (req, res, next) => {
  try {
    const isEnabled = process.env.ADMIN_BOOTSTRAP_ENABLED === 'true' || process.env.ADMIN_BOOTSTRAP_ENABLED === true;
    if (!isEnabled) {
      return sendResponse(res, 403, false, 'Admin bootstrap process is disabled on this server.');
    }

    const { bootstrapSecret, name, email, password } = req.body || {};

    if (!bootstrapSecret || typeof bootstrapSecret !== 'string') {
      return sendResponse(res, 400, false, 'Bootstrap secret key is required.');
    }

    const serverSecret = process.env.ADMIN_BOOTSTRAP_SECRET;
    if (!serverSecret || serverSecret.trim() === '') {
      return sendResponse(res, 500, false, 'Server bootstrap secret key is not configured.');
    }

    // Safe constant-time string comparison for secret key
    const inputBuf = Buffer.from(bootstrapSecret.trim());
    const serverBuf = Buffer.from(serverSecret.trim());

    if (inputBuf.length !== serverBuf.length || !crypto.timingSafeEqual(inputBuf, serverBuf)) {
      await logAdminAction({
        action: 'ADMIN_BOOTSTRAP_FAILED_SECRET',
        req,
        metadata: { attemptedEmail: email }
      });
      return sendResponse(res, 401, false, 'Invalid bootstrap secret key.');
    }

    const normalizedEmail = email ? email.toLowerCase().trim() : '';
    if (!normalizedEmail || !isValidEmailAddress(normalizedEmail)) {
      return sendResponse(res, 400, false, 'Valid admin email address is required.');
    }

    // Check optional ADMIN_BOOTSTRAP_EMAIL restriction
    if (process.env.ADMIN_BOOTSTRAP_EMAIL) {
      const allowedBootstrapEmail = process.env.ADMIN_BOOTSTRAP_EMAIL.toLowerCase().trim();
      if (normalizedEmail !== allowedBootstrapEmail) {
        return sendResponse(res, 403, false, 'Provided email address is not authorized for admin bootstrap.');
      }
    }

    // Check optional ADMIN_ALLOWED_EMAILS list
    if (process.env.ADMIN_ALLOWED_EMAILS) {
      const allowedList = process.env.ADMIN_ALLOWED_EMAILS.split(',').map((e) => e.toLowerCase().trim()).filter(Boolean);
      if (allowedList.length > 0 && !allowedList.includes(normalizedEmail)) {
        return sendResponse(res, 403, false, 'Email address is not present in ADMIN_ALLOWED_EMAILS allowlist.');
      }
    }

    // Admin Password Security Policy (Phase 6): 12+ chars, uppercase, lowercase, digit, special char
    if (!password || typeof password !== 'string' || password.length < 12) {
      return sendResponse(res, 400, false, 'Admin password must be at least 12 characters long.');
    }
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    if (!hasUpper || !hasLower || !hasDigit || !hasSpecial) {
      return sendResponse(
        res,
        400,
        false,
        'Admin password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
      );
    }

    // One-time check: If an Admin user already exists in MongoDB, reject bootstrap!
    const existingAdminCount = await User.countDocuments({ role: 'admin' });
    if (existingAdminCount > 0) {
      return sendResponse(res, 403, false, 'Initial Admin user already exists. Bootstrap mechanism is locked.');
    }

    // Check if user email already exists
    let user = await User.findOne({ email: normalizedEmail });
    if (user) {
      return sendResponse(res, 400, false, 'User account already exists with this email address.');
    }

    // Create Admin user
    user = await User.create({
      name: (name || 'Administrator').trim(),
      email: normalizedEmail,
      password,
      role: 'admin',
      isEmailVerified: true, // Bootstrap admin is pre-verified
      isActive: true,
      profile: {
        isProfileComplete: true
      }
    });

    await logAdminAction({
      adminId: user._id,
      adminEmail: user.email,
      action: 'ADMIN_BOOTSTRAP_SUCCESS',
      req,
      metadata: { email: user.email }
    });

    return sendResponse(res, 201, true, 'Admin account created successfully via bootstrap!', {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify user email via token
// @route   GET /api/auth/verify-email
// @route   POST /api/auth/verify-email
// @access  Public
const verifyEmail = async (req, res, next) => {
  try {
    const token = req.query.token || req.body.token;
    const isHtmlRequest = req.method === 'GET' && (!req.headers.accept || !req.headers.accept.includes('application/json'));

    console.log(`\n[BACKEND EMAIL VERIFY ENDPOINT HIT] IP: ${req.ip} | User-Agent: ${req.headers['user-agent'] || 'Unknown'}`);

    if (!token) {
      if (isHtmlRequest) {
        return res.status(400).send(
          renderVerificationHtmlPage(
            'Verification Failed',
            'Verification Token Missing',
            'Email verification token is missing or invalid.',
            'error'
          )
        );
      }
      return sendResponse(res, 400, false, 'Email verification token is missing or invalid');
    }

    // Hash token to compare with stored hashed token
    const hashedToken = crypto.createHash('sha256').update(token.trim()).digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      if (isHtmlRequest) {
        return res.status(400).send(
          renderVerificationHtmlPage(
            'Verification Failed',
            'Verification Link Expired or Invalid',
            'This verification link is invalid or has expired. Please return to the website on your computer to request a new verification email.',
            'error'
          )
        );
      }
      return sendResponse(
        res,
        400,
        false,
        'Invalid or expired verification token. Please request a new verification email.'
      );
    }

    // Mark email as verified and invalidate token
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    console.log(`[BACKEND VERIFICATION SUCCESS] User ID: ${user._id} (${user.email}) marked as isEmailVerified = true in MongoDB.`);

    // Send welcome email asynchronously
    sendWelcomeEmail(user).catch((err) => console.error('Welcome Email Error:', err));

    if (isHtmlRequest) {
      return res.status(200).send(
        renderVerificationHtmlPage(
          'Email Verified',
          'Email Verified Successfully!',
          'Your email address has been verified. You can now return to your computer website and log in to your account.',
          'success'
        )
      );
    }

    return sendResponse(res, 200, true, 'Email verified successfully! You can now log in.', {
      email: user.email,
      isEmailVerified: true
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check email verification status for PC polling session
// @route   GET /api/auth/verification-status
// @access  Public (Scoped via verificationSessionId)
const getVerificationStatus = async (req, res, next) => {
  try {
    const verificationSessionId =
      (req.query && req.query.verificationSessionId) ||
      (req.body && req.body.verificationSessionId);

    if (!verificationSessionId || typeof verificationSessionId !== 'string') {
      return sendResponse(res, 400, false, 'Verification session ID is required');
    }

    const hashedSessionToken = crypto
      .createHash('sha256')
      .update(verificationSessionId.trim())
      .digest('hex');

    const user = await User.findOne({
      verificationSessionToken: hashedSessionToken,
      verificationSessionExpires: { $gt: Date.now() }
    });

    if (!user) {
      return sendResponse(res, 400, false, 'Invalid or expired verification session');
    }

    return sendResponse(res, 200, true, 'Verification status fetched', {
      isEmailVerified: user.isEmailVerified
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
const resendVerification = async (req, res, next) => {
  try {
    const { isValid, errors } = validateResendVerificationInput(req.body);
    if (!isValid) {
      const firstError = Object.values(errors)[0] || 'Validation Failed';
      return sendResponse(res, 400, false, firstError, null, errors);
    }

    const { email } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return sendResponse(res, 404, false, 'No account found with this email address');
    }

    if (user.isEmailVerified) {
      return sendResponse(
        res,
        400,
        false,
        'This email address has already been verified. Please proceed to log in.'
      );
    }

    // Generate new secure verification token and session token
    const unhashedToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(unhashedToken).digest('hex');
    const unhashedSessionToken = crypto.randomBytes(32).toString('hex');
    const hashedSessionToken = crypto.createHash('sha256').update(unhashedSessionToken).digest('hex');
    const tokenExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpires = tokenExpires;
    user.verificationSessionToken = hashedSessionToken;
    user.verificationSessionExpires = tokenExpires;
    await user.save();

    // Dispatch new verification email
    let emailResult = { success: false };
    try {
      emailResult = await sendVerificationEmail(user, unhashedToken);
    } catch (mailErr) {
      console.error('Email Resend Dispatch Exception:', mailErr);
    }

    if (emailResult && emailResult.success) {
      return sendResponse(
        res,
        200,
        true,
        'A new verification email has been sent. Please check your inbox and spam folder.',
        { emailSent: true, verificationSessionId: unhashedSessionToken }
      );
    } else {
      return sendResponse(
        res,
        400,
        false,
        'Failed to send verification email. Please check server email configuration or try again later.',
        { emailSent: false, verificationSessionId: unhashedSessionToken, emailError: emailResult ? emailResult.error : 'SMTP error' }
      );
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Initiate password reset (Send email with reset token)
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { isValid, errors } = validateForgotPasswordInput(req.body);
    if (!isValid) {
      const firstError = Object.values(errors)[0] || 'Validation Failed';
      return sendResponse(res, 400, false, firstError, null, errors);
    }

    const { email } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      // Generic success message to prevent user enumeration
      return sendResponse(
        res,
        200,
        true,
        'If an account exists for that email, a password reset link has been sent.'
      );
    }

    // Generate reset token
    const unhashedToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(unhashedToken).digest('hex');
    const tokenExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = tokenExpires;
    await user.save();

    await sendPasswordResetEmail(user, unhashedToken);

    return sendResponse(
      res,
      200,
      true,
      'If an account exists for that email, a password reset link has been sent.'
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password using valid token
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { isValid, errors } = validateResetPasswordInput(req.body);
    if (!isValid) {
      const firstError = Object.values(errors)[0] || 'Validation Failed';
      return sendResponse(res, 400, false, firstError, null, errors);
    }

    const { token, password } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token.trim()).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return sendResponse(
        res,
        400,
        false,
        'Invalid or expired password reset token. Please request a new link.'
      );
    }

    if (user.role === 'admin') {
      if (password.length < 12) {
        return sendResponse(res, 400, false, 'Admin password must be at least 12 characters long.');
      }
      const hasUpper = /[A-Z]/.test(password);
      const hasLower = /[a-z]/.test(password);
      const hasDigit = /[0-9]/.test(password);
      const hasSpecial = /[^A-Za-z0-9]/.test(password);
      if (!hasUpper || !hasLower || !hasDigit || !hasSpecial) {
        return sendResponse(
          res,
          400,
          false,
          'Admin password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
        );
      }

      await logAdminAction({
        adminId: user._id,
        adminEmail: user.email,
        action: 'ADMIN_PASSWORD_RESET_SUCCESS',
        req
      });
    }

    // Set new password and clear reset token fields
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return sendResponse(
      res,
      200,
      true,
      'Password reset successful! You can now log in with your new password.'
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile & authentication status
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return sendResponse(res, 404, false, 'User profile not found');
    }
    return sendResponse(res, 200, true, 'User profile fetched successfully', user);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  adminBootstrap,
  verifyEmail,
  getVerificationStatus,
  resendVerification,
  forgotPassword,
  resetPassword,
  getMe
};
