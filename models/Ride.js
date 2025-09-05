const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  rider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    default: null
  },
  pickup: {
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: [Number],
      address: String,
      city: String,
      state: String,
      zipCode: String
    },
    instructions: String,
    scheduledTime: Date
  },
  dropoff: {
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: [Number],
      address: String,
      city: String,
      state: String,
      zipCode: String
    },
    instructions: String
  },
  rideType: {
    type: String,
    enum: ['economy', 'comfort', 'premium', 'xl'],
    default: 'economy'
  },
  status: {
    type: String,
    enum: ['requested', 'accepted', 'arrived', 'started', 'completed', 'cancelled'],
    default: 'requested'
  },
  fare: {
    base: { type: Number, required: true },
    distance: { type: Number, default: 0 },
    time: { type: Number, default: 0 },
    surge: { type: Number, default: 0 },
    total: { type: Number, required: true },
    currency: { type: String, default: 'USD' }
  },
  distance: {
    value: { type: Number, default: 0 }, // in meters
    text: String // human readable
  },
  duration: {
    value: { type: Number, default: 0 }, // in seconds
    text: String // human readable
  },
  payment: {
    method: { type: String, enum: ['card', 'cash', 'wallet'], default: 'card' },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    transactionId: String,
    stripePaymentIntentId: String
  },
  rating: {
    riderRating: { type: Number, min: 1, max: 5 },
    driverRating: { type: Number, min: 1, max: 5 },
    riderReview: String,
    driverReview: String
  },
  cancellation: {
    reason: String,
    cancelledBy: { type: String, enum: ['rider', 'driver', 'system'] },
    cancelledAt: Date
  },
  notes: String,
  isScheduled: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
rideSchema.index({ rider: 1, status: 1 });
rideSchema.index({ driver: 1, status: 1 });
rideSchema.index({ status: 1, createdAt: -1 });
rideSchema.index({ 'pickup.location': '2dsphere' });
rideSchema.index({ 'dropoff.location': '2dsphere' });

// Virtual for ride duration in minutes
rideSchema.virtual('durationMinutes').get(function() {
  return Math.round(this.duration.value / 60);
});

// Virtual for distance in kilometers
rideSchema.virtual('distanceKm').get(function() {
  return (this.distance.value / 1000).toFixed(2);
});

module.exports = mongoose.model('Ride', rideSchema);
