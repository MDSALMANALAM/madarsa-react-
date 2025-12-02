const express = require('express');
const router = express.Router();
const User = require('../models/User');
const adminAuth = require('../middleware/adminAuth');
const { sendOtpEmail } = require('../services/emailService');

// ✅ Get all pending approval users
router.get('/pending', adminAuth, async (req, res) => {
  try {
    const users = await User.find({ 
      approvalStatus: 'pending',
      userType: { $in: ['student', 'teacher', 'parent'] }
    }).select('-password').sort({ createdAt: -1 });
    
    res.json({ success: true, users });
  } catch (error) {
    console.error('Get pending users error:', error);
    res.json({ success: false, message: 'Failed to fetch pending users' });
  }
});

// ✅ Get all users (with filters)
router.get('/all', adminAuth, async (req, res) => {
  try {
    const { userType, approvalStatus } = req.query;
    const filter = {};
    
    if (userType) filter.userType = userType;
    if (approvalStatus) filter.approvalStatus = approvalStatus;
    
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, users });
  } catch (error) {
    console.error('Get all users error:', error);
    res.json({ success: false, message: 'Failed to fetch users' });
  }
});

// ✅ Approve user
router.post('/approve/:userId', adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }
    
    if (user.isApproved) {
      return res.json({ success: false, message: 'User already approved' });
    }
    
    user.isApproved = true;
    user.approvalStatus = 'approved';
    user.approvedBy = req.userId;
    user.approvedAt = new Date();
    await user.save();
    
    // Send approval email
    try {
      const emailHtml = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#2c5aa0;color:#fff;padding:16px;text-align:center">
            <h2 style="margin:0">Madarsa Imdadul Uloom</h2>
          </div>
          <div style="padding:20px">
            <h3>🎉 Congratulations ${user.name}!</h3>
            <p>Your account has been <strong style="color:green">APPROVED</strong> by the admin.</p>
            <p>You can now login to your account using your email/mobile and password.</p>
            <p><strong>Account Type:</strong> ${user.userType}</p>
            <br>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/login.html" 
               style="background:#2c5aa0;color:#fff;padding:10px 20px;text-decoration:none;border-radius:5px">
              Login Now
            </a>
          </div>
        </div>
      `;
      await require('../services/emailService').sendOtpEmail(user.email, '', 'approval');
    } catch (emailErr) {
      console.log('Approval email failed:', emailErr.message);
    }
    
    res.json({ success: true, message: 'User approved successfully', user });
  } catch (error) {
    console.error('Approve user error:', error);
    res.json({ success: false, message: 'Failed to approve user' });
  }
});

// ✅ Reject user
router.post('/reject/:userId', adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }
    
    user.isApproved = false;
    user.approvalStatus = 'rejected';
    user.rejectionReason = reason || 'No reason provided';
    await user.save();
    
    res.json({ success: true, message: 'User rejected', user });
  } catch (error) {
    console.error('Reject user error:', error);
    res.json({ success: false, message: 'Failed to reject user' });
  }
});

// ✅ Delete user
router.delete('/:userId', adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    await User.findByIdAndDelete(userId);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.json({ success: false, message: 'Failed to delete user' });
  }
});

// ✅ Get approval stats
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const pending = await User.countDocuments({ approvalStatus: 'pending' });
    const approved = await User.countDocuments({ approvalStatus: 'approved' });
    const rejected = await User.countDocuments({ approvalStatus: 'rejected' });
    const total = await User.countDocuments({});

    res.json({
      success: true,
      stats: {
        pending,
        approved,
        rejected,
        total
      }
    });
  } catch (error) {
    res.json({ success: false, message: 'Failed to get stats' });
  }
});

module.exports = router;

