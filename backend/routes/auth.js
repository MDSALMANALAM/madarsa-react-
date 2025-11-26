const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { createOTP, verifyOTP, checkOTPExists } = require('../utils/otpService');
const { sendOtpEmail } = require('../services/emailService');

const router = express.Router();

// ✅ Send OTP for Registration
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.json({ success: false, message: 'Email is required' });

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) return res.json({ success: false, message: 'Email already registered' });

    const otp = await createOTP(email, 'registration');
    await sendOtpEmail(email, otp, 'registration');

    return res.json({ success: true, message: 'OTP sent successfully' });

  } catch (error) {
    console.error('Send OTP error:', error);
    return res.json({ success: false, message: 'Server error. Please try again.' });
  }
});

// ✅ Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) return res.json({ success: false, message: 'Email and OTP are required' });

    const result = await verifyOTP(email, otp, 'registration');
    return res.json({ success: result.isValid, message: result.message });

  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.json({ success: false, message: 'OTP verification failed' });
  }
});

// ✅ Register User (after OTP verification)
router.post('/register', async (req, res) => {
  try {
    const { name, email, mobile, password, userType } = req.body;

    if (!name || !email || !mobile || !password || !userType) {
      return res.json({ success: false, message: 'All fields are required' });
    }

    // OTP must be verified already
    const isVerified = await checkOTPExists(email, 'registration');
    if (!isVerified) {
      return res.json({ success: false, message: 'Please verify OTP first' });
    }

    const exists = await User.findOne({ $or: [{ email: email.toLowerCase() }, { mobile }] });
    if (exists) {
      if (exists.email === email.toLowerCase()) return res.json({ success: false, message: 'Email already registered' });
      if (exists.mobile === mobile) return res.json({ success: false, message: 'Mobile already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      mobile: mobile.trim(),
      password: hashed,
      userType,
      isVerified: true
    });

    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email, userType: newUser.userType },
      process.env.JWT_SECRET || 'madarsa_secret_key',
      { expiresIn: '30d' }
    );

    return res.json({ success: true, message: 'Registration successful', token, user: newUser });

  } catch (error) {
    console.error('Registration error:', error);
    return res.json({ success: false, message: 'Registration failed. Please try again.' });
  }
});

// ✅ Send OTP for Login
router.post('/send-login-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.json({ success: false, message: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.json({ success: false, message: 'Email not registered' });

    const otp = await createOTP(email, 'login');
    await sendOtpEmail(email, otp, 'login');

    return res.json({ success: true, message: 'OTP sent successfully' });

  } catch (error) {
    console.error('Send login OTP error:', error);
    return res.json({ success: false, message: 'Server error. Please try again.' });
  }
});

// ✅ Verify OTP for Login
router.post('/verify-otp-login', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) return res.json({ success: false, message: 'Email and OTP are required' });

    const result = await verifyOTP(email, otp, 'login');
    if (!result.isValid) return res.json({ success: false, message: result.message });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.json({ success: false, message: 'User not found' });

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email, userType: user.userType },
      process.env.JWT_SECRET || 'madarsa_secret_key',
      { expiresIn: '30d' }
    );

    return res.json({ success: true, message: 'Login successful', token, user });

  } catch (error) {
    console.error('Login OTP verify error:', error);
    return res.json({ success: false, message: 'Login failed.' });
  }
});

// ✅ Email + Password Login
router.post('/login-email', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check input
    if (!email || !password) {
      return res.json({ success: false, message: 'Email and password are required' });
    }

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.json({ success: false, message: 'Invalid email or password' });
    }

    // Compare password with hash stored in DB
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.json({ success: false, message: 'Invalid email or password' });
    }

    // Update last login time
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email, userType: user.userType },
      process.env.JWT_SECRET || 'madarsa_secret_key',
      { expiresIn: '30d' }
    );

    // Send response
    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType
      }
    });

  } catch (error) {
    console.error('Email login error:', error);
    return res.json({ success: false, message: 'Login failed. Try again.' });
  }
});

// ✅ Mobile + Password Login
router.post('/login-mobile', async (req, res) => {
  try {
    const { mobile, password } = req.body;

    // Validate input
    if (!mobile || !password) {
      return res.json({ success: false, message: 'Mobile and password are required' });
    }

    // Check if user exists
    const user = await User.findOne({ mobile: mobile.trim() });
    if (!user) {
      return res.json({ success: false, message: 'Invalid mobile or password' });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.json({ success: false, message: 'Invalid mobile or password' });
    }

    // Update last login time
    user.lastLogin = new Date();
    await user.save();

    // Generate Token
    const token = jwt.sign(
      { userId: user._id, email: user.email, userType: user.userType },
      process.env.JWT_SECRET || 'madarsa_secret_key',
      { expiresIn: '30d' }
    );

    // Send Response
    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        userType: user.userType
      }
    });

  } catch (error) {
    console.error('Mobile login error:', error);
    return res.json({ success: false, message: 'Login failed. Please try again.' });
  }
});


module.exports = router;
