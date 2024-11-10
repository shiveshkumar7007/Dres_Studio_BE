const mongoose = require('mongoose');
const { CONTENT_TYPES } = require('../constant');

const contentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: Object.values(CONTENT_TYPES), required: true },
    text: { type: String },
    fileUrl: { type: String },
    thumbnailUrl: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Content', contentSchema);
