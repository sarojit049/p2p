const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const { loginValidator } = require('../validators/authValidator');
const rateLimit = require('express-rate-limit');

// Strict rate limiter for login — per 13_SECURITY_POLICY.md section 11
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again in 15 minutes.',
    error: { code: 'RATE_LIMIT' },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/v1/auth/login (Public)
router.post('/login', loginRateLimiter, loginValidator, authController.login);

// POST /api/v1/auth/logout (Protected)
router.post('/logout', authMiddleware, authController.logout);

// GET /api/v1/auth/me (Protected)
router.get('/me', authMiddleware, authController.me);

module.exports = router;
