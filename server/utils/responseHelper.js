/**
 * Response Helper Utilities
 * Ensures consistent JSON response format across all APIs per 06_API_SPECIFICATION.md
 *
 * Success: { success: true, message, data }
 * Error:   { success: false, message, error }
 */

const sendSuccess = (res, statusCode = 200, message = 'Operation successful.', data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const sendError = (res, statusCode = 500, message = 'An error occurred.', error = {}) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error,
  });
};

module.exports = { sendSuccess, sendError };
