const mongoose = require('mongoose');

/**
 * User Model
 * Per 05_DATABASE_DESIGN.md section 3.
 * username: unique, 3-30 chars, letters/numbers/underscore
 * role: admin | user
 * status: active | blocked | inactive
 */
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      sparse: true,
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters.'],
      maxlength: [30, 'Username cannot exceed 30 characters.'],
      match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores.'],
    },
    secretCodeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SecretCode',
      default: null,
    },
    displayName: {
      type: String,
      trim: true,
      default: null,
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
    status: {
      type: String,
      enum: ['active', 'blocked', 'inactive'],
      default: 'active',
    },
    profileImage: {
      type: String,
      default: null,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes per 05_DATABASE_DESIGN.md
userSchema.index({ username: 1 }, { unique: true, sparse: true });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;
