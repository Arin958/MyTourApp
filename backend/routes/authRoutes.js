const express = require("express");
const router = express.Router();

const {
  register,
  login,
  checkAuth,
  forgotPassoword,
  resetPassword,
  verifyOtp,
} = require("../controllers/authController");
const { protect } = require("../middlewares/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/check-auth", protect, checkAuth);
router.post("/forgot-password", forgotPassoword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

module.exports = router;
