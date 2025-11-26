const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Test endpoint
router.get("/test", (req, res) => {
    res.json({ success: true, message: "Finance API is working!", timestamp: new Date() });
});

// Get all finance data (no year filter)
router.get("/all", (req, res) => {
    console.log('📊 Fetching ALL finance data (no year filter)...');
    const query = "SELECT * FROM finance_transactions ORDER BY date DESC";

    db.query(query, (err, results) => {
        if (err) {
            console.error('❌ Finance all query error:', err);
            return res.status(500).json({ success: false, message: err.message, error: err.code });
        }
        console.log(`✅ All finance data loaded: ${results.length} transactions found`);
        res.json({ success: true, data: results, count: results.length });
    });
});

// Get finance data for selected year
router.get("/:year", (req, res) => {
    const year = parseInt(req.params.year);
    const start = `${year}-04-01`;
    const end = `${year + 1}-03-31`;

    console.log(`📊 Loading finance data for year ${year} (${start} to ${end})`);

    const query = `
        SELECT * FROM finance_transactions
        WHERE date BETWEEN ? AND ?
        ORDER BY date DESC
    `;

    db.query(query, [start, end], (err, results) => {
        if (err) {
            console.error('❌ Finance query error:', err);
            return res.json({ success: false, message: err.message });
        }
        console.log(`✅ Finance data loaded: ${results.length} transactions found`);
        res.json({ success: true, data: results });
    });
});

// Add income
router.post("/income", (req, res) => {
    const { date, category, description, amount } = req.body;

    const query = `
        INSERT INTO finance_transactions (date, type, category, description, amount)
        VALUES (?, 'income', ?, ?, ?)
    `;

    db.query(query, [date, category, description, amount], (err) => {
        if (err) return res.json({ success: false, message: err });
        res.json({ success: true });
    });
});

// Add expense
router.post("/expense", (req, res) => {
    const { date, category, description, amount } = req.body;

    const query = `
        INSERT INTO finance_transactions (date, type, category, description, amount)
        VALUES (?, 'expense', ?, ?, ?)
    `;

    db.query(query, [date, category, description, amount], (err) => {
        if (err) return res.json({ success: false, message: err });
        res.json({ success: true });
    });
});

// Delete transaction
router.delete("/:id", (req, res) => {
    const query = "DELETE FROM finance_transactions WHERE id = ?";
    db.query(query, [req.params.id], (err) => {
        if (err) return res.json({ success: false });
        res.json({ success: true });
    });
});

module.exports = router;
