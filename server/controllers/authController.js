const { validationResult } = require('express-validator');
const authService = require('../services/authService');
const { sendSuccess, sendError } = require('../utils/responseHelper');
const logger = require('../utils/logger');

/**
 * Auth Controller — thin layer, delegates to authService.
 * POST /api/v1/auth/login
 * POST /api/v1/auth/logout
 * GET  /api/v1/auth/me
 */

const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 422, 'Validation failed.', errors.array());
    }

    const { secretCode } = req.body;

    const { token, user, isNewUser } = await authService.loginWithSecretCode(secretCode);

    logger.info(`Login attempt succeeded. UserID: ${user._id}`);

    return sendSuccess(res, 200, 'Login successful.', {
      token,
      user: {
        _id: user._id,
        username: user.username,
        role: user.role,
        status: user.status,
        lastSeen: user.lastSeen,
      },
      isNewUser,
    });
  } catch (error) {
    // Log attempt (but not the actual secret code)
    logger.warn(`Failed login attempt from IP: ${req.ip}`);
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    // JWT is stateless — client removes token.
    // Update lastSeen on logout.
    req.user.lastSeen = new Date();
    await req.user.save();

    logger.info(`User logged out. UserID: ${req.user._id}`);

    return sendSuccess(res, 200, 'Logged out successfully.');
  } catch (error) {
    next(error);
  }
};

const me = async (req, res, next) => {
  try {
    return sendSuccess(res, 200, 'User retrieved.', {
      user: {
        _id: req.user._id,
        username: req.user.username,
        role: req.user.role,
        status: req.user.status,
        profileImage: req.user.profileImage,
        lastSeen: req.user.lastSeen,
        createdAt: req.user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { login, logout, me };
