const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
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
  licenseNumber: {
    type: String,
    required: true,
    unique: true
  },
  vehicleInfo: {
    make: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    color: { type: String, required: true },
    plateNumber: { type: String, required: true, unique: true },
    vehicleType: { 
      type: String, 
      enum: ['economy', 'comfort', 'premium', 'xl'],
      default: 'economy'
    }
  },
  documents: {
    driverLicense: { type: String, required: true },
    vehicleRegistration: { type: String, required: true },
    insurance: { type: String, required: true },
    backgroundCheck: { type: String, required: true }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    },
    address: String,
    city: String,
    state: String,
    zipCode: String
  },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  earnings: {
    total: { type: Number, default: 0 },
    thisWeek: { type: Number, default: 0 },
    thisMonth: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: ['offline', 'online', 'busy', 'suspended'],
    default: 'offline'
  },
  isVerified: {
    type: Boolean,
    default: false
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
driverSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Geospatial index for location-based queries
driverSchema.index({ location: '2dsphere' });
driverSchema.index({ email: 1, clerkId: 1 });
driverSchema.index({ status: 1, isActive: 1 });

module.exports = mongoose.model('Driver', driverSchema);
