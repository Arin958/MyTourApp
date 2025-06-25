const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const appError = require("../utils/appError");
const { sendPasswordResetEmail } = require("../helper/email");
const crypto = require("crypto");

// Helper to sign JWT
const signToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
};

// Login a user
exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return next(appError("Invalid email or password", 401));
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return next(appError("Invalid email or password", 401));
    const token = signToken(user);

    res.status(200).json({
      status: "success",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Register a new user
exports.register = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    const existing = await User.findOne({ where: { email } });
    if (existing) return next(appError("Email already exists", 400));

    const newUser = await User.create({
      name,
      email,
      password,
    });

    res.status(201).json({
      status: "success",
      message: "User registered",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

exports.forgotPassoword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      res.status(400);
      throw new Error("User not found");
    }

    const resetToken = Math.floor(100000 + Math.random() * 900000);
    const resetOtpExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    user.resetOtp = resetToken;
    user.resetOtpExpires = resetOtpExpires;

    await user.save();

    const clientUrl = process.env.CLIENT_URL;

    if (!clientUrl) {
      res.status(400);
      throw new Error("Client URL not found");
    }

    await sendPasswordResetEmail(user.email, resetToken);

    res.status(200).json({
      success: true,
      message: "Password reset email sent successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    // Check if OTP matches
    if (user.resetOtp !== parseInt(otp)) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // Check if OTP is expired
    if (Date.now() > user.resetOtpExpires) {
      return res.status(400).json({ success: false, message: "OTP has expired" });
    }

    res.status(200).json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
}

exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  console.log(email, otp, newPassword);

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    // Check if OTP matches
    if (user.resetOtp !== parseInt(otp)) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // Check if OTP is expired
    if (Date.now() > user.resetOtpExpires) {
      return res.status(400).json({ success: false, message: "OTP has expired" });
    }

    // Hash and update the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;

    // Invalidate OTP
    user.resetOtp = null;
    user.resetOtpExpires = null;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Reset error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Try again later.",
    });
  }
};

exports.checkAuth = (req, res) => {
  res.status(200).json({
    status: "success",
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
};
