const express = require('express');
const router = express.Router();
const { auth, requireDriver } = require('../middleware/auth');
const { validateRequest, driverProfileSchema } = require('../middleware/validation');

// Get driver profile
router.get('/profile', auth, requireDriver, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { data: driver, error } = await supabase
      .from('drivers')
      .select('*')
      .eq('clerk_id', req.user.clerk_id)
      .single();
    
    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
    
    res.json({ success: true, driver });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update driver profile
router.put('/profile', auth, requireDriver, validateRequest(driverProfileSchema), async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { data: driver, error } = await supabase
      .from('drivers')
      .update(req.body)
      .eq('clerk_id', req.user.clerk_id)
      .select()
      .single();
    
    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
    
    res.json({ success: true, driver });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update driver status
router.put('/status', auth, requireDriver, async (req, res) => {
  try {
    const { status } = req.body;
    const supabase = req.app.get('supabase');
    const { data: driver, error } = await supabase
      .from('drivers')
      .update({ status, last_active: new Date().toISOString() })
      .eq('clerk_id', req.user.clerk_id)
      .select()
      .single();
    
    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
    
    res.json({ success: true, driver });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update driver location
router.put('/location', auth, requireDriver, async (req, res) => {
  try {
    const { coordinates, address, city, state, zipCode } = req.body;
    const supabase = req.app.get('supabase');
    const { data: driver, error } = await supabase
      .from('drivers')
      .update({ 
        location_coordinates: `(${coordinates[0]},${coordinates[1]})`,
        location_address: address,
        location_city: city,
        location_state: state,
        location_zip_code: zipCode,
        last_active: new Date().toISOString()
      })
      .eq('clerk_id', req.user.clerk_id)
      .select()
      .single();
    
    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
    
    res.json({ success: true, driver });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get available rides
router.get('/rides/available', auth, requireDriver, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { data: rides, error } = await supabase
      .from('rides')
      .select(`
        *,
        rider:users(first_name, last_name, phone_number)
      `)
      .eq('status', 'requested')
      .eq('ride_type', req.user.vehicle_type || 'economy');
    
    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
    
    res.json({ success: true, rides });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get driver ride history
router.get('/rides/history', auth, requireDriver, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { data: rides, error } = await supabase
      .from('rides')
      .select(`
        *,
        rider:users(first_name, last_name, phone_number)
      `)
      .eq('driver_id', req.user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
    
    res.json({ success: true, rides });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
