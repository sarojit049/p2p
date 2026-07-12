const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/responseHelper');

/**
 * JWT Authentication Middleware
 * Verifies token, checks user exists, checks user status (blocks blocked users).
 * Per 13_SECURITY_POLICY.md section 3 and 17.
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 401, 'Access denied. No token provided.', { code: 'AUTH_003' });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-__v');

    if (!user) {
      return sendError(res, 401, 'User not found.', { code: 'AUTH_003' });
    }

    if (user.status === 'blocked') {
      return sendError(res, 403, 'Your account has been blocked. Contact administrator.', {
        code: 'AUTH_003',
      });
    }

    if (user.status === 'inactive') {
      return sendError(res, 403, 'Your account is inactive.', { code: 'AUTH_003' });
    }

    // Attach user to request for downstream use
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authMiddleware;
