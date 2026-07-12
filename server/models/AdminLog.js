const mongoose = require('mongoose');

/**
 * AdminLog Model
 * Stores critical actions performed by admins for audit purposes.
 */
const adminLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: ['GENERATE_SECRET_CODE', 'REVOKE_SECRET_CODE', 'BLOCK_USER', 'UNBLOCK_USER', 'DELETE_USER', 'SYSTEM'],
    },
    description: {
      type: String,
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null, // ID of the user or code affected
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast retrieval
adminLogSchema.index({ adminId: 1 });
adminLogSchema.index({ createdAt: -1 });
adminLogSchema.index({ action: 1 });

const AdminLog = mongoose.model('AdminLog', adminLogSchema);

module.exports = AdminLog;
