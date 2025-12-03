// =============================================
// WhatsApp Service using Baileys
// Madarsa Imdadul Uloom
// Works in LOCAL and PRODUCTION (Docker)
// Uses Pairing Code method (more reliable on servers)
// =============================================

const path = require('path');
const fs = require('fs');

// Safely load Baileys module
let makeWASocket, DisconnectReason, useMultiFileAuthState, makeCacheableSignalKeyStore, Browsers;
let isBaileysAvailable = false;

try {
    const baileys = require('@whiskeysockets/baileys');
    makeWASocket = baileys.default;
    DisconnectReason = baileys.DisconnectReason;
    useMultiFileAuthState = baileys.useMultiFileAuthState;
    makeCacheableSignalKeyStore = baileys.makeCacheableSignalKeyStore;
    Browsers = baileys.Browsers;
    isBaileysAvailable = true;
} catch (e) {
    console.warn('⚠️ Baileys package not installed - WhatsApp disabled');
    console.warn('   Run: npm install @whiskeysockets/baileys');
}

let sock = null;
let isConnected = false;
let qrCode = null;
let pairingCode = null;
let isInitializing = false;
let reconnectAttempts = 0;
let lastError = null;
const MAX_RECONNECT_ATTEMPTS = 5;

const AUTH_DIR = path.join(__dirname, '..', 'whatsapp_auth');
const ADMIN_PHONE = process.env.ADMIN_PHONE || '9625954687';

// Ensure auth directory exists
try {
    if (!fs.existsSync(AUTH_DIR)) {
        fs.mkdirSync(AUTH_DIR, { recursive: true });
    }
} catch (e) {
    console.warn('⚠️ Could not create WhatsApp auth directory');
}

// Initialize WhatsApp connection with Pairing Code
async function initWhatsApp(phoneNumber = null) {
    // Prevent multiple simultaneous init attempts
    if (isInitializing) {
        console.log('⏳ WhatsApp already initializing...');
        return null;
    }

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

    isInitializing = true;

    try {
        console.log('🔄 Initializing WhatsApp connection...');
        const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

        sock = makeWASocket({
            auth: state,
            printQRInTerminal: true,
            browser: Browsers.ubuntu('Chrome'),
            syncFullHistory: false,
            generateHighQualityLinkPreview: false
        });

        // Request pairing code if not registered and phone number provided
        if (!sock.authState.creds.registered) {
            const phone = phoneNumber || ADMIN_PHONE;
            if (phone) {
                setTimeout(async () => {
                    try {
                        const formattedPhone = phone.replace(/\D/g, '');
                        const fullPhone = formattedPhone.length === 10 ? '91' + formattedPhone : formattedPhone;
                        pairingCode = await sock.requestPairingCode(fullPhone);
                        console.log('');
                        console.log('═══════════════════════════════════════════');
                        console.log('📱 WhatsApp PAIRING CODE:', pairingCode);
                        console.log('═══════════════════════════════════════════');
                        console.log('');
                        console.log('👉 Open WhatsApp on phone');
                        console.log('👉 Go to Settings > Linked Devices > Link a Device');
                        console.log('👉 Choose "Link with phone number instead"');
                        console.log('👉 Enter this code:', pairingCode);
                        console.log('');
                    } catch (err) {
                        console.log('⚠️ Pairing code error:', err.message);
                    }
                }, 3000);
            }
        }

        // Connection update handler
        sock.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                qrCode = qr;
                console.log('📱 WhatsApp QR Code generated - Scan to connect!');
            }

            if (connection === 'close') {
                isConnected = false;
                isInitializing = false;
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                lastError = statusCode;

                // Don't reconnect on rate limit (405, 428) or logged out
                const isRateLimited = statusCode === 405 || statusCode === 428;
                const isLoggedOut = statusCode === DisconnectReason.loggedOut;

                console.log('❌ WhatsApp disconnected, status:', statusCode);

                if (isRateLimited) {
                    console.log('⚠️ Rate limited by WhatsApp! Wait 5-10 minutes before trying again.');
                    console.log('   Run: docker exec madarsa_backend rm -rf /app/whatsapp_auth/*');
                    reconnectAttempts = MAX_RECONNECT_ATTEMPTS; // Stop reconnecting
                    return;
                }

                if (isLoggedOut) {
                    console.log('📴 WhatsApp logged out - Manual re-initialization required');
                    reconnectAttempts = MAX_RECONNECT_ATTEMPTS;
                    return;
                }

                // Reconnect with exponential backoff (max 5 attempts)
                reconnectAttempts++;
                if (reconnectAttempts <= MAX_RECONNECT_ATTEMPTS) {
                    const delay = Math.min(30000, reconnectAttempts * 10000); // 10s, 20s, 30s...
                    console.log(`🔄 Reconnecting in ${delay/1000}s (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
                    setTimeout(() => initWhatsApp(phoneNumber), delay);
                } else {
                    console.log('❌ Max reconnect attempts reached. Manual initialization required.');
                }
            } else if (connection === 'open') {
                isConnected = true;
                isInitializing = false;
                reconnectAttempts = 0; // Reset on successful connection
                lastError = null;
                qrCode = null;
                pairingCode = null;
                console.log('✅ WhatsApp connected successfully!');
            }
        });

        // Save credentials on update
        sock.ev.on('creds.update', saveCreds);

        return sock;
    } catch (error) {
        isInitializing = false;
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
        qrCode: qrCode,
        pairingCode: pairingCode,
        isInitializing: isInitializing,
        lastError: lastError,
        reconnectAttempts: reconnectAttempts,
        maxAttempts: MAX_RECONNECT_ATTEMPTS
    };
}

// Reset reconnect attempts (for manual retry)
function resetReconnectAttempts() {
    reconnectAttempts = 0;
    lastError = null;
    console.log('🔄 Reconnect attempts reset - Ready to try again');
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
    formatPhoneNumber,
    resetReconnectAttempts
};

