// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    userType: {
      type: String,
      enum: ['student', 'teacher', 'parent', 'admin', 'general'],
      required: true
    },
    isVerified: { type: Boolean, default: false },

    // Approval System
    isApproved: { type: Boolean, default: false },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    rejectionReason: { type: String },

    lastLogin: { type: Date }
  },
  { timestamps: true }
);

// Pre-save hook: General users auto-approved, Admin is pre-created by system
userSchema.pre('save', function(next) {
  if (this.isNew) {
    // General public users get instant access
    if (this.userType === 'general') {
      this.isApproved = true;
      this.approvalStatus = 'approved';
    }
    // Admin accounts are created by system/seeder - they are pre-approved
    if (this.userType === 'admin') {
      this.isApproved = true;
      this.approvalStatus = 'approved';
    }
  }
  next();
});

// Avoid OverwriteModelError when hot-reloading
module.exports = mongoose.models.User || mongoose.model('User', userSchema);
