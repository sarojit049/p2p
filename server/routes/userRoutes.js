const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const { createUsernameValidator, searchUsernameValidator } = require('../validators/userValidator');
const rateLimit = require('express-rate-limit');

const searchRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: {
    success: false,
    message: 'Too many search requests. Please slow down.',
    error: { code: 'RATE_LIMIT' },
  },
});

// All user routes are protected
router.use(authMiddleware);

// POST /api/v1/users/username
router.post('/username', createUsernameValidator, userController.createUsername);

// GET /api/v1/users/search?username=
router.get('/search', searchRateLimiter, searchUsernameValidator, userController.searchUser);

// GET /api/v1/users/profile
router.get('/profile', userController.getProfile);

module.exports = router;
