const express = require('express');
const router = express.Router();
const { auth, requireUser, requireDriver } = require('../middleware/auth');
const { validateRequest, rideRequestSchema } = require('../middleware/validation');

// Request a ride
router.post('/request', auth, requireUser, validateRequest(rideRequestSchema), async (req, res) => {
  try {
    const { pickup, dropoff, rideType, notes } = req.body;
    const supabase = req.app.get('supabase');
    
    // Calculate fare (simplified)
    const fare = {
      base: 5.00,
      distance: 2.50,
      time: 1.00,
      surge: 0.00,
      total: 8.50,
      currency: 'USD'
    };

    const { data: ride, error } = await supabase
      .from('rides')
      .insert({
        rider_id: req.user.id,
        pickup_coordinates: `(${pickup.location.coordinates[0]},${pickup.location.coordinates[1]})`,
        pickup_address: pickup.location.address,
        pickup_city: pickup.location.city,
        pickup_state: pickup.location.state,
        pickup_zip_code: pickup.location.zipCode,
        pickup_instructions: pickup.instructions,
        dropoff_coordinates: `(${dropoff.location.coordinates[0]},${dropoff.location.coordinates[1]})`,
        dropoff_address: dropoff.location.address,
        dropoff_city: dropoff.location.city,
        dropoff_state: dropoff.location.state,
        dropoff_zip_code: dropoff.location.zipCode,
        dropoff_instructions: dropoff.instructions,
        ride_type: rideType,
        notes,
        fare_base: fare.base,
        fare_distance: fare.distance,
        fare_time: fare.time,
        fare_surge: fare.surge,
        fare_total: fare.total,
        fare_currency: fare.currency
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('ride-requested', { ride });

    res.status(201).json({ success: true, ride });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get nearby drivers
router.get('/drivers/nearby', auth, requireUser, async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 5000 } = req.query;
    const supabase = req.app.get('supabase');
    
    const { data: drivers, error } = await supabase
      .from('drivers')
      .select('*')
      .eq('status', 'online')
      .eq('is_active', true)
      .limit(10);

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    res.json({ success: true, drivers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Accept ride (driver)
router.put('/:rideId/accept', auth, requireDriver, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    
    const { data: ride, error } = await supabase
      .from('rides')
      .update({
        driver_id: req.user.id,
        status: 'accepted'
      })
      .eq('id', req.params.rideId)
      .select()
      .single();

    if (error || !ride) {
      return res.status(404).json({ success: false, message: 'Ride not found' });
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`ride-${ride.id}`).emit('ride-accepted', { ride });

    res.json({ success: true, ride });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update ride status
router.put('/:rideId/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const supabase = req.app.get('supabase');
    
    const { data: ride, error } = await supabase
      .from('rides')
      .update({ status })
      .eq('id', req.params.rideId)
      .select()
      .single();

    if (error || !ride) {
      return res.status(404).json({ success: false, message: 'Ride not found' });
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`ride-${ride.id}`).emit('ride-status-updated', { ride });

    res.json({ success: true, ride });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get ride details
router.get('/:rideId', auth, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    
    const { data: ride, error } = await supabase
      .from('rides')
      .select(`
        *,
        rider:users(first_name, last_name, phone_number),
        driver:drivers(first_name, last_name, phone_number, vehicle_make, vehicle_model, vehicle_type)
      `)
      .eq('id', req.params.rideId)
      .single();

    if (error || !ride) {
      return res.status(404).json({ success: false, message: 'Ride not found' });
    }

    res.json({ success: true, ride });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
