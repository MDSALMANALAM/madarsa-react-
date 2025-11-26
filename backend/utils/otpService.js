// backend/utils/otpService.js
const OTP = require('../models/otp.model');

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Create & Save OTP
const createOTP = async (email, purpose = 'registration') => {
  // Remove all unused previous OTPs for same purpose
  await OTP.deleteMany({ email, purpose, isUsed: false });

  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP valid 10 minutes

  await OTP.create({
    email,
    otp,
    purpose,
    expiresAt,
    isUsed: false
  });

  return otp;
};

// Verify OTP
const verifyOTP = async (email, otp, purpose = 'registration') => {
  const record = await OTP.findOne({
    email,
    purpose,
    isUsed: false,
    expiresAt: { $gt: new Date() }
  }).sort({ createdAt: -1 });

  if (!record || record.otp !== otp) {
    await OTP.updateOne({ email, purpose }, { $inc: { attempts: 1 } }).catch(() => {});
    return { isValid: false, message: 'Invalid or expired OTP' };
  }

  record.isUsed = true;
  await record.save();
  return { isValid: true, message: 'OTP verified successfully' };
};

// ✅ Check if OTP was successfully verified (used=true)
const checkOTPExists = async (email, purpose = 'registration') => {
  const otpRecord = await OTP.findOne({
    email,
    purpose,
    isUsed: true,            // OTP must be marked used, meaning verified
    expiresAt: { $gt: new Date() }
  });

  return !!otpRecord;
};

module.exports = {
  generateOTP,
  createOTP,
  verifyOTP,
  checkOTPExists
};
