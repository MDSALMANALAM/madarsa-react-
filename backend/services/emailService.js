// backend/services/emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // e.g. salmanalam8083@gmail.com
    pass: process.env.EMAIL_PASS  // 16-char app password WITHOUT SPACES
  }
});

async function sendOtpEmail(to, otp, purpose = 'registration') {
  const subject =
    purpose === 'login'
      ? 'Madarsa Imdadul Uloom - OTP for Login'
      : 'Madarsa Imdadul Uloom - OTP for Registration';

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#2c5aa0;color:#fff;padding:16px;text-align:center">
        <h2 style="margin:0">Madarsa Imdadul Uloom</h2>
      </div>
      <div style="padding:20px">
        <p>Use the following OTP to complete your ${purpose}:</p>
        <div style="background:#f5f5f5;padding:14px;text-align:center;font-size:24px;font-weight:700;letter-spacing:4px">
          ${otp}
        </div>
        <p>This OTP will expire in 10 minutes.</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"Madarsa Imdadul Uloom" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  });
}

module.exports = { sendOtpEmail };
