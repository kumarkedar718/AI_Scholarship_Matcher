const { sendResponse } = require('../utils/responseHandler');

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  const message = err.message || 'Internal Server Error';

  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);

  return sendResponse(
    res,
    statusCode,
    false,
    message,
    null,
    process.env.NODE_ENV === 'development' ? { stack: err.stack } : null
  );
};

module.exports = { notFound, errorHandler };
