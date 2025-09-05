const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  profilePicture: {
    type: String,
    default: null
  },
  dateOfBirth: {
    type: Date
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  preferences: {
    rideType: {
      type: String,
      enum: ['economy', 'comfort', 'premium', 'xl'],
      default: 'economy'
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'cash', 'wallet'],
      default: 'card'
    },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    }
  },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Index for better query performance
userSchema.index({ email: 1, clerkId: 1 });
userSchema.index({ isActive: 1 });

module.exports = mongoose.model('User', userSchema);
