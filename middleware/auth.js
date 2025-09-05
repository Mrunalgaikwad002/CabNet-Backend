const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const supabase = req.app.get('supabase');
    
    // Check if user exists in users table
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', decoded.clerkId)
      .single();
    
    if (user) {
      req.user = user;
      req.userType = 'user';
      return next();
    }
    
    // Check if driver exists in drivers table
    const { data: driver, error: driverError } = await supabase
      .from('drivers')
      .select('*')
      .eq('clerk_id', decoded.clerkId)
      .single();
    
    if (driver) {
      req.user = driver;
      req.userType = 'driver';
      return next();
    }
    
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid token.' 
    });
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token.' 
    });
  }
};

const requireUser = async (req, res, next) => {
  if (req.userType !== 'user') {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. User account required.' 
    });
  }
  next();
};

const requireDriver = async (req, res, next) => {
  if (req.userType !== 'driver') {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Driver account required.' 
    });
  }
  next();
};

module.exports = { auth, requireUser, requireDriver };
