const { validationResult } = require('express-validator');
const userService = require('../services/userService');
const { sendSuccess, sendError } = require('../utils/responseHelper');

/**
 * User Controller — thin, delegates to userService.
 * POST /api/v1/users/username
 * GET  /api/v1/users/search
 * GET  /api/v1/users/profile
 */

const createUsername = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 422, 'Validation failed.', errors.array());
    }

    const { username } = req.body;
    const user = await userService.createUsername(req.user._id, username);

    return sendSuccess(res, 200, 'Username created successfully.', {
      user: {
        _id: user._id,
        username: user.username,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

const searchUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 422, 'Validation failed.', errors.array());
    }

    const { username } = req.query;
    const users = await userService.searchByUsername(username, req.user._id);

    return sendSuccess(res, 200, users.length > 0 ? 'Users found.' : 'No user found.', { users });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await userService.getProfile(req.user._id);
    return sendSuccess(res, 200, 'Profile retrieved.', { user });
  } catch (error) {
    next(error);
  }
};

module.exports = { createUsername, searchUser, getProfile };
