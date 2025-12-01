// =============================================
// Unified Notification Service
// Email + WhatsApp for Admin, Teacher, Student, Parent
// Madarsa Imdadul Uloom
// =============================================

const { sendOtpEmail } = require('./emailService');
const whatsapp = require('./whatsappService');
const nats = require('./natsService');
const nodemailer = require('nodemailer');

// Email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Admin contacts (from env or defaults)
const ADMIN_PHONE = process.env.ADMIN_PHONE || '9304678815';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'info@madarasaimdadululoom.in';

// =============================================
// MESSAGE TEMPLATES
// =============================================

const templates = {
    // Admission Templates
    admissionNew: (data) => ({
        subject: `🎓 New Admission Application - ${data.student_name}`,
        whatsapp: `🎓 *NEW ADMISSION*\n\n👤 Student: ${data.student_name}\n👨 Father: ${data.father_name}\n📚 Class: ${data.class_name}\n📱 Phone: ${data.phone}\n🆔 Admission No: ${data.admission_no}\n\n_Madarsa Imdadul Uloom_`,
        email: `
            <h2>New Admission Application Received</h2>
            <p><strong>Student:</strong> ${data.student_name}</p>
            <p><strong>Father:</strong> ${data.father_name}</p>
            <p><strong>Class:</strong> ${data.class_name}</p>
            <p><strong>Phone:</strong> ${data.phone}</p>
            <p><strong>Admission No:</strong> ${data.admission_no}</p>
        `
    }),
    
    admissionApproved: (data) => ({
        subject: `✅ Admission Approved - ${data.student_name}`,
        whatsapp: `✅ *ADMISSION APPROVED*\n\nAssalamu Alaikum!\n\n🎉 ${data.student_name} ka admission approve ho gaya hai!\n\n🆔 Admission No: ${data.admission_no}\n📚 Class: ${data.class_name}\n\nPlease visit Madarsa for further process.\n\n_Madarsa Imdadul Uloom_`,
        email: `<h2>Congratulations! Admission Approved</h2><p>Student ${data.student_name} has been admitted to Class ${data.class_name}.</p>`
    }),
    
    admissionRejected: (data) => ({
        subject: `❌ Admission Status - ${data.student_name}`,
        whatsapp: `❌ *ADMISSION UPDATE*\n\nAssalamu Alaikum,\n\nWe regret to inform that admission for ${data.student_name} could not be processed.\n\nPlease contact office for details.\n\n_Madarsa Imdadul Uloom_`,
        email: `<h2>Admission Update</h2><p>We regret to inform that admission for ${data.student_name} could not be processed.</p>`
    }),
    
    // Donation Templates
    donationNew: (data) => ({
        subject: `💰 New Donation Received - ₹${data.amount}`,
        whatsapp: `💰 *NEW DONATION*\n\n👤 Donor: ${data.donor_name}\n💵 Amount: ₹${data.amount}\n📱 Phone: ${data.donor_phone}\n💳 Method: ${data.payment_method}\n\n_Madarsa Imdadul Uloom_`,
        email: `<h2>New Donation Received</h2><p>Amount: ₹${data.amount}</p><p>Donor: ${data.donor_name}</p>`
    }),
    
    donationThanks: (data) => ({
        subject: `🙏 Thank You for Your Donation - Madarsa Imdadul Uloom`,
        whatsapp: `🙏 *JAZAKALLAH KHAIR*\n\nAssalamu Alaikum ${data.donor_name}!\n\nThank you for your generous donation of ₹${data.amount}.\n\nMay Allah reward you abundantly.\n\n_Madarsa Imdadul Uloom_`,
        email: `<h2>Thank You for Your Generous Donation</h2><p>Amount: ₹${data.amount}</p><p>May Allah bless you.</p>`
    }),
    
    // Contact Templates
    contactNew: (data) => ({
        subject: `📩 New Contact Inquiry - ${data.subject}`,
        whatsapp: `📩 *NEW INQUIRY*\n\n👤 Name: ${data.first_name} ${data.last_name}\n📧 Email: ${data.email}\n📱 Phone: ${data.phone || 'N/A'}\n📋 Subject: ${data.subject}\n\n💬 Message:\n${data.message}\n\n_Madarsa Imdadul Uloom_`,
        email: `<h2>New Contact Inquiry</h2><p><strong>From:</strong> ${data.first_name} ${data.last_name}</p><p><strong>Subject:</strong> ${data.subject}</p><p>${data.message}</p>`
    }),
    
    // Fee Templates
    feePaid: (data) => ({
        subject: `✅ Fee Payment Received - ${data.student_name}`,
        whatsapp: `✅ *FEE PAYMENT*\n\n👤 Student: ${data.student_name}\n💵 Amount: ₹${data.amount}\n📅 Date: ${data.date}\n🧾 Receipt: ${data.receipt_no || 'N/A'}\n\n_Madarsa Imdadul Uloom_`,
        email: `<h2>Fee Payment Confirmation</h2><p>Amount ₹${data.amount} received for ${data.student_name}.</p>`
    }),

    // Student Registration
    studentRegistered: (data) => ({
        subject: `🎓 Student Registered - ${data.name}`,
        whatsapp: `🎓 *STUDENT REGISTERED*\n\n👤 Name: ${data.name}\n📚 Class: ${data.class}\n👨 Parent: ${data.parent}\n📱 Contact: ${data.contact}\n\n_Madarsa Imdadul Uloom_`,
        email: `<h2>Student Registration Successful</h2><p>Student ${data.name} registered in Class ${data.class}.</p>`
    })
};

// =============================================
// NOTIFICATION FUNCTIONS
// =============================================

// Send Email
async function sendEmail(to, subject, htmlContent) {
    try {
        await transporter.sendMail({
            from: `"Madarsa Imdadul Uloom" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html: htmlContent
        });
        console.log(`📧 Email sent to ${to}`);
        return true;
    } catch (error) {
        console.error('❌ Email error:', error.message);
        return false;
    }
}

// Send to Admin (both Email + WhatsApp)
async function notifyAdmin(template, data) {
    const content = templates[template](data);
    
    await Promise.all([
        sendEmail(ADMIN_EMAIL, content.subject, content.email),
        whatsapp.sendMessage(ADMIN_PHONE, content.whatsapp)
    ]);
}

// Send to User (Student/Parent)
async function notifyUser(phone, email, template, data) {
    const content = templates[template](data);
    
    const promises = [];
    if (phone) promises.push(whatsapp.sendMessage(phone, content.whatsapp));
    if (email) promises.push(sendEmail(email, content.subject, content.email));
    
    await Promise.all(promises);
}

// Notify multiple recipients
async function notifyMultiple(recipients, template, data) {
    const content = templates[template](data);
    
    for (const recipient of recipients) {
        if (recipient.phone) await whatsapp.sendMessage(recipient.phone, content.whatsapp);
        if (recipient.email) await sendEmail(recipient.email, content.subject, content.email);
    }
}

module.exports = {
    sendEmail,
    notifyAdmin,
    notifyUser,
    notifyMultiple,
    templates,
    ADMIN_PHONE,
    ADMIN_EMAIL
};

