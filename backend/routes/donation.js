// =============================================
// DONATION ROUTES (Madarsa Imdadul Uloom)
// With Razorpay Payment Integration
// =============================================

const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Donation = require('../models/Donation');
const sql = require("../config/db"); // SQL connection

require('dotenv').config();

const router = express.Router();

// 🔹 Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});


// ============================
// 📦 Get all donations
// ============================
router.get('/', async (req, res) => {
    try {
        const { startDate, endDate, status } = req.query;
        let filter = {};
        
        if (startDate && endDate) {
            filter.created_at = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        
        if (status) filter.status = status;
        
        const donations = await Donation.find(filter).sort({ created_at: -1 });
        
        const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);
        const completed = donations.filter(d => d.status === 'completed');
        const totalCompleted = completed.reduce((sum, d) => sum + d.amount, 0);
        
        res.json({
            success: true,
            data: donations,
            summary: {
                totalDonations: donations.length,
                totalAmount,
                totalCompleted,
                pendingDonations: donations.filter(d => d.status === 'pending').length
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});


// ============================
// 🧾 Create new donation (manual or cash)
// ============================
router.post('/', async (req, res) => {
    try {
        const { donorName, donorEmail, donorPhone, amount, paymentMethod, notes } = req.body;
        
        const donation = await Donation.create({
            donor_name: donorName,
            donor_email: donorEmail,
            donor_phone: donorPhone,
            amount: parseFloat(amount),
            payment_method: paymentMethod,
            notes,
            status: paymentMethod === 'cash' ? 'completed' : 'pending'
        });
        
        res.status(201).json({
            success: true,
            data: donation,
            message: 'Donation recorded successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});


// ============================
// 🔍 Get donation by ID
// ============================
router.get('/:id', async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id);
        
        if (!donation) {
            return res.status(404).json({
                success: false,
                message: 'Donation not found'
            });
        }
        
        res.json({ success: true, data: donation });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});


// ============================
// 🔄 Update donation status
// ============================
router.patch('/:id/status', async (req, res) => {
    try {
        const { status, transactionId } = req.body;
        
        const donation = await Donation.findByIdAndUpdate(
            req.params.id,
            { status, transaction_id: transactionId },
            { new: true }
        );
        
        if (!donation) {
            return res.status(404).json({
                success: false,
                message: 'Donation not found'
            });
        }
        
        res.json({
            success: true,
            data: donation,
            message: 'Donation status updated successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});


// ============================
// 📊 Donation statistics
// ============================
router.get('/stats/summary', async (req, res) => {
    try {
        const { period = 'month' } = req.query;
        
        let dateFilter = {};
        const now = new Date();
        
        if (period === 'month') {
            dateFilter.created_at = { $gte: new Date(now.getFullYear(), now.getMonth(), 1) };
        } else if (period === 'year') {
            dateFilter.created_at = { $gte: new Date(now.getFullYear(), 0, 1) };
        }
        
        const donations = await Donation.find({ ...dateFilter, status: 'completed' });
        
        const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);
        const donationCount = donations.length;
        
        const paymentBreakdown = donations.reduce((acc, d) => {
            acc[d.payment_method] = (acc[d.payment_method] || 0) + d.amount;
            return acc;
        }, {});
        
        res.json({
            success: true,
            data: {
                totalAmount,
                donationCount,
                paymentBreakdown,
                averageDonation: donationCount > 0 ? totalAmount / donationCount : 0
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});


// ============================
// 💳 Razorpay: Create order
// ============================
router.post('/create-order', async (req, res) => {
    try {
        const { donorName, donorEmail, donorPhone, amount } = req.body;

        const options = {
            amount: amount * 100, // Convert ₹ to paisa
            currency: "INR",
            receipt: "donation_rcpt_" + Date.now(),
        };

        const order = await razorpay.orders.create(options);

        const donation = await Donation.create({
            donor_name: donorName,
            donor_email: donorEmail,
            donor_phone: donorPhone,
            amount: amount,
            payment_method: "razorpay",
            status: "pending",
            transaction_id: order.id
        });

        res.status(200).json({
            success: true,
            order,
            donationId: donation._id
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});


// ============================
// 🧾 Razorpay: Verify payment
// ============================
router.post('/verify-payment', async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, donationId } = req.body;

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            await Donation.findByIdAndUpdate(donationId, {
                status: "completed",
                transaction_id: razorpay_payment_id
            });

            res.json({
                success: true,
                message: "Payment verified and donation updated successfully"
            });
        } else {
            res.status(400).json({
                success: false,
                message: "Invalid signature, payment verification failed"
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});


// ============================
// Export router
// ============================
module.exports = router;
