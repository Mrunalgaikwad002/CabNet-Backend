const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// User signup
router.post('/signup/user', async (req, res) => {
  try {
    const { clerkId, email, firstName, lastName, phoneNumber } = req.body;
    console.log('Signup attempt:', { clerkId, email, firstName, lastName, phoneNumber });
    const supabase = req.app.get('supabase');
    
    // Check if user already exists
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('id')
      .or(`email.eq.${email},clerk_id.eq.${clerkId}`);
    
    if (checkError) {
      console.log('Check error:', checkError);
      return res.status(500).json({ success: false, message: checkError.message });
    }
    
    if (existingUsers && existingUsers.length > 0) {
      console.log('User already exists:', existingUsers);
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create new user
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        clerk_id: clerkId,
        email,
        first_name: firstName || '',
        last_name: lastName || '',
        phone_number: phoneNumber || ''
      })
      .select()
      .single();

    if (error) {
      console.log('User creation error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }

    console.log('User created successfully:', user);
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
    console.log('Driver signup attempt:', { clerkId, email, firstName, lastName, phoneNumber, licenseNumber, vehicleInfo });
    const supabase = req.app.get('supabase');
    
    // Check if driver already exists
    const { data: existingDrivers, error: checkError } = await supabase
      .from('drivers')
      .select('id')
      .or(`email.eq.${email},clerk_id.eq.${clerkId}`);
    
    if (checkError) {
      console.log('Driver check error:', checkError);
      return res.status(500).json({ success: false, message: checkError.message });
    }
    
    if (existingDrivers && existingDrivers.length > 0) {
      console.log('Driver already exists:', existingDrivers);
      return res.status(400).json({ success: false, message: 'Driver already exists' });
    }

    // Create new driver
    // Provide safe defaults for required NOT NULL fields when missing
    const vInfo = vehicleInfo || {};
    const driverPayload = {
      clerk_id: clerkId,
      email,
      first_name: firstName || '',
      last_name: lastName || '',
      phone_number: phoneNumber || '',
      license_number: licenseNumber || `LIC-${Date.now()}`,
      vehicle_make: vInfo.make || 'N/A',
      vehicle_model: vInfo.model || 'N/A',
      vehicle_year: vInfo.year || 2000,
      vehicle_color: vInfo.color || 'N/A',
      vehicle_plate_number: vInfo.plateNumber || `PLATE-${Math.floor(Math.random()*1e6)}`,
      vehicle_type: vInfo.vehicleType || 'economy',
      document_driver_license: vInfo.documents?.driverLicense || 'placeholder',
      document_vehicle_registration: vInfo.documents?.vehicleRegistration || 'placeholder',
      document_insurance: vInfo.documents?.insurance || 'placeholder',
      document_background_check: vInfo.documents?.backgroundCheck || 'placeholder',
    };

    const { data: driver, error } = await supabase
      .from('drivers')
      .insert(driverPayload)
      .select()
      .single();

    if (error) {
      console.log('Driver creation error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }

    console.log('Driver created successfully:', driver);
    const token = jwt.sign({ clerkId }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({ success: true, driver, token });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { clerkId, email } = req.body;
    const supabase = req.app.get('supabase');
    
    let user = null;
    let driver = null;

    // Attempt lookup by clerkId if provided
    if (clerkId) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('clerk_id', clerkId)
        .single();
      
      if (!userError && userData) {
        user = userData;
      } else {
        const { data: driverData, error: driverError } = await supabase
          .from('drivers')
          .select('*')
          .eq('clerk_id', clerkId)
          .single();
        
        if (!driverError && driverData) {
          driver = driverData;
        }
      }
    }

    // Fallback: lookup by email if provided
    if (!user && !driver && email) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (!userError && userData) {
        user = userData;
      } else {
        const { data: driverData, error: driverError } = await supabase
          .from('drivers')
          .select('*')
          .eq('email', email)
          .single();
        
        if (!driverError && driverData) {
          driver = driverData;
        }
      }
    }
    
    if (user) {
      const token = jwt.sign({ clerkId: user.clerk_id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      return res.json({ success: true, user, token });
    }
    
    if (driver) {
      const token = jwt.sign({ clerkId: driver.clerk_id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      return res.json({ success: true, user: driver, token });
    }
    
    return res.status(404).json({ success: false, message: 'User not found' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
