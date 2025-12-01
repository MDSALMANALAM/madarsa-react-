// =============================================
// WhatsApp API Routes
// For QR Code, Status, and Manual Messaging
// Madarsa Imdadul Uloom
// =============================================

const express = require('express');
const router = express.Router();
const whatsapp = require('../services/whatsappService');
const QRCode = require('qrcode');

// ============================
// 📊 Get WhatsApp Status
// ============================
router.get('/status', (req, res) => {
    const status = whatsapp.getStatus();
    res.json({
        success: true,
        connected: status.connected,
        hasQR: !!status.qrCode
    });
});

// ============================
// 📱 Get QR Code for Scanning
// ============================
router.get('/qr', async (req, res) => {
    try {
        const status = whatsapp.getStatus();
        
        if (status.connected) {
            return res.json({
                success: true,
                connected: true,
                message: 'WhatsApp already connected!'
            });
        }
        
        if (!status.qrCode) {
            return res.json({
                success: false,
                message: 'QR code not available yet. Please wait...'
            });
        }
        
        // Generate QR code as data URL
        const qrDataUrl = await QRCode.toDataURL(status.qrCode);
        
        res.json({
            success: true,
            connected: false,
            qrCode: qrDataUrl,
            message: 'Scan this QR code with WhatsApp'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ============================
// 📤 Send Test Message
// ============================
router.post('/send', async (req, res) => {
    try {
        const { phone, message } = req.body;
        
        if (!phone || !message) {
            return res.status(400).json({
                success: false,
                message: 'Phone and message are required'
            });
        }
        
        const result = await whatsapp.sendMessage(phone, message);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ============================
// 📤 Send Message to Multiple Recipients
// ============================
router.post('/broadcast', async (req, res) => {
    try {
        const { phones, message } = req.body;
        
        if (!phones || !Array.isArray(phones) || !message) {
            return res.status(400).json({
                success: false,
                message: 'Phones array and message are required'
            });
        }
        
        const results = [];
        for (const phone of phones) {
            const result = await whatsapp.sendMessage(phone, message);
            results.push({ phone, ...result });
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        res.json({
            success: true,
            results
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ============================
// 🔌 Initialize/Reconnect WhatsApp
// ============================
router.post('/init', async (req, res) => {
    try {
        await whatsapp.initWhatsApp();
        res.json({
            success: true,
            message: 'WhatsApp initialization started. Check /qr for QR code.'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ============================
// 🚪 Logout WhatsApp
// ============================
router.post('/logout', async (req, res) => {
    try {
        await whatsapp.logout();
        res.json({
            success: true,
            message: 'WhatsApp logged out successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;

