const mongoose = require('mongoose');

/**
 * SecretCode Model
 * Per 05_DATABASE_DESIGN.md section 4.
 * NEVER stores the plaintext Secret Code.
 * Only stores the bcrypt hash.
 * Display the plaintext ONCE at generation time, then discard.
 */
const secretCodeSchema = new mongoose.Schema(
  {
    plainCode: {
      type: String,
      default: null,
    },
    secretCodeHash: {
      type: String,
      required: [true, 'Secret code hash is required.'],
    },
    assignedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const SecretCode = mongoose.model('SecretCode', secretCodeSchema);

module.exports = SecretCode;
