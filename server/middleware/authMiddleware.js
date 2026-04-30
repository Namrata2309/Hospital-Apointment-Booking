const jwt = require('jsonwebtoken');

// 1. "Protect" - Verifies if the user is logged in (has a valid token)
const protect = (req, res, next) => {
  let token;

  // Check if the authorization header exists and starts with "Bearer"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract the token from the header (Format: "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      // Verify the token using our secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach the decoded user payload (userId and role) to the request object
      // This makes req.user available to any route that uses this middleware
      req.user = decoded;

      next(); // Move on to the actual route handler
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

// 2. "Authorize" - Verifies if the logged-in user has the required role
const authorize = (...roles) => {
  return (req, res, next) => {
    // req.user.role was set by the 'protect' middleware above
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Role (${req.user.role}) is not authorized to access this resource.` 
      });
    }
    next();
  };
};

module.exports = { protect, authorize };