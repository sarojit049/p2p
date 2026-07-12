const logger = require('../utils/logger');
const { sendError } = require('../utils/responseHelper');

/**
 * Global Error Handler Middleware
 * Must be registered last in app.js.
 * Never exposes stack traces or internal error details to clients.
 * Per 13_SECURITY_POLICY.md section 16.
 */
const errorHandler = (err, req, res, next) => {
  // Log full error server-side (never to client)
  logger.error(`${req.method} ${req.originalUrl} - ${err.message}`);

  if (process.env.NODE_ENV === 'development') {
    logger.debug(err.stack);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return sendError(res, 422, messages.join(', '), { code: 'VALIDATION_ERROR' });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return sendError(res, 409, `${field} already exists.`, { code: 'DUPLICATE_KEY' });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 401, 'Invalid token.', { code: 'AUTH_003' });
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 401, 'Session expired. Please login again.', { code: 'AUTH_002' });
  }

  // Default 500 — safe message only
  return sendError(res, err.statusCode || 500, err.message || 'Internal server error.', {
    code: 'SERVER_ERROR',
  });
};

module.exports = errorHandler;
