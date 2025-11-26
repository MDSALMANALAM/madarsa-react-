// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    userType: { type: String, enum: ['student', 'teacher', 'parent', 'admin'], required: true },
    isVerified: { type: Boolean, default: false },
    lastLogin: { type: Date }
  },
  { timestamps: true }
);

// Avoid OverwriteModelError when hot-reloading
module.exports = mongoose.models.User || mongoose.model('User', userSchema);
