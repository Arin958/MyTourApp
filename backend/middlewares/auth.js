const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const appError = require("../utils/appError");

// Middleware to protect routes
exports.protect = async (req, res, next) => {
  let token;

  // Check if token is in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) return next(appError("You are not logged in", 401));

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    // Check if user still exists
    const user = await User.findByPk(decoded.id);
    if (!user) return next(appError("User no longer exists", 401));
    // Attach user to request
    req.user = user;
    next();
  } catch (err) {
    next(appError("Invalid or expired token", 401));
  }
};

// Middleware to restrict to certain roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        appError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};