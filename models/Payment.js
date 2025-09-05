const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  ride: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride',
    required: true
  },
  rider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  method: {
    type: String,
    enum: ['card', 'cash', 'wallet'],
    required: true
  },
  stripePaymentIntentId: String,
  stripeChargeId: String,
  stripeRefundId: String,
  fee: {
    platform: { type: Number, default: 0 },
    stripe: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  breakdown: {
    baseFare: { type: Number, required: true },
    distanceFare: { type: Number, default: 0 },
    timeFare: { type: Number, default: 0 },
    surgeFare: { type: Number, default: 0 },
    taxes: { type: Number, default: 0 },
    total: { type: Number, required: true }
  },
  refund: {
    amount: Number,
    reason: String,
    processedAt: Date
  },
  metadata: {
    rideId: String,
    pickupAddress: String,
    dropoffAddress: String,
    distance: String,
    duration: String
  }
}, {
  timestamps: true
});

paymentSchema.index({ ride: 1 });
paymentSchema.index({ rider: 1, createdAt: -1 });
paymentSchema.index({ driver: 1, createdAt: -1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ stripePaymentIntentId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
