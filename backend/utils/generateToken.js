const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'scholarship_matcher_secret_jwt_key_2026_dev',
    { expiresIn: '30d' }
  );
};

module.exports = generateToken;
