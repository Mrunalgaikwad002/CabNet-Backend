const express = require('express');
const router = express.Router();
const stripe = require('../config/stripe');
const { auth, requireUser } = require('../middleware/auth');

// Create payment intent
router.post('/create-intent', auth, requireUser, async (req, res) => {
  try {
    const { rideId } = req.body;
    const ride = await Ride.findById(rideId);
    
    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(ride.fare.total * 100), // Convert to cents
      currency: ride.fare.currency,
      metadata: { rideId }
    });

    res.json({ 
      success: true, 
      clientSecret: paymentIntent.client_secret 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Confirm payment
router.post('/confirm', auth, requireUser, async (req, res) => {
  try {
    const { rideId, paymentIntentId } = req.body;
    
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found' });
    }

    // Create payment record
    const payment = new Payment({
      ride: rideId,
      rider: req.user._id,
      driver: ride.driver,
      amount: ride.fare.total,
      currency: ride.fare.currency,
      status: 'completed',
      method: 'card',
      stripePaymentIntentId: paymentIntentId,
      breakdown: ride.fare
    });

    await payment.save();

    // Update ride payment status
    ride.payment.status = 'completed';
    ride.payment.stripePaymentIntentId = paymentIntentId;
    await ride.save();

    res.json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get payment history
router.get('/history', auth, requireUser, async (req, res) => {
  try {
    const payments = await Payment.find({ rider: req.user._id })
      .populate('ride', 'pickup dropoff fare')
      .populate('driver', 'firstName lastName')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
