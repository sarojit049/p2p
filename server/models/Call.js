const mongoose = require('mongoose');

/**
 * Call Model
 * Per 05_DATABASE_DESIGN.md section 6.
 * callType: voice | video
 * status: missed | accepted | rejected | ended
 */
const callSchema = new mongoose.Schema(
  {
    callerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Caller ID is required.'],
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Receiver ID is required.'],
    },
    callType: {
      type: String,
      enum: ['voice', 'video'],
      required: [true, 'Call type is required.'],
    },
    status: {
      type: String,
      enum: ['missed', 'accepted', 'rejected', 'ended'],
      default: 'missed',
    },
    startTime: {
      type: Date,
      default: null,
    },
    endTime: {
      type: Date,
      default: null,
    },
    duration: {
      type: Number, // Duration in seconds
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Call = mongoose.model('Call', callSchema);

module.exports = Call;
