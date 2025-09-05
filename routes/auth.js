const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// User signup
router.post('/signup/user', async (req, res) => {
  try {
    const { clerkId, email, firstName, lastName, phoneNumber } = req.body;
    const supabase = req.app.get('supabase');
    
    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .or(`email.eq.${email},clerk_id.eq.${clerkId}`)
      .single();
    
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create new user
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        clerk_id: clerkId,
        email,
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    const token = jwt.sign({ clerkId }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({ success: true, user, token });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Driver signup
router.post('/signup/driver', async (req, res) => {
  try {
    const { clerkId, email, firstName, lastName, phoneNumber, licenseNumber, vehicleInfo } = req.body;
    const supabase = req.app.get('supabase');
    
    // Check if driver already exists
    const { data: existingDriver, error: checkError } = await supabase
      .from('drivers')
      .select('id')
      .or(`email.eq.${email},clerk_id.eq.${clerkId}`)
      .single();
    
    if (existingDriver) {
      return res.status(400).json({ success: false, message: 'Driver already exists' });
    }

    // Create new driver
    const { data: driver, error } = await supabase
      .from('drivers')
      .insert({
        clerk_id: clerkId,
        email,
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        license_number: licenseNumber,
        vehicle_make: vehicleInfo.make,
        vehicle_model: vehicleInfo.model,
        vehicle_year: vehicleInfo.year,
        vehicle_color: vehicleInfo.color,
        vehicle_plate_number: vehicleInfo.plateNumber,
        vehicle_type: vehicleInfo.vehicleType || 'economy',
        document_driver_license: vehicleInfo.documents?.driverLicense || '',
        document_vehicle_registration: vehicleInfo.documents?.vehicleRegistration || '',
        document_insurance: vehicleInfo.documents?.insurance || '',
        document_background_check: vehicleInfo.documents?.backgroundCheck || ''
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    const token = jwt.sign({ clerkId }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({ success: true, driver, token });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { clerkId } = req.body;
    const supabase = req.app.get('supabase');
    
    // Check users table first
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', clerkId)
      .single();
    
    if (user) {
      const token = jwt.sign({ clerkId }, process.env.JWT_SECRET, { expiresIn: '7d' });
      return res.json({ success: true, user, token });
    }
    
    // Check drivers table
    const { data: driver, error: driverError } = await supabase
      .from('drivers')
      .select('*')
      .eq('clerk_id', clerkId)
      .single();
    
    if (driver) {
      const token = jwt.sign({ clerkId }, process.env.JWT_SECRET, { expiresIn: '7d' });
      return res.json({ success: true, user: driver, token });
    }
    
    return res.status(404).json({ success: false, message: 'User not found' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
