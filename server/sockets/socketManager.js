const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Socket.io Manager
 * Per 07_SOCKET_IO_SPECIFICATION.md
 *
 * Responsibilities:
 * - JWT authentication on handshake
 * - One room per user: user:<userId>
 * - Online/offline presence
 * - Typing indicators
 * - Message relay (after REST API stores to DB)
 * - WebRTC signaling: call_user, call_accepted, call_rejected, ice_candidate, call_ended
 *
 * NOT responsible for: authentication, database, business logic.
 */

// Track online users: userId → socketId
const onlineUsers = new Map();

const initializeSocket = (io) => {
  // ----------------------------------------------------------------
  // Authentication Middleware — Per 07_SOCKET_IO_SPECIFICATION.md
  // Every socket must belong to an authenticated user.
  // ----------------------------------------------------------------
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication required. No token provided.'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('_id username status role');

      if (!user) {
        return next(new Error('Authentication failed. User not found.'));
      }

      if (user.status === 'blocked') {
        return next(new Error('Access denied. Account blocked.'));
      }

      // Attach user to socket
      socket.user = user;
      next();
    } catch (error) {
      logger.warn(`Socket authentication failed: ${error.message}`);
      next(new Error('Authentication failed. Invalid token.'));
    }
  });

  // ----------------------------------------------------------------
  // Connection Handler
  // ----------------------------------------------------------------
  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    const username = socket.user.username;

    // Join personal room: user:<userId>
    socket.join(`user:${userId}`);

    // Track online status
    onlineUsers.set(userId, socket.id);

    logger.info(`Socket connected: ${username} (${userId})`);

    // Broadcast online status to all connected clients
    io.emit('user_online', { userId, username });

    // ---------------------------------------------------------------
    // Typing Indicators
    // ---------------------------------------------------------------
    socket.on('typing_start', ({ receiverId }) => {
      if (!receiverId) return;
      io.to(`user:${receiverId}`).emit('typing_start', {
        senderId: userId,
        senderUsername: username,
      });
    });

    socket.on('typing_stop', ({ receiverId }) => {
      if (!receiverId) return;
      io.to(`user:${receiverId}`).emit('typing_stop', {
        senderId: userId,
      });
    });

    // ---------------------------------------------------------------
    // WebRTC Signaling — Per 08_WEBRTC_SPECIFICATION.md
    // Socket.io is ONLY for signaling. Media is peer-to-peer.
    // ---------------------------------------------------------------

    // Caller initiates a call
    socket.on('call_user', ({ receiverId, callType, callId }) => {
      if (!receiverId || !callType) return;

      logger.info(`Call initiated: ${userId} → ${receiverId} [${callType}]`);

      io.to(`user:${receiverId}`).emit('incoming_call', {
        callerId: userId,
        callerUsername: username,
        callType,
        callId,
      });
    });

    // Receiver accepts — sends WebRTC offer
    socket.on('call_accepted', ({ callerId, offer, callId }) => {
      if (!callerId) return;
      io.to(`user:${callerId}`).emit('call_accepted', {
        receiverId: userId,
        offer,
        callId,
      });
    });

    // Receiver rejects
    socket.on('call_rejected', ({ callerId, callId }) => {
      if (!callerId) return;
      io.to(`user:${callerId}`).emit('call_rejected', {
        receiverId: userId,
        callId,
      });
    });

    // WebRTC Offer (caller → receiver)
    socket.on('webrtc_offer', ({ receiverId, offer }) => {
      if (!receiverId) return;
      io.to(`user:${receiverId}`).emit('webrtc_offer', {
        senderId: userId,
        offer,
      });
    });

    // WebRTC Answer (receiver → caller)
    socket.on('webrtc_answer', ({ callerId, answer }) => {
      if (!callerId) return;
      io.to(`user:${callerId}`).emit('webrtc_answer', {
        senderId: userId,
        answer,
      });
    });

    // ICE Candidates exchange
    socket.on('ice_candidate', ({ receiverId, candidate }) => {
      if (!receiverId) return;
      io.to(`user:${receiverId}`).emit('ice_candidate', {
        senderId: userId,
        candidate,
      });
    });

    // End call — notify the other party
    socket.on('call_ended', ({ receiverId, callId }) => {
      if (!receiverId) return;
      io.to(`user:${receiverId}`).emit('call_ended', {
        senderId: userId,
        callId,
      });
    });

    // ---------------------------------------------------------------
    // Disconnect Handler
    // ---------------------------------------------------------------
    socket.on('disconnect', async () => {
      onlineUsers.delete(userId);

      // Update lastSeen in DB
      try {
        await User.findByIdAndUpdate(userId, { lastSeen: new Date() });
      } catch (e) {
        logger.error(`Failed to update lastSeen on disconnect: ${e.message}`);
      }

      logger.info(`Socket disconnected: ${username} (${userId})`);

      // Broadcast offline status
      io.emit('user_offline', { userId, username });
    });
  });

  // ---------------------------------------------------------------
  // Public API: Get online users list
  // ---------------------------------------------------------------
  const getOnlineUsers = () => Array.from(onlineUsers.keys());

  // ---------------------------------------------------------------
  // Public API: Force disconnect a user (used by block action)
  // ---------------------------------------------------------------
  const disconnectUser = (userId) => {
    const socketId = onlineUsers.get(userId);
    if (socketId) {
      const socket = io.sockets.sockets.get(socketId);
      if (socket) {
        socket.emit('force_disconnect', { reason: 'Your account has been blocked.' });
        socket.disconnect(true);
        logger.info(`Force disconnected user: ${userId}`);
      }
      onlineUsers.delete(userId);
    }
  };

  return { getOnlineUsers, disconnectUser };
};

module.exports = { initializeSocket };
