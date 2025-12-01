/**
 * Admin User Creation Script
 * 
 * Usage: node scripts/createAdmin.js
 * 
 * This script creates the first admin user.
 * Run this once after initial setup.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Admin credentials - CHANGE THESE!
const ADMIN_CONFIG = {
  name: 'Admin',
  email: 'admin@madarsa.com',
  mobile: '9999999999',
  password: 'Admin@123',  // Change this!
  userType: 'admin'
};

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/madarsa');
    console.log('✅ MongoDB connected');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      $or: [
        { email: ADMIN_CONFIG.email },
        { userType: 'admin' }
      ]
    });

    if (existingAdmin) {
      console.log('⚠️  Admin already exists:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Name: ${existingAdmin.name}`);
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(ADMIN_CONFIG.password, 10);

    // Create admin user
    const admin = await User.create({
      name: ADMIN_CONFIG.name,
      email: ADMIN_CONFIG.email.toLowerCase(),
      mobile: ADMIN_CONFIG.mobile,
      password: hashedPassword,
      userType: 'admin',
      isVerified: true,
      isApproved: true,
      approvalStatus: 'approved'
    });

    console.log('\n🎉 Admin created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Name:     ${admin.name}`);
    console.log(`   Email:    ${admin.email}`);
    console.log(`   Mobile:   ${admin.mobile}`);
    console.log(`   Password: ${ADMIN_CONFIG.password}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');

  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createAdmin();

