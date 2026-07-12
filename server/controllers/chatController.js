const { validationResult } = require('express-validator');
const chatService = require('../services/chatService');
const { sendSuccess, sendError } = require('../utils/responseHelper');

/**
 * Chat Controller
 * POST /api/v1/chat/send
 * GET  /api/v1/chat/:userId
 * GET  /api/v1/chat/conversations
 */

const sendMessage = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 422, 'Validation failed.', errors.array());
    }

    const { receiverId, message } = req.body;
    const savedMessage = await chatService.sendMessage(req.user._id, receiverId, message);

    // Emit via Socket.io if available
    const io = req.app.locals.io;
    if (io) {
      io.to(`user:${receiverId}`).emit('new_message', {
        message: savedMessage,
      });
    }

    return sendSuccess(res, 201, 'Message sent.', { message: savedMessage });
  } catch (error) {
    next(error);
  }
};

const uploadFiles = async (req, res, next) => {
  try {
    const { receiverId } = req.body;
    let durations = req.body.durations || req.body.duration;
    
    if (durations && typeof durations === 'string') {
      try { durations = JSON.parse(durations); } catch(e) { durations = [durations]; }
    }
    if (durations && !Array.isArray(durations)) {
      durations = [durations];
    }
    
    if (!receiverId) {
      return sendError(res, 400, 'Receiver ID is required.');
    }

    if (!req.files || req.files.length === 0) {
      return sendError(res, 400, 'No files uploaded.');
    }

    const savedMessages = [];
    const io = req.app.locals.io;

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const duration = durations && durations[i] ? Number(durations[i]) : null;

      const fileData = {
        fileName: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        fileUrl: `/uploads/${file.filename}`,
        duration
      };

      const savedMessage = await chatService.saveMediaMessage(req.user._id, receiverId, fileData);
      savedMessages.push(savedMessage);

      // Emit via Socket.io if available
      if (io) {
        io.to(`user:${receiverId}`).emit('new_message', {
          message: savedMessage,
        });
        
        // Also emit to sender to confirm across their own devices (though UI adds it directly usually)
        // io.to(`user:${req.user._id}`).emit('new_message', { message: savedMessage });
      }
    }

    return sendSuccess(res, 201, 'Files uploaded successfully.', { messages: savedMessages });
  } catch (error) {
    next(error);
  }
};

const getConversation = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;

    const messages = await chatService.getConversation(req.user._id, userId, page);

    // Mark messages from the other user as read
    await chatService.markAsRead(userId, req.user._id);

    return sendSuccess(res, 200, 'Conversation retrieved.', { messages, page });
  } catch (error) {
    next(error);
  }
};

const getRecentConversations = async (req, res, next) => {
  try {
    const conversations = await chatService.getRecentConversations(req.user._id);
    return sendSuccess(res, 200, 'Recent conversations retrieved.', { conversations });
  } catch (error) {
    next(error);
  }
};

module.exports = { sendMessage, uploadFiles, getConversation, getRecentConversations };
