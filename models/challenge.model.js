const mongoose = require('mongoose');
const { CHALLENGE_STATUS } = require('../constant');

const challengeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    status: { type: String, enum: Object.values(CHALLENGE_STATUS), default: CHALLENGE_STATUS.CHALLENGED },
    user1: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      contentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Content' },
    },
    user2: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      contentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Content' },
    },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Challenge', challengeSchema);
