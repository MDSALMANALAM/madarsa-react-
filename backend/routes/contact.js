const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all contact messages (for admin)
router.get('/messages', async (req, res) => {
    try {
        const [messages] = await db.promise().query(
            'SELECT * FROM contact_messages ORDER BY created_at DESC'
        );
        
        res.json({
            success: true,
            messages
        });
    } catch (error) {
        console.error('❌ Error fetching contact messages:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Get single contact message by ID
router.get('/messages/:id', async (req, res) => {
    try {
        const [messages] = await db.promise().query(
            'SELECT * FROM contact_messages WHERE id = ?',
            [req.params.id]
        );
        
        if (messages.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }
        
        // Mark as read
        await db.promise().query(
            'UPDATE contact_messages SET status = "read" WHERE id = ?',
            [req.params.id]
        );
        
        res.json({
            success: true,
            message: messages[0]
        });
    } catch (error) {
        console.error('❌ Error fetching contact message:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Submit contact form
router.post('/submit', async (req, res) => {
    try {
        const { firstName, lastName, email, phone, subject, message, newsletter } = req.body;
        
        // Validation
        if (!firstName || !lastName || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'Please fill all required fields'
            });
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid email address'
            });
        }
        
        const [result] = await db.promise().query(
            `INSERT INTO contact_messages 
            (first_name, last_name, email, phone, subject, message, newsletter) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [firstName, lastName, email, phone || null, subject, message, newsletter ? 1 : 0]
        );
        
        console.log(`✅ Contact message received from: ${firstName} ${lastName} (${email})`);
        
        res.status(201).json({
            success: true,
            message: 'Thank you for contacting us! We will get back to you soon.',
            messageId: result.insertId
        });
    } catch (error) {
        console.error('❌ Error submitting contact form:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to submit contact form. Please try again.' 
        });
    }
});

// Update message status
router.put('/messages/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!['new', 'read', 'replied', 'closed'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }
        
        await db.promise().query(
            'UPDATE contact_messages SET status = ? WHERE id = ?',
            [status, req.params.id]
        );
        
        res.json({
            success: true,
            message: 'Status updated successfully'
        });
    } catch (error) {
        console.error('❌ Error updating message status:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Delete contact message
router.delete('/messages/:id', async (req, res) => {
    try {
        await db.promise().query(
            'DELETE FROM contact_messages WHERE id = ?',
            [req.params.id]
        );
        
        console.log(`🗑️ Contact message deleted: ID ${req.params.id}`);
        
        res.json({
            success: true,
            message: 'Message deleted successfully'
        });
    } catch (error) {
        console.error('❌ Error deleting message:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

module.exports = router;

