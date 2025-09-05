const Joi = require('joi');

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errorMessage
      });
    }
    
    next();
  };
};

// Validation schemas
const userProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  phoneNumber: Joi.string().pattern(/^\+?[\d\s-()]+$/).optional(),
  dateOfBirth: Joi.date().max('now').optional(),
  emergencyContact: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    phone: Joi.string().pattern(/^\+?[\d\s-()]+$/).optional(),
    relationship: Joi.string().max(50).optional()
  }).optional(),
  preferences: Joi.object({
    rideType: Joi.string().valid('economy', 'comfort', 'premium', 'xl').optional(),
    paymentMethod: Joi.string().valid('card', 'cash', 'wallet').optional(),
    notifications: Joi.object({
      email: Joi.boolean().optional(),
      sms: Joi.boolean().optional(),
      push: Joi.boolean().optional()
    }).optional()
  }).optional()
});

const rideRequestSchema = Joi.object({
  pickup: Joi.object({
    location: Joi.object({
      coordinates: Joi.array().items(Joi.number()).length(2).required(),
      address: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      zipCode: Joi.string().required()
    }).required(),
    instructions: Joi.string().max(200).optional(),
    scheduledTime: Joi.date().min('now').optional()
  }).required(),
  dropoff: Joi.object({
    location: Joi.object({
      coordinates: Joi.array().items(Joi.number()).length(2).required(),
      address: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      zipCode: Joi.string().required()
    }).required(),
    instructions: Joi.string().max(200).optional()
  }).required(),
  rideType: Joi.string().valid('economy', 'comfort', 'premium', 'xl').default('economy'),
  notes: Joi.string().max(500).optional()
});

const driverProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  phoneNumber: Joi.string().pattern(/^\+?[\d\s-()]+$/).optional(),
  licenseNumber: Joi.string().min(5).max(20).optional(),
  vehicleInfo: Joi.object({
    make: Joi.string().min(2).max(50).optional(),
    model: Joi.string().min(2).max(50).optional(),
    year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1).optional(),
    color: Joi.string().min(2).max(30).optional(),
    plateNumber: Joi.string().min(2).max(20).optional(),
    vehicleType: Joi.string().valid('economy', 'comfort', 'premium', 'xl').optional()
  }).optional(),
  location: Joi.object({
    coordinates: Joi.array().items(Joi.number()).length(2).optional(),
    address: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    zipCode: Joi.string().optional()
  }).optional()
});

const reviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().max(500).optional(),
  tags: Joi.array().items(Joi.string().valid('punctual', 'clean', 'friendly', 'safe', 'professional', 'rude', 'dirty', 'unsafe')).optional(),
  isAnonymous: Joi.boolean().optional()
});

module.exports = {
  validateRequest,
  userProfileSchema,
  rideRequestSchema,
  driverProfileSchema,
  reviewSchema
};
