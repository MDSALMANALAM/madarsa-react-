// backend/models/otp.model.js
const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, index: true },
    otp: { type: String, required: true },              // keep as string everywhere
    purpose: { type: String, default: 'registration' },
    isUsed: { type: Boolean, default: false },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true, index: true }
  },
  { timestamps: true }
);

// TTL index (auto-delete after expiry)
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.models.OTP || mongoose.model('OTP', otpSchema);
