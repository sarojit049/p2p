const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

const chatController = require('../controllers/chatController');
const authMiddleware = require('../middlewares/authMiddleware');
const uploadMiddleware = require('../middlewares/uploadMiddleware');
const { sendMessageValidator } = require('../validators/chatValidator');

const chatRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: {
    success: false,
    message: 'Too many requests. Please slow down.',
    error: { code: 'RATE_LIMIT' },
  },
});

// All chat routes are protected
router.use(authMiddleware);

// POST /api/v1/chat/send
router.post('/send', chatRateLimiter, sendMessageValidator, chatController.sendMessage);

// POST /api/v1/chat/upload
router.post('/upload', chatRateLimiter, uploadMiddleware.array('files', 10), chatController.uploadFiles);

// GET /api/v1/chat/conversations
router.get('/conversations', chatController.getRecentConversations);

// GET /api/v1/chat/:userId
router.get('/:userId', chatController.getConversation);

module.exports = router;
