// =============================================
// NATS Service - Real-time Message Broker
// Madarsa Imdadul Uloom
// Works in LOCAL and PRODUCTION (Docker)
// =============================================

let connect, StringCodec;
let natsConnection = null;
let sc = null;
let isNatsAvailable = false;

// Safely load NATS module
try {
    const nats = require('nats');
    connect = nats.connect;
    StringCodec = nats.StringCodec;
    sc = StringCodec();
    isNatsAvailable = true;
} catch (e) {
    console.warn('⚠️ NATS package not installed - real-time messaging disabled');
    console.warn('   Run: npm install nats');
}

// Event Topics
const TOPICS = {
    ADMISSION_NEW: 'madarsa.admission.new',
    ADMISSION_APPROVED: 'madarsa.admission.approved',
    ADMISSION_REJECTED: 'madarsa.admission.rejected',
    DONATION_NEW: 'madarsa.donation.new',
    DONATION_SUCCESS: 'madarsa.donation.success',
    CONTACT_NEW: 'madarsa.contact.new',
    STUDENT_REGISTERED: 'madarsa.student.registered',
    FEE_PAID: 'madarsa.fee.paid',
    FINANCE_INCOME: 'madarsa.finance.income',
    FINANCE_EXPENSE: 'madarsa.finance.expense',
    OTP_SENT: 'madarsa.otp.sent'
};

// Connect to NATS (with graceful fallback)
async function connectNATS() {
    // Skip if NATS disabled via env
    if (process.env.NATS_ENABLED === 'false') {
        console.log('ℹ️ NATS disabled via NATS_ENABLED=false');
        return null;
    }

    // Skip if package not available
    if (!isNatsAvailable) {
        console.log('ℹ️ NATS package not available - skipping connection');
        return null;
    }

    try {
        const natsUrl = process.env.NATS_URL || 'nats://localhost:4222';
        console.log(`🔄 Connecting to NATS at ${natsUrl}...`);

        natsConnection = await connect({
            servers: natsUrl,
            timeout: 5000,
            reconnect: true,
            maxReconnectAttempts: 5,
            reconnectTimeWait: 2000
        });

        console.log('✅ NATS connected successfully to', natsUrl);

        // Handle connection close
        natsConnection.closed().then(() => {
            console.log('🔌 NATS connection closed');
            natsConnection = null;
        });

        return natsConnection;
    } catch (error) {
        console.warn('⚠️ NATS connection failed:', error.message);
        console.log('ℹ️ Running without NATS - app will work, notifications via email only');
        natsConnection = null;
        return null;
    }
}

// Publish message to topic (safe - won't crash if NATS unavailable)
async function publish(topic, data) {
    try {
        // Silent skip if NATS not connected (graceful degradation)
        if (!natsConnection || !sc) {
            if (process.env.NODE_ENV === 'development') {
                console.log(`📤 [NATS-SKIP] ${topic}:`, JSON.stringify(data).substring(0, 80) + '...');
            }
            return false;
        }

        const message = JSON.stringify({
            topic,
            data,
            timestamp: new Date().toISOString()
        });

        natsConnection.publish(topic, sc.encode(message));
        console.log(`📤 NATS Published [${topic}]:`, data.type || 'event');
        return true;
    } catch (error) {
        console.error('❌ NATS publish error:', error.message);
        return false;
    }
}

// Subscribe to topic
async function subscribe(topic, callback) {
    try {
        if (!natsConnection) {
            console.log('⚠️ NATS not connected, skipping subscribe');
            return null;
        }
        
        const subscription = natsConnection.subscribe(topic);
        console.log(`📥 NATS Subscribed to [${topic}]`);
        
        (async () => {
            for await (const msg of subscription) {
                try {
                    const data = JSON.parse(sc.decode(msg.data));
                    callback(data);
                } catch (err) {
                    console.error('❌ NATS message parse error:', err.message);
                }
            }
        })();
        
        return subscription;
    } catch (error) {
        console.error('❌ NATS subscribe error:', error.message);
        return null;
    }
}

// Subscribe to all madarsa events (wildcard)
async function subscribeAll(callback) {
    return subscribe('madarsa.>', callback);
}

// Close connection
async function closeNATS() {
    if (natsConnection) {
        await natsConnection.drain();
        console.log('🔌 NATS connection closed');
    }
}

// Get connection status
function isConnected() {
    return natsConnection !== null && !natsConnection.isClosed();
}

module.exports = {
    connectNATS,
    publish,
    subscribe,
    subscribeAll,
    closeNATS,
    isConnected,
    TOPICS
};

