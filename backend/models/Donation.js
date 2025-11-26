const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema({
  donor_name: {
    type: String,
    required: true,
  },
  donor_email: {
    type: String,
    required: true,
  },
  donor_phone: {
    type: String,
    required: false
  },
  amount: {
    type: Number,
    required: true,
  },
  payment_method: {
    type: String,
    enum: ["cash", "online", "razorpay", "bank_transfer"],
    required: true,
  },
  transaction_id: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending"
  },
  notes: {
    type: String,
    default: ""
  },
  created_at: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model("Donation", donationSchema);


