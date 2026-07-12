const { sendError } = require('../utils/responseHelper');

/**
 * Admin Role Middleware
 * Must be used AFTER authMiddleware.
 * Rejects any authenticated user who is not an admin.
 * Per 13_SECURITY_POLICY.md section 19.
 */
const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return sendError(res, 403, 'Access denied. Admin privileges required.', {
      code: 'ADMIN_001',
    });
  }
  next();
};

module.exports = adminMiddleware;
