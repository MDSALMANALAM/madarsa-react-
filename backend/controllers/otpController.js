const nodemailer = require("nodemailer");

let otpStore = {}; // temporary store

// ✅ Configure Email Transport
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Check Mail Server Connection
transporter.verify((error, success) => {
  console.log(error || "📨 Email Server Connected");
});

// ✅ Send OTP to Email
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000);

    otpStore[email] = otp;

    await transporter.sendMail({
      from: `"Madarsa Imdadul Uloom" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}`,
      html: `<h2>Your OTP is: <b>${otp}</b></h2>`
    });

    return res.json({ success: true, message: "OTP sent successfully" });

  } catch (error) {
    console.log("OTP Error:", error);
    return res.json({ success: false, message: "Failed to send OTP" });
  }
};

// ✅ Verify OTP
exports.verifyOTP = (req, res) => {
  const { email, otp } = req.body;

  if (otpStore[email] && otpStore[email] == otp) {
    delete otpStore[email];
    return res.json({ success: true, message: "OTP Verified" });
  }

  return res.json({ success: false, message: "Invalid OTP" });
};
