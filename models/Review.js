const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  ride: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride',
    required: true
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'reviewerModel',
    required: true
  },
  reviewerModel: {
    type: String,
    required: true,
    enum: ['User', 'Driver']
  },
  reviewee: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'revieweeModel',
    required: true
  },
  revieweeModel: {
    type: String,
    required: true,
    enum: ['User', 'Driver']
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: 500
  },
  tags: [{
    type: String,
    enum: ['punctual', 'clean', 'friendly', 'safe', 'professional', 'rude', 'dirty', 'unsafe']
  }],
  isAnonymous: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  helpful: {
    count: { type: Number, default: 0 },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  }
}, {
  timestamps: true
});

// Ensure one review per ride per reviewer
reviewSchema.index({ ride: 1, reviewer: 1 }, { unique: true });

// Indexes for better query performance
reviewSchema.index({ reviewee: 1, createdAt: -1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ isPublic: 1 });

module.exports = mongoose.model('Review', reviewSchema);
