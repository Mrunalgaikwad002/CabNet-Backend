const express = require('express');
const router = express.Router();
const { auth, requireDriver } = require('../middleware/auth');
const { validateRequest, driverProfileSchema } = require('../middleware/validation');

// Get driver profile
router.get('/profile', auth, requireDriver, async (req, res) => {
  try {
    const driver = await Driver.findById(req.user._id);
    res.json({ success: true, driver });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update driver profile
router.put('/profile', auth, requireDriver, validateRequest(driverProfileSchema), async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(
      req.user._id,
      req.body,
      { new: true, runValidators: true }
    );
    res.json({ success: true, driver });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update driver status
router.put('/status', auth, requireDriver, async (req, res) => {
  try {
    const { status } = req.body;
    const driver = await Driver.findByIdAndUpdate(
      req.user._id,
      { status, lastActive: new Date() },
      { new: true }
    );
    res.json({ success: true, driver });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update driver location
router.put('/location', auth, requireDriver, async (req, res) => {
  try {
    const { coordinates, address, city, state, zipCode } = req.body;
    const driver = await Driver.findByIdAndUpdate(
      req.user._id,
      { 
        location: { coordinates, address, city, state, zipCode },
        lastActive: new Date()
      },
      { new: true }
    );
    res.json({ success: true, driver });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get available rides
router.get('/rides/available', auth, requireDriver, async (req, res) => {
  try {
    const rides = await Ride.find({ 
      status: 'requested',
      rideType: req.user.vehicleInfo.vehicleType
    }).populate('rider', 'firstName lastName');
    
    res.json({ success: true, rides });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get driver ride history
router.get('/rides/history', auth, requireDriver, async (req, res) => {
  try {
    const rides = await Ride.find({ driver: req.user._id })
      .populate('rider', 'firstName lastName')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, rides });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
