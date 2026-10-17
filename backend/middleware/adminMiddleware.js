const { sendResponse } = require('../utils/responseHandler');

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return sendResponse(res, 403, false, 'Access denied. Administrator privilege required.');
  }
};

module.exports = { adminOnly };
