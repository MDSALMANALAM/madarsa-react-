// backend/routes/teacher.js
const express = require('express');
const router = express.Router();
const db = require('../config/db'); // ✅ MySQL connection

// 🧠 Add new teacher
router.post('/', async (req, res) => {
  try {
    const { name, subject, classes, contact, status = 'Active' } = req.body;

    if (!name || !subject || !classes || !contact) {
      return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    const [result] = await db.promise().query(
      'INSERT INTO teachers (name, subject, classes, contact, status) VALUES (?, ?, ?, ?, ?)',
      [name, subject, classes, contact, status]
    );

    res.json({
      success: true,
      message: 'Teacher added successfully',
      teacher: { id: result.insertId, name, subject, classes, contact, status }
    });
  } catch (err) {
    console.error('Teacher Add Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 🧠 Get all teachers
router.get('/', async (req, res) => {
  try {
    const [teachers] = await db.promise().query('SELECT * FROM teachers ORDER BY id DESC');
    res.json({ success: true, teachers });
  } catch (err) {
    console.error('Fetch Teacher Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 🧠 Delete a teacher
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.promise().query('DELETE FROM teachers WHERE id = ?', [id]);
    res.json({ success: true, message: 'Teacher deleted successfully' });
  } catch (err) {
    console.error('Delete Teacher Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
