const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');
const { adminLoginValidator } = require('../validators/adminValidator');

// Strict rate limit for admin login
const adminLoginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many admin login attempts. Please try again later.',
    error: { code: 'RATE_LIMIT' },
  },
});

// POST /api/v1/admin/login (Public)
router.post('/login', adminLoginRateLimiter, adminLoginValidator, adminController.login);

// All routes below require JWT + admin role
router.use(authMiddleware, adminMiddleware);

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// Secret Codes
router.post('/secret-codes', adminController.generateSecretCode);
router.get('/secret-codes', adminController.listSecretCodes);

// Users
router.get('/users', adminController.listUsers);
router.get('/users/:id', adminController.getUserById);
router.patch('/users/:id/block', adminController.blockUser);
router.patch('/users/:id/unblock', adminController.unblockUser);
router.delete('/users/:id', adminController.deleteUser);

// Chat & Call History
router.get('/chats', adminController.getChatHistory);
router.get('/calls', adminController.getCallHistory);

module.exports = router;
