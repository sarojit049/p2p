const express = require('express');
const router = express.Router();

const callController = require('../controllers/callController');
const authMiddleware = require('../middlewares/authMiddleware');

// All call routes are protected
router.use(authMiddleware);

// POST /api/v1/call/start
router.post('/start', callController.startCall);

// POST /api/v1/call/end
router.post('/end', callController.endCall);

// GET /api/v1/call/history
router.get('/history', callController.getCallHistory);

module.exports = router;
