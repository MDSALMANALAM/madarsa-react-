// backend/controllers/auth.js
const User = require('../models/User');
const { createOTP, verifyOTP: verifyOtpHelper } = require('../utils/otpService');
const { sendOtpEmail } = require('../services/emailService');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Send OTP
exports.sendOTP = async (req, res) => {
  try {
    const { email, purpose = 'registration' } = req.body;
    const otp = await createOTP(email, purpose);
    await sendOtpEmail(email, otp, purpose);
    res.json({ success: true, message: 'OTP sent successfully' /*, devOtp: otp*/ });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to send OTP' });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp, purpose = 'registration' } = req.body;
    const result = await verifyOtpHelper(email, otp, purpose);
    res.json({ success: result.isValid, message: result.message });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'OTP verification failed' });
  }
};

// Register
exports.registerUser = async (req, res) => {
  try {
    const { name, email, mobile, password, userType } = req.body;
    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      mobile,
      password: hashed,
      userType,
      isVerified: true // set true only after OTP verify in your flow
    });

    res.json({ success: true, message: 'User registered successfully', user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.json({ success: false, message: 'User not found' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.json({ success: false, message: 'Wrong password' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ success: true, token, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
