// =============================================
// NATS Consumer - Handles all notification events
// Madarsa Imdadul Uloom
// =============================================

const nats = require('./natsService');
const notification = require('./notificationService');

// Start consuming events
async function startConsumer() {
    console.log('🎧 Starting NATS notification consumer...');
    
    // Subscribe to all madarsa events
    await nats.subscribeAll(async (message) => {
        const { topic, data } = message;
        console.log(`📨 Received event: ${topic}`);
        
        try {
            switch (topic) {
                // =====================================
                // ADMISSION EVENTS
                // =====================================
                case nats.TOPICS.ADMISSION_NEW:
                    // Notify admin about new admission
                    await notification.notifyAdmin('admissionNew', data);
                    break;
                    
                case nats.TOPICS.ADMISSION_APPROVED:
                    // Notify parent about approval
                    await notification.notifyUser(data.phone, data.email, 'admissionApproved', data);
                    // Also notify admin
                    await notification.notifyAdmin('admissionApproved', data);
                    break;
                    
                case nats.TOPICS.ADMISSION_REJECTED:
                    // Notify parent about rejection
                    await notification.notifyUser(data.phone, data.email, 'admissionRejected', data);
                    break;
                
                // =====================================
                // DONATION EVENTS
                // =====================================
                case nats.TOPICS.DONATION_NEW:
                    // Notify admin about new donation
                    await notification.notifyAdmin('donationNew', data);
                    break;
                    
                case nats.TOPICS.DONATION_SUCCESS:
                    // Thank donor
                    await notification.notifyUser(data.donor_phone, data.donor_email, 'donationThanks', data);
                    // Also notify admin
                    await notification.notifyAdmin('donationNew', data);
                    break;
                
                // =====================================
                // CONTACT EVENTS
                // =====================================
                case nats.TOPICS.CONTACT_NEW:
                    // Notify admin about new contact inquiry
                    await notification.notifyAdmin('contactNew', data);
                    break;
                
                // =====================================
                // STUDENT EVENTS
                // =====================================
                case nats.TOPICS.STUDENT_REGISTERED:
                    // Notify admin and parent
                    await notification.notifyAdmin('studentRegistered', data);
                    if (data.contact) {
                        await notification.notifyUser(data.contact, null, 'studentRegistered', data);
                    }
                    break;
                
                // =====================================
                // FEE/FINANCE EVENTS
                // =====================================
                case nats.TOPICS.FEE_PAID:
                    // Notify parent about fee payment
                    await notification.notifyUser(data.phone, data.email, 'feePaid', data);
                    // Notify admin
                    await notification.notifyAdmin('feePaid', data);
                    break;
                    
                case nats.TOPICS.FINANCE_INCOME:
                    console.log(`💰 Income recorded: ₹${data.amount} - ${data.category}`);
                    break;
                    
                case nats.TOPICS.FINANCE_EXPENSE:
                    console.log(`💸 Expense recorded: ₹${data.amount} - ${data.category}`);
                    break;
                
                default:
                    console.log(`⚠️ Unknown event topic: ${topic}`);
            }
        } catch (error) {
            console.error(`❌ Error processing event ${topic}:`, error.message);
        }
    });
    
    console.log('✅ NATS consumer started - listening for events');
}

module.exports = { startConsumer };

