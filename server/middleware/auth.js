/**
 * Authentication Middleware
 * ------------------------
 * Verifies JWT tokens from the Authorization header.
 * Provides two middleware functions:
 *   - protect: Ensures user is authenticated
 *   - authorize: Restricts access based on user roles
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * protect - Verifies the JWT token and attaches the user to req.user.
 * Expects header: Authorization: Bearer <token>
 */
const protect = async (req, res, next) => {
  let token;

  // Check for Bearer token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized - No token provided'
    });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request (exclude password)
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized - User not found'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized - Invalid token'
    });
  }
};

/**
 * authorize - Restricts route access to specific roles.
 * Usage: authorize('vendor') or authorize('vendor', 'admin')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this resource`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
