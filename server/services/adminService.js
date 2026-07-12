const bcrypt = require('bcrypt');
const { customAlphabet } = require('nanoid');
const SecretCode = require('../models/SecretCode');
const User = require('../models/User');
const Chat = require('../models/Chat');
const Call = require('../models/Call');
const authService = require('./authService');
const logger = require('../utils/logger');

// Alphanumeric alphabet for Secret Code generation (no ambiguous chars like 0/O, 1/I)
const generateId = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 12);

// Cached hash of admin password to avoid hashing on every login
let cachedAdminHash = null;

/**
 * Admin Login
 * Validates against ADMIN_USERNAME and ADMIN_PASSWORD environment variables.
 * Hashes the password on first use and caches it.
 * Per 13_SECURITY_POLICY.md — Admin Security
 */
const adminLogin = async (username, password) => {
  if (username !== process.env.ADMIN_USERNAME) {
    const error = new Error('Invalid admin credentials.');
    error.statusCode = 401;
    error.code = 'ADMIN_001';
    throw error;
  }

  // Hash admin password on first call and cache it
  if (!cachedAdminHash) {
    cachedAdminHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, authService.BCRYPT_ROUNDS);
    logger.info('Admin password hash initialized.');
  }

  const isMatch = await bcrypt.compare(password, cachedAdminHash);

  if (!isMatch) {
    const error = new Error('Invalid admin credentials.');
    error.statusCode = 401;
    error.code = 'ADMIN_001';
    throw error;
  }

  // Find or create admin user record
  let adminUser = await User.findOne({ role: 'admin' });

  if (!adminUser) {
    adminUser = await User.create({
      username: process.env.ADMIN_USERNAME,
      role: 'admin',
      status: 'active',
      lastSeen: new Date(),
    });
    logger.info('Admin user record created.');
  }

  adminUser.lastSeen = new Date();
  await adminUser.save();

  const token = authService.generateToken(adminUser);

  logger.info('Admin login successful.');

  return { token, user: adminUser };
};

/**
 * Generate a new Secret Code.
 * Hashes the code and stores only the hash.
 * Returns the plaintext code ONCE — never again.
 * Per 04_SECURITY_POLICY.md and 06_API_SPECIFICATION.md
 */
const generateSecretCode = async (adminUserId) => {
  const plainCode = generateId();
  const hash = await bcrypt.hash(plainCode, authService.BCRYPT_ROUNDS);

  const secretCode = await SecretCode.create({
    secretCodeHash: hash,
    generatedBy: adminUserId,
    isUsed: false,
  });

  logger.info(`Secret Code generated. ID: ${secretCode._id}`);

  // Return the plaintext ONCE. It will never be retrievable again.
  return { secretCode: plainCode, id: secretCode._id };
};

/**
 * List all users with pagination.
 */
const listUsers = async (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const users = await User.find({ role: 'user' })
    .select('_id username status lastSeen createdAt')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments({ role: 'user' });

  return { users, total, page, limit };
};

/**
 * Get a single user by ID with Secret Code metadata.
 */
const getUserById = async (userId) => {
  const user = await User.findById(userId)
    .select('_id username role status profileImage lastSeen createdAt')
    .populate('secretCodeId', '_id isUsed createdAt');

  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    error.code = 'USER_002';
    throw error;
  }

  return user;
};

/**
 * Block a user and disconnect their socket if active.
 */
const blockUser = async (userId, socketManager) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { status: 'blocked' },
    { new: true }
  );

  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    error.code = 'USER_002';
    throw error;
  }

  // Disconnect socket if socketManager is provided
  if (socketManager) {
    socketManager.disconnectUser(userId.toString());
  }

  logger.info(`User blocked. UserID: ${userId}`);
  return user;
};

/**
 * Unblock a user.
 */
const unblockUser = async (userId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { status: 'active' },
    { new: true }
  );

  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    error.code = 'USER_002';
    throw error;
  }

  logger.info(`User unblocked. UserID: ${userId}`);
  return user;
};

/**
 * Delete a user and their related data.
 */
const deleteUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    error.code = 'USER_002';
    throw error;
  }

  if (user.role === 'admin') {
    const error = new Error('Admin account cannot be deleted.');
    error.statusCode = 403;
    throw error;
  }

  // Remove associated secret code assignment
  if (user.secretCodeId) {
    await SecretCode.findByIdAndDelete(user.secretCodeId);
  }

  // Delete user messages
  await Chat.deleteMany({ $or: [{ senderId: userId }, { receiverId: userId }] });

  // Delete user call history
  await Call.deleteMany({ $or: [{ callerId: userId }, { receiverId: userId }] });

  // Delete user
  await User.findByIdAndDelete(userId);

  logger.info(`User deleted. UserID: ${userId}`);
};

/**
 * List all Secret Codes (metadata only, no hashes, no plaintext).
 */
const listSecretCodes = async (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const codes = await SecretCode.find()
    .select('_id isUsed assignedUser createdAt')
    .populate('assignedUser', 'username status')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await SecretCode.countDocuments();
  return { codes, total, page, limit };
};

/**
 * Get dashboard statistics.
 */
const getDashboardStats = async () => {
  const [totalUsers, activeUsers, blockedUsers, totalChats, totalCalls, usedCodes, unusedCodes] =
    await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'user', status: 'active' }),
      User.countDocuments({ role: 'user', status: 'blocked' }),
      Chat.countDocuments(),
      Call.countDocuments(),
      SecretCode.countDocuments({ isUsed: true }),
      SecretCode.countDocuments({ isUsed: false }),
    ]);

  return {
    totalUsers,
    activeUsers,
    blockedUsers,
    totalChats,
    totalCalls,
    usedCodes,
    unusedCodes,
  };
};

/**
 * Get chat history for admin view with optional filters.
 */
const getChatHistory = async ({ sender, receiver, startDate, endDate, page = 1, limit = 50 }) => {
  const filter = {};

  if (sender) filter.senderId = sender;
  if (receiver) filter.receiverId = receiver;

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const skip = (page - 1) * limit;

  const chats = await Chat.find(filter)
    .populate('senderId', 'username')
    .populate('receiverId', 'username')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Chat.countDocuments(filter);

  return { chats, total, page, limit };
};

/**
 * Get call history for admin view.
 */
const getCallHistory = async (page = 1, limit = 50) => {
  const skip = (page - 1) * limit;
  const calls = await Call.find()
    .populate('callerId', 'username')
    .populate('receiverId', 'username')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Call.countDocuments();
  return { calls, total, page, limit };
};

module.exports = {
  adminLogin,
  generateSecretCode,
  listUsers,
  getUserById,
  blockUser,
  unblockUser,
  deleteUser,
  listSecretCodes,
  getDashboardStats,
  getChatHistory,
  getCallHistory,
};
