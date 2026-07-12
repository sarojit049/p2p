const Chat = require('../models/Chat');
const User = require('../models/User');
const logger = require('../utils/logger');

const PAGE_SIZE = 30;

/**
 * Chat Service
 * Business logic for sending and retrieving messages.
 * Per 06_API_SPECIFICATION.md — Chat Module
 * Per 05_DATABASE_DESIGN.md section 5
 */

/**
 * Send a message from one user to another.
 * Validates the receiver exists and is active.
 * Returns the saved message document.
 */
const sendMessage = async (senderId, receiverId, message) => {
  // Validate receiver exists and is active
  const receiver = await User.findById(receiverId).select('_id status username');
  if (!receiver) {
    const error = new Error('Recipient not found.');
    error.statusCode = 404;
    error.code = 'USER_002';
    throw error;
  }

  if (receiver.status === 'blocked' || receiver.status === 'inactive') {
    const error = new Error('Cannot send message to this user.');
    error.statusCode = 403;
    throw error;
  }

  const newMessage = await Chat.create({
    senderId,
    receiverId,
    message: message.trim(),
    messageType: 'text',
    isRead: false,
  });

  return newMessage.populate([
    { path: 'senderId', select: 'username profileImage' },
    { path: 'receiverId', select: 'username profileImage' },
  ]);
};

/**
 * Get conversation between two users with pagination.
 * Default page size: 30 messages.
 */
const getConversation = async (userId1, userId2, page = 1) => {
  const skip = (page - 1) * PAGE_SIZE;

  const messages = await Chat.find({
    $or: [
      { senderId: userId1, receiverId: userId2 },
      { senderId: userId2, receiverId: userId1 },
    ],
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(PAGE_SIZE)
    .populate('senderId', 'username profileImage')
    .populate('receiverId', 'username profileImage');

  // Return in chronological order for UI
  return messages.reverse();
};

/**
 * Mark messages as read (from a specific sender to current user).
 */
const markAsRead = async (senderId, receiverId) => {
  await Chat.updateMany(
    { senderId, receiverId, isRead: false },
    { isRead: true }
  );
};

/**
 * Get a list of recent conversations for a user (for dashboard).
 * Returns the last message from each unique conversation partner.
 */
const getRecentConversations = async (userId) => {
  const recentMessages = await Chat.aggregate([
    {
      $match: {
        $or: [{ senderId: userId }, { receiverId: userId }],
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: {
          $cond: {
            if: { $eq: ['$senderId', userId] },
            then: '$receiverId',
            else: '$senderId',
          },
        },
        lastMessage: { $first: '$$ROOT' },
      },
    },
    { $sort: { 'lastMessage.createdAt': -1 } },
    { $limit: 20 },
  ]);

  return recentMessages;
};

module.exports = {
  sendMessage,
  getConversation,
  markAsRead,
  getRecentConversations,
};
