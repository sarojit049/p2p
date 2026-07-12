const { validationResult } = require('express-validator');
const adminService = require('../services/adminService');
const { sendSuccess, sendError } = require('../utils/responseHelper');

/**
 * Admin Controller — thin, delegates to adminService.
 */

const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 422, 'Validation failed.', errors.array());
    }

    const { username, password } = req.body;
    const { token, user } = await adminService.adminLogin(username, password);

    return sendSuccess(res, 200, 'Admin login successful.', {
      token,
      user: {
        _id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

const generateSecretCode = async (req, res, next) => {
  try {
    const result = await adminService.generateSecretCode(req.user._id);
    return sendSuccess(res, 201, 'Secret Code generated. Store it safely — it will not be shown again.', {
      secretCode: result.secretCode,
      id: result.id,
    });
  } catch (error) {
    next(error);
  }
};

const listUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const result = await adminService.listUsers(page, limit);
    return sendSuccess(res, 200, 'Users retrieved.', result);
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await adminService.getUserById(req.params.id);
    return sendSuccess(res, 200, 'User retrieved.', { user });
  } catch (error) {
    next(error);
  }
};

const blockUser = async (req, res, next) => {
  try {
    // Pass socketManager from app locals if available
    const socketManager = req.app.locals.socketManager;
    const user = await adminService.blockUser(req.params.id, socketManager);
    return sendSuccess(res, 200, 'User blocked.', {
      user: { _id: user._id, username: user.username, status: user.status },
    });
  } catch (error) {
    next(error);
  }
};

const unblockUser = async (req, res, next) => {
  try {
    const user = await adminService.unblockUser(req.params.id);
    return sendSuccess(res, 200, 'User unblocked.', {
      user: { _id: user._id, username: user.username, status: user.status },
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    await adminService.deleteUser(req.params.id);
    return sendSuccess(res, 200, 'User and related data deleted successfully.');
  } catch (error) {
    next(error);
  }
};

const listSecretCodes = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const result = await adminService.listSecretCodes(page, limit);
    return sendSuccess(res, 200, 'Secret codes retrieved.', result);
  } catch (error) {
    next(error);
  }
};

const getDashboard = async (req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats();
    return sendSuccess(res, 200, 'Dashboard statistics retrieved.', stats);
  } catch (error) {
    next(error);
  }
};

const getChatHistory = async (req, res, next) => {
  try {
    const { sender, receiver, startDate, endDate, page, limit } = req.query;
    const result = await adminService.getChatHistory({
      sender,
      receiver,
      startDate,
      endDate,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 50,
    });
    return sendSuccess(res, 200, 'Chat history retrieved.', result);
  } catch (error) {
    next(error);
  }
};

const getCallHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const result = await adminService.getCallHistory(page, limit);
    return sendSuccess(res, 200, 'Call history retrieved.', result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  generateSecretCode,
  listUsers,
  getUserById,
  blockUser,
  unblockUser,
  deleteUser,
  listSecretCodes,
  getDashboard,
  getChatHistory,
  getCallHistory,
};
