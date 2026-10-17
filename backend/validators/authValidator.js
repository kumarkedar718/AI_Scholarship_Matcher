const validator = require('validator');

/**
 * Helper to strictly validate email format & domain structure
 */
const isValidEmailAddress = (email) => {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  
  // Use validator library for general email format & TLD requirement
  if (!validator.isEmail(trimmed, { allow_utf8_local_part: false, require_tld: true })) {
    return false;
  }

  // Double check domain structure: must have '@' with valid local and domain parts
  const parts = trimmed.split('@');
  if (parts.length !== 2) return false;

  const [local, domain] = parts;
  if (!local || local.length === 0) return false;
  if (!domain || domain.length === 0) return false;

  // Domain must have a dot separating domain name and TLD (e.g. gmail.com)
  const domainParts = domain.split('.');
  if (domainParts.length < 2) return false;

  // Each domain part must not be empty, and top-level domain (TLD) must be at least 2 chars
  const tld = domainParts[domainParts.length - 1];
  const mainDomain = domainParts[0];

  if (!mainDomain || mainDomain.length === 0) return false;
  if (!tld || tld.length < 2) return false;

  return true;
};

const validateRegisterInput = (data) => {
  const errors = {};
  const name = data.name ? data.name.trim() : '';
  const email = data.email ? data.email.trim() : '';
  const password = data.password || '';

  if (!name) {
    errors.name = 'Name is required';
  }

  if (!email) {
    errors.email = 'Email address is required';
  } else if (!isValidEmailAddress(email)) {
    errors.email = 'Please provide a valid email address with a valid domain (e.g., user@example.com)';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters long';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

const validateLoginInput = (data) => {
  const errors = {};
  const email = data.email ? data.email.trim() : '';
  const password = data.password || '';

  if (!email) {
    errors.email = 'Email address is required';
  } else if (!isValidEmailAddress(email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!password) {
    errors.password = 'Password is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

const validateResendVerificationInput = (data) => {
  const errors = {};
  const email = data.email ? data.email.trim() : '';

  if (!email) {
    errors.email = 'Email address is required';
  } else if (!isValidEmailAddress(email)) {
    errors.email = 'Please enter a valid email address';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

const validateForgotPasswordInput = (data) => {
  const errors = {};
  const email = data.email ? data.email.trim() : '';

  if (!email) {
    errors.email = 'Email address is required';
  } else if (!isValidEmailAddress(email)) {
    errors.email = 'Please enter a valid email address';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

const validateResetPasswordInput = (data) => {
  const errors = {};
  const token = data.token ? data.token.trim() : '';
  const password = data.password || '';

  if (!token) {
    errors.token = 'Reset token is required';
  }

  if (!password) {
    errors.password = 'New password is required';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters long';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

module.exports = {
  isValidEmailAddress,
  validateRegisterInput,
  validateLoginInput,
  validateResendVerificationInput,
  validateForgotPasswordInput,
  validateResetPasswordInput
};
