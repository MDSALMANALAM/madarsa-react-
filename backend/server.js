require("dotenv").config({ path: __dirname + "/.env" });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// NATS & Notification Services
const natsService = require('./services/natsService');
const notificationConsumer = require('./services/notificationConsumer');

// Routes
const reportsRouter = require('./routes/reports');
const financeRoutes = require('./routes/finance');
const popupRoutes = require("./routes/popup");   // ✅ MySQL popup route

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Files
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'frontend'))); // Docker: /app/frontend
app.use(express.static(path.join(__dirname, '../frontend'))); // Local dev: ../frontend
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/receipts", express.static(path.join(__dirname, "receipts")));
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// Popup Upload Folder
app.use("/popup_uploads", express.static(path.join(__dirname, "public/uploads")));

// Popup API
app.use("/api/popup", popupRoutes);   // ✅ IMPORTANT

// Other APIs
app.use('/api/finance', financeRoutes);
app.use('/api/reports', reportsRouter);
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/auth')); // Same as auth - for /api/user/profile
app.use("/api/students", require("./routes/student"));
app.use('/api/course', require('./routes/course'));
app.use('/api/material', require('./routes/material'));
app.use('/api/library', require('./routes/library')); // ✅ Library route
app.use('/api/contact', require('./routes/contact')); // ✅ Contact route
app.use('/api/donation', require('./routes/donation'));
app.use('/api/admissions', require('./routes/admission'));
app.use("/api/upload", require("./routes/upload"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/teachers", require("./routes/teacher"));
app.use("/api/popup", require("./routes/popup"));
app.use("/api/users", require("./routes/userApproval")); // ✅ User approval routes
app.use("/api/whatsapp", require("./routes/whatsapp")); // ✅ WhatsApp routes

// Serve Frontend Static Files
const fs = require('fs');
const frontendPath = path.join(__dirname, 'frontend');
const altFrontendPath = path.join(__dirname, '../frontend');

if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));
} else if (fs.existsSync(altFrontendPath)) {
  app.use(express.static(altFrontendPath));
}

// Home Page - serve index.html or API info
app.get('/', (req, res) => {
  const indexPath = fs.existsSync(frontendPath)
    ? path.join(frontendPath, 'index.html')
    : path.join(altFrontendPath, 'index.html');

  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.json({
      success: true,
      message: '🕌 Madarsa Imdadul Uloom - API Server',
      version: '1.0.0',
      endpoints: {
        finance: '/api/finance',
        students: '/api/students',
        teachers: '/api/teachers',
        admissions: '/api/admissions',
        donation: '/api/donation',
        library: '/api/library',
        whatsapp: '/api/whatsapp'
      }
    });
  }
});

// MongoDB Connect
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log('❌ MongoDB error:', err));

// Start Server & Initialize Services
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 Server running on:`);
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   Network: http://YOUR_IP_ADDRESS:${PORT}`);

  // Initialize NATS Connection
  try {
    await natsService.connectNATS();
    console.log('✅ NATS service ready');

    // Start notification consumer (listens for events & sends WhatsApp)
    await notificationConsumer.startConsumer();
    console.log('✅ Notification consumer started - WhatsApp real-time active!');
  } catch (err) {
    console.warn('⚠️ NATS/Notification service unavailable:', err.message);
    console.log('   App will work, but real-time notifications disabled');
  }

  console.log(`\n📱 Phone se access karne ke liye:`);
  console.log(`   1. Same WiFi pe connect karo`);
  console.log(`   2. Browser me open karo: http://YOUR_IP_ADDRESS:${PORT}`);
});
