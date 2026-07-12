const Call = require('../models/Call');
const logger = require('../utils/logger');

/**
 * Call Service
 * Business logic for call management and history.
 * Per 06_API_SPECIFICATION.md — Call Module
 * Per 05_DATABASE_DESIGN.md section 6
 */

/**
 * Record the start of a call.
 */
const startCall = async (callerId, receiverId, callType) => {
  if (!['voice', 'video'].includes(callType)) {
    const error = new Error('Invalid call type. Must be voice or video.');
    error.statusCode = 400;
    error.code = 'CALL_001';
    throw error;
  }

  const call = await Call.create({
    callerId,
    receiverId,
    callType,
    status: 'missed', // Default until accepted
    startTime: new Date(),
  });

  logger.info(`Call started. CallID: ${call._id} Type: ${callType}`);
  return call;
};

/**
 * Update call status and calculate duration when call ends.
 */
const endCall = async (callId, status, userId) => {
  const validStatuses = ['missed', 'accepted', 'rejected', 'ended'];
  if (!validStatuses.includes(status)) {
    const error = new Error('Invalid call status.');
    error.statusCode = 400;
    throw error;
  }

  const call = await Call.findById(callId);

  if (!call) {
    const error = new Error('Call record not found.');
    error.statusCode = 404;
    throw error;
  }

  const endTime = new Date();
  let duration = 0;

  if (call.startTime && status === 'ended') {
    duration = Math.floor((endTime - call.startTime) / 1000); // seconds
  }

  call.status = status;
  call.endTime = endTime;
  call.duration = duration;
  await call.save();

  logger.info(`Call ended. CallID: ${callId} Status: ${status} Duration: ${duration}s`);
  return call;
};

/**
 * Get call history for a user.
 */
const getCallHistory = async (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const calls = await Call.find({
    $or: [{ callerId: userId }, { receiverId: userId }],
  })
    .populate('callerId', 'username profileImage')
    .populate('receiverId', 'username profileImage')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Call.countDocuments({
    $or: [{ callerId: userId }, { receiverId: userId }],
  });

  return { calls, total, page, limit };
};

module.exports = {
  startCall,
  endCall,
  getCallHistory,
};
