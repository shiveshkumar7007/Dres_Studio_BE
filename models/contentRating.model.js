const mongoose = require('mongoose');

const contentRatingSchema = new mongoose.Schema(
  {
    contentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Content', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true },
    review: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ContentRating', contentRatingSchema);
