// backend/routes/parent.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all parents
router.get('/', async (req, res) => {
  try {
    const [parents] = await db.promise().query('SELECT * FROM parents ORDER BY id DESC');
    res.json({ success: true, parents });
  } catch (err) {
    console.error('Fetch Parents Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Add new parent
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, address, student_ids } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Name and phone are required' });
    }

    const [result] = await db.promise().query(
      'INSERT INTO parents (name, phone, email, address, student_ids) VALUES (?, ?, ?, ?, ?)',
      [name, phone, email || null, address || null, student_ids || null]
    );

    res.json({
      success: true,
      message: 'Parent added successfully',
      parent: { id: result.insertId, name, phone, email, address }
    });
  } catch (err) {
    console.error('Add Parent Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete parent
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.promise().query('DELETE FROM parents WHERE id = ?', [id]);
    res.json({ success: true, message: 'Parent deleted successfully' });
  } catch (err) {
    console.error('Delete Parent Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

