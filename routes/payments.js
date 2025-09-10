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

// Simple Stripe Checkout session for frontend redirect
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { amount, currency, description, customer, billingAddressCollection, shippingAddressCollection } = req.body;
    if (!amount) return res.status(400).json({ error: 'amount (in paise) is required' });

    let customerId;
    if (customer && (customer.name || customer.email)) {
      // Ensure we have a Customer with address (India export requirement)
      const created = await stripe.customers.create({
        name: customer.name,
        email: customer.email,
        address: customer.address,
      });
      customerId = created.id;
    }

    const frontendBase = process.env.STRIPE_RETURN_BASE_URL || process.env.FRONTEND_URL || 'http://localhost:3000';
    
    // Ensure the URL has the correct port
    const baseUrl = frontendBase.includes(':3000') ? frontendBase : 'http://localhost:3000';

    const sessionPayload = {
      mode: 'payment',
      payment_method_types: ['card'],
      customer: customerId,
      // Ensure email is collected upfront; when no existing customer, this forces email capture first
      customer_creation: customerId ? undefined : 'always',
      // Require billing address per Indian export rules
      billing_address_collection: billingAddressCollection || 'required',
      line_items: [
        {
          price_data: {
            currency: currency || 'inr',
            product_data: { name: description || 'CabNet Ride Fare' },
            unit_amount: Number(amount),
          },
          quantity: 1,
        },
      ],
      success_url: (req.body.successUrl) || `${baseUrl}/user/dashboard?payment=success`,
      cancel_url: (req.body.cancelUrl) || `${baseUrl}/user/dashboard?payment=cancel`,
    };

    // Only include shipping address collection if explicitly requested
    if (shippingAddressCollection && shippingAddressCollection !== 'none') {
      sessionPayload.shipping_address_collection = { allowed_countries: Array.isArray(shippingAddressCollection) ? shippingAddressCollection : ['IN'] };
    }

    const session = await stripe.checkout.sessions.create(sessionPayload);
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
