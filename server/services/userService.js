const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * User Service
 * Business logic for user management.
 * Per 06_API_SPECIFICATION.md — User Module
 */

/**
 * Set username for a user (first-time setup after Secret Code login).
 * Validates uniqueness and format rules from 05_DATABASE_DESIGN.md.
 */
const createUsername = async (userId, username) => {
  const trimmed = username.trim();

  // Check uniqueness
  const existing = await User.findOne({ username: trimmed });
  if (existing) {
    const error = new Error('Username already taken. Please choose another.');
    error.statusCode = 409;
    error.code = 'USER_001';
    throw error;
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { username: trimmed },
    { new: true, runValidators: true }
  );

  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    error.code = 'USER_002';
    throw error;
  }

  logger.info(`Username set for UserID: ${userId} → "${trimmed}"`);
  return user;
};

/**
 * Search users by username (case-insensitive, partial match).
 * Excludes the searching user from results.
 * Excludes blocked users.
 */
const searchByUsername = async (query, currentUserId) => {
  if (!query || query.trim().length < 1) {
    return [];
  }

  const users = await User.find({
    username: { $regex: query.trim(), $options: 'i' },
    _id: { $ne: currentUserId },
    status: 'active',
  })
    .select('_id username status lastSeen profileImage')
    .limit(20);

  return users;
};

/**
 * Get user profile by user ID.
 */
const getProfile = async (userId) => {
  const user = await User.findById(userId).select(
    '_id username role status profileImage lastSeen createdAt'
  );

  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    error.code = 'USER_002';
    throw error;
  }

  return user;
};

/**
 * Update lastSeen timestamp for a user.
 */
const updateLastSeen = async (userId) => {
  await User.findByIdAndUpdate(userId, { lastSeen: new Date() });
};

module.exports = {
  createUsername,
  searchByUsername,
  getProfile,
  updateLastSeen,
};
