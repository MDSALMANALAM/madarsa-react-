// =============================================
// WhatsApp Service using Baileys
// Madarsa Imdadul Uloom
// Works in LOCAL and PRODUCTION (Docker)
// =============================================

const path = require('path');
const fs = require('fs');

// Safely load Baileys module
let makeWASocket, DisconnectReason, useMultiFileAuthState;
let isBaileysAvailable = false;

try {
    const baileys = require('@whiskeysockets/baileys');
    makeWASocket = baileys.default;
    DisconnectReason = baileys.DisconnectReason;
    useMultiFileAuthState = baileys.useMultiFileAuthState;
    isBaileysAvailable = true;
} catch (e) {
    console.warn('⚠️ Baileys package not installed - WhatsApp disabled');
    console.warn('   Run: npm install @whiskeysockets/baileys');
}

let sock = null;
let isConnected = false;
let qrCode = null;

const AUTH_DIR = path.join(__dirname, '..', 'whatsapp_auth');

// Ensure auth directory exists
try {
    if (!fs.existsSync(AUTH_DIR)) {
        fs.mkdirSync(AUTH_DIR, { recursive: true });
    }
} catch (e) {
    console.warn('⚠️ Could not create WhatsApp auth directory');
}

// Initialize WhatsApp connection
async function initWhatsApp() {
    // Skip if WhatsApp disabled via env
    if (process.env.WHATSAPP_ENABLED === 'false') {
        console.log('ℹ️ WhatsApp disabled via WHATSAPP_ENABLED=false');
        return null;
    }

    // Skip if Baileys not available
    if (!isBaileysAvailable) {
        console.log('ℹ️ Baileys package not available - WhatsApp disabled');
        return null;
    }

    try {
        console.log('🔄 Initializing WhatsApp connection...');
        const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

        sock = makeWASocket({
            auth: state,
            printQRInTerminal: true,
            browser: ['Madarsa Imdadul Uloom', 'Chrome', '1.0.0']
        });

        // Connection update handler
        sock.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                qrCode = qr;
                console.log('📱 WhatsApp QR Code generated - Scan to connect!');
            }

            if (connection === 'close') {
                isConnected = false;
                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
                console.log('❌ WhatsApp disconnected, reconnecting:', shouldReconnect);

                if (shouldReconnect) {
                    setTimeout(initWhatsApp, 5000);
                }
            } else if (connection === 'open') {
                isConnected = true;
                qrCode = null;
                console.log('✅ WhatsApp connected successfully!');
            }
        });

        // Save credentials on update
        sock.ev.on('creds.update', saveCreds);

        return sock;
    } catch (error) {
        console.error('❌ WhatsApp init error:', error.message);
        console.log('ℹ️ App will continue without WhatsApp notifications');
        return null;
    }
}

// Format phone number for WhatsApp
function formatPhoneNumber(phone) {
    // Remove all non-digits
    let cleaned = phone.replace(/\D/g, '');
    
    // Add India country code if not present
    if (cleaned.length === 10) {
        cleaned = '91' + cleaned;
    }
    
    return cleaned + '@s.whatsapp.net';
}

// Send text message
async function sendMessage(phone, message) {
    try {
        if (!isConnected || !sock) {
            console.log('⚠️ WhatsApp not connected, message queued');
            return { success: false, reason: 'not_connected' };
        }

        const jid = formatPhoneNumber(phone);
        await sock.sendMessage(jid, { text: message });
        console.log(`✅ WhatsApp message sent to ${phone}`);
        return { success: true };
    } catch (error) {
        console.error('❌ WhatsApp send error:', error.message);
        return { success: false, error: error.message };
    }
}

// Send message with image
async function sendImage(phone, imageUrl, caption) {
    try {
        if (!isConnected || !sock) {
            return { success: false, reason: 'not_connected' };
        }

        const jid = formatPhoneNumber(phone);
        await sock.sendMessage(jid, {
            image: { url: imageUrl },
            caption: caption
        });
        console.log(`✅ WhatsApp image sent to ${phone}`);
        return { success: true };
    } catch (error) {
        console.error('❌ WhatsApp image send error:', error.message);
        return { success: false, error: error.message };
    }
}

// Send document/PDF
async function sendDocument(phone, filePath, filename) {
    try {
        if (!isConnected || !sock) {
            return { success: false, reason: 'not_connected' };
        }

        const jid = formatPhoneNumber(phone);
        await sock.sendMessage(jid, {
            document: fs.readFileSync(filePath),
            fileName: filename,
            mimetype: 'application/pdf'
        });
        console.log(`✅ WhatsApp document sent to ${phone}`);
        return { success: true };
    } catch (error) {
        console.error('❌ WhatsApp document send error:', error.message);
        return { success: false, error: error.message };
    }
}

// Get connection status
function getStatus() {
    return {
        connected: isConnected,
        qrCode: qrCode
    };
}

// Logout and clear session
async function logout() {
    if (sock) {
        await sock.logout();
        fs.rmSync(AUTH_DIR, { recursive: true, force: true });
        isConnected = false;
        qrCode = null;
        console.log('🔌 WhatsApp logged out');
    }
}

module.exports = {
    initWhatsApp,
    sendMessage,
    sendImage,
    sendDocument,
    getStatus,
    logout,
    formatPhoneNumber
};

