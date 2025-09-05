const express = require('express');
const router = express.Router();
const { auth, requireUser } = require('../middleware/auth');
const { validateRequest, userProfileSchema } = require('../middleware/validation');

// Get user profile
router.get('/profile', auth, requireUser, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();
    
    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update user profile
router.put('/profile', auth, requireUser, validateRequest(userProfileSchema), async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    
    // Map request body to database columns
    const updateData = {};
    if (req.body.firstName) updateData.first_name = req.body.firstName;
    if (req.body.lastName) updateData.last_name = req.body.lastName;
    if (req.body.phoneNumber) updateData.phone_number = req.body.phoneNumber;
    if (req.body.dateOfBirth) updateData.date_of_birth = req.body.dateOfBirth;
    if (req.body.emergencyContact) {
      if (req.body.emergencyContact.name) updateData.emergency_contact_name = req.body.emergencyContact.name;
      if (req.body.emergencyContact.phone) updateData.emergency_contact_phone = req.body.emergencyContact.phone;
      if (req.body.emergencyContact.relationship) updateData.emergency_contact_relationship = req.body.emergencyContact.relationship;
    }
    if (req.body.preferences) {
      if (req.body.preferences.rideType) updateData.preferences_ride_type = req.body.preferences.rideType;
      if (req.body.preferences.paymentMethod) updateData.preferences_payment_method = req.body.preferences.paymentMethod;
      if (req.body.preferences.notifications) {
        if (req.body.preferences.notifications.email !== undefined) updateData.preferences_notifications_email = req.body.preferences.notifications.email;
        if (req.body.preferences.notifications.sms !== undefined) updateData.preferences_notifications_sms = req.body.preferences.notifications.sms;
        if (req.body.preferences.notifications.push !== undefined) updateData.preferences_notifications_push = req.body.preferences.notifications.push;
      }
    }
    
    updateData.updated_at = new Date().toISOString();
    
    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', req.user.id)
      .select()
      .single();
    
    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user ride history
router.get('/rides', auth, requireUser, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { data: rides, error } = await supabase
      .from('rides')
      .select(`
        *,
        driver:drivers(first_name, last_name, profile_picture, vehicle_make, vehicle_model, vehicle_type)
      `)
      .eq('rider_id', req.user.id)
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
