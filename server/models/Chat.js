const mongoose = require('mongoose');

/**
 * Chat Model
 * Per 05_DATABASE_DESIGN.md section 5.
 * messageType: only 'text' in MVP.
 * Max message length: 5000 characters.
 */
const chatSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender ID is required.'],
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Receiver ID is required.'],
    },
    message: {
      type: String,
      required: [true, 'Message is required.'],
      trim: true,
      maxlength: [5000, 'Message cannot exceed 5000 characters.'],
    },
    messageType: {
      type: String,
      enum: ['text'],
      default: 'text',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes per 05_DATABASE_DESIGN.md
chatSchema.index({ senderId: 1 });
chatSchema.index({ receiverId: 1 });
chatSchema.index({ createdAt: -1 });
chatSchema.index({ senderId: 1, receiverId: 1 }); // Compound index for conversation queries

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
