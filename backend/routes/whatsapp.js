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
        hasQR: !!status.qrCode || !!status.qrCodeDataUrl,
        isInitializing: status.isInitializing,
        lastError: status.lastError,
        reconnectAttempts: status.reconnectAttempts
    });
});

// ============================
// 📱 Get QR Code / Pairing Code
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

        // Return pairing code if available (preferred method)
        if (status.pairingCode) {
            return res.json({
                success: true,
                connected: false,
                pairingCode: status.pairingCode,
                message: 'Use this pairing code in WhatsApp: Settings > Linked Devices > Link with phone number'
            });
        }

        // Return pre-generated QR code data URL if available
        if (status.qrCodeDataUrl) {
            return res.json({
                success: true,
                connected: false,
                qrCode: status.qrCodeDataUrl,
                message: 'Scan this QR code with WhatsApp'
            });
        }

        // Generate QR code from raw data if available
        if (status.qrCode) {
            const qrDataUrl = await QRCode.toDataURL(status.qrCode);
            return res.json({
                success: true,
                connected: false,
                qrCode: qrDataUrl,
                message: 'Scan this QR code with WhatsApp'
            });
        }

        // No QR code available - need to initialize
        return res.json({
            success: false,
            connected: false,
            message: 'Not initialized. Send phone number to get pairing code.',
            needsInit: true
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
        const { phone } = req.body || {};

        // Reset attempts before initializing
        whatsapp.resetReconnectAttempts();
        await whatsapp.initWhatsApp(phone);

        const message = phone
            ? 'WhatsApp initialization started. Pairing code will be generated in 3 seconds. Check /qr endpoint.'
            : 'WhatsApp initialization started. Use /qr to get QR code for scanning.';

        res.json({
            success: true,
            message,
            note: phone ? 'Wait 5 seconds then check /qr for pairing code' : null
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

