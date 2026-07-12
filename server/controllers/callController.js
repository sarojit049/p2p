const { validationResult } = require('express-validator');
const callService = require('../services/callService');
const { sendSuccess, sendError } = require('../utils/responseHelper');

/**
 * Call Controller
 * POST /api/v1/call/start
 * POST /api/v1/call/end
 * GET  /api/v1/call/history
 */

const startCall = async (req, res, next) => {
  try {
    const { receiverId, callType } = req.body;

    if (!receiverId || !callType) {
      return sendError(res, 422, 'receiverId and callType are required.', { code: 'CALL_001' });
    }

    const call = await callService.startCall(req.user._id, receiverId, callType);
    return sendSuccess(res, 201, 'Call initiated.', { call });
  } catch (error) {
    next(error);
  }
};

const endCall = async (req, res, next) => {
  try {
    const { callId, status } = req.body;

    if (!callId || !status) {
      return sendError(res, 422, 'callId and status are required.', { code: 'CALL_001' });
    }

    const call = await callService.endCall(callId, status, req.user._id);
    return sendSuccess(res, 200, 'Call ended.', { call });
  } catch (error) {
    next(error);
  }
};

const getCallHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const result = await callService.getCallHistory(req.user._id, page, limit);
    return sendSuccess(res, 200, 'Call history retrieved.', result);
  } catch (error) {
    next(error);
  }
};

module.exports = { startCall, endCall, getCallHistory };
