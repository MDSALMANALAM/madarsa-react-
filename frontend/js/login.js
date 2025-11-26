const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");

async function sendEmailOTP(email, otp) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });

  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP - Madarsa Imdadul Uloom",
    text: `Your OTP is: ${otp}`
  });
}

// SEND OTP
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  req.app.locals.otp = otp;
  req.app.locals.email = email;
  await sendEmailOTP(email, otp);
  res.json({ success: true });
});

// VERIFY OTP
router.post("/verify-otp", (req, res) => {
  res.json({
    success: req.body.otp === req.app.locals.otp
  });
});

// REGISTER
router.post("/register", async (req, res) => {
  const { name, email, mobile, password, userType } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({ name, email, mobile, password: hashedPassword, userType });
  res.json({ success: true });
});

// LOGIN
router.post("/login", async (req, res) => {
  const { mobile, password } = req.body;
  const user = await User.findOne({ mobile });
  if (!user) return res.json({ success: false, message: "User not found" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.json({ success: false, message: "Wrong Password" });

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
  res.json({ success: true, token, message: "Login Successful" });
});

module.exports = router;
