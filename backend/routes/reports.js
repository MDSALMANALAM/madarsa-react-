// backend/routes/reports.js
const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const db = require('../config/db');

const REPORTS_DIR = path.join(__dirname, '..', 'uploads', 'reports');
if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

// Helper function to add colorful header
function addHeader(doc, title, subtitle) {
    // Background color for header
    doc.rect(0, 0, doc.page.width, 100).fill('#0891b2');

    // Logo/Icon area
    doc.circle(50, 50, 30).fill('#ffffff');
    doc.fontSize(20).fillColor('#0891b2').text('🕌', 25, 35);

    // Title
    doc.fontSize(24).fillColor('#ffffff').text(title, 100, 30, { width: 400 });
    doc.fontSize(12).fillColor('#e0f2fe').text(subtitle, 100, 60);

    // Reset position
    doc.fillColor('#000000');
    doc.moveDown(4);
}

// Helper function to add footer
function addFooter(doc, pageNumber) {
    const bottom = doc.page.height - 50;
    doc.fontSize(10).fillColor('#666666')
       .text(`Generated on: ${new Date().toLocaleString()}`, 50, bottom, { align: 'left' })
       .text(`Page ${pageNumber}`, 50, bottom, { align: 'right' });
}

// Helper function to create table
function createTable(doc, headers, rows, startY) {
    const tableTop = startY || doc.y;
    const colWidth = (doc.page.width - 100) / headers.length;
    let y = tableTop;

    // Header row with color
    doc.rect(50, y, doc.page.width - 100, 25).fill('#0891b2');
    doc.fontSize(10).fillColor('#ffffff');
    headers.forEach((header, i) => {
        doc.text(header, 55 + (i * colWidth), y + 7, { width: colWidth - 10, align: 'left' });
    });

    y += 25;
    doc.fillColor('#000000');

    // Data rows with alternating colors
    rows.forEach((row, rowIndex) => {
        if (y > doc.page.height - 100) {
            doc.addPage();
            y = 50;
        }

        // Alternating row colors
        if (rowIndex % 2 === 0) {
            doc.rect(50, y, doc.page.width - 100, 20).fill('#f0f9ff');
        }

        doc.fontSize(9).fillColor('#000000');
        row.forEach((cell, i) => {
            doc.text(String(cell || '-'), 55 + (i * colWidth), y + 5, { width: colWidth - 10, align: 'left' });
        });

        y += 20;
    });

    return y;
}

// Generate Student Report
router.post('/students', async (req, res) => {
    try {
        const [students] = await db.promise().query('SELECT * FROM students ORDER BY name');

        const timestamp = Date.now();
        const fileName = `students_report_${timestamp}.pdf`;
        const filePath = path.join(REPORTS_DIR, fileName);

        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Header
        addHeader(doc, 'Students Report', 'Madarsa Imdadul Uloom - Complete Student List');

        // Summary box
        doc.rect(50, doc.y, doc.page.width - 100, 60).fill('#e0f2fe');
        doc.fontSize(14).fillColor('#0891b2').text(`Total Students: ${students.length}`, 70, doc.y + 20);
        doc.fontSize(10).fillColor('#0369a1').text(`Active Students: ${students.filter(s => s.status === 'Active').length}`, 70, doc.y + 40);
        doc.moveDown(4);

        // Table
        const headers = ['ID', 'Name', 'Class', 'Parent', 'Contact', 'Status'];
        const rows = students.map(s => [s.id, s.name, s.class, s.parent, s.contact, s.status]);

        createTable(doc, headers, rows);

        // Footer
        addFooter(doc, 1);

        doc.end();

        stream.on('finish', () => {
            console.log(`✅ Students report generated: ${fileName}`);
            res.json({
                success: true,
                message: 'Students report generated',
                report: { fileUrl: `/uploads/reports/${fileName}` }
            });
        });

        stream.on('error', err => {
            console.error('❌ Stream error:', err);
            res.status(500).json({ success: false, message: err.message });
        });
    } catch (err) {
        console.error('❌ Generate students report error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// Generate Teacher Report
router.post('/teachers', async (req, res) => {
    try {
        const [teachers] = await db.promise().query('SELECT * FROM teachers ORDER BY name');

        const timestamp = Date.now();
        const fileName = `teachers_report_${timestamp}.pdf`;
        const filePath = path.join(REPORTS_DIR, fileName);

        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Header
        addHeader(doc, 'Teachers Report', 'Madarsa Imdadul Uloom - Complete Teacher List');

        // Summary box
        doc.rect(50, doc.y, doc.page.width - 100, 60).fill('#d1fae5');
        doc.fontSize(14).fillColor('#059669').text(`Total Teachers: ${teachers.length}`, 70, doc.y + 20);
        doc.fontSize(10).fillColor('#047857').text(`Active Teachers: ${teachers.filter(t => t.status === 'Active').length}`, 70, doc.y + 40);
        doc.moveDown(4);

        // Table
        const headers = ['ID', 'Name', 'Subject', 'Contact', 'Status'];
        const rows = teachers.map(t => [t.id, t.name, t.subject, t.contact, t.status]);

        createTable(doc, headers, rows);

        // Footer
        addFooter(doc, 1);

        doc.end();

        stream.on('finish', () => {
            console.log(`✅ Teachers report generated: ${fileName}`);
            res.json({
                success: true,
                message: 'Teachers report generated',
                report: { fileUrl: `/uploads/reports/${fileName}` }
            });
        });

        stream.on('error', err => {
            console.error('❌ Stream error:', err);
            res.status(500).json({ success: false, message: err.message });
        });
    } catch (err) {
        console.error('❌ Generate teachers report error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// Generate Finance Report
router.post('/finance', async (req, res) => {
    try {
        const [transactions] = await db.promise().query(
            'SELECT * FROM finance_transactions ORDER BY date DESC LIMIT 100'
        );

        const timestamp = Date.now();
        const fileName = `finance_report_${timestamp}.pdf`;
        const filePath = path.join(REPORTS_DIR, fileName);

        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Header
        addHeader(doc, 'Financial Report', 'Madarsa Imdadul Uloom - Income & Expense Summary');

        // Calculate totals
        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
        const totalExpense = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
        const balance = totalIncome - totalExpense;

        // Summary boxes
        const boxWidth = (doc.page.width - 140) / 3;

        // Income box
        doc.rect(50, doc.y, boxWidth, 60).fill('#d1fae5');
        doc.fontSize(10).fillColor('#047857').text('Total Income', 60, doc.y + 15);
        doc.fontSize(16).fillColor('#059669').text(`₹${totalIncome.toFixed(2)}`, 60, doc.y + 35);

        // Expense box
        doc.rect(70 + boxWidth, doc.y - 60, boxWidth, 60).fill('#fee2e2');
        doc.fontSize(10).fillColor('#b91c1c').text('Total Expense', 80 + boxWidth, doc.y - 45);
        doc.fontSize(16).fillColor('#dc2626').text(`₹${totalExpense.toFixed(2)}`, 80 + boxWidth, doc.y - 25);

        // Balance box
        doc.rect(90 + (boxWidth * 2), doc.y - 60, boxWidth, 60).fill('#dbeafe');
        doc.fontSize(10).fillColor('#1e40af').text('Net Balance', 100 + (boxWidth * 2), doc.y - 45);
        doc.fontSize(16).fillColor('#2563eb').text(`₹${balance.toFixed(2)}`, 100 + (boxWidth * 2), doc.y - 25);

        doc.moveDown(4);

        // Table
        const headers = ['Date', 'Type', 'Category', 'Description', 'Amount'];
        const rows = transactions.map(t => [
            new Date(t.date).toLocaleDateString(),
            t.type,
            t.category,
            t.description,
            `₹${parseFloat(t.amount || 0).toFixed(2)}`
        ]);

        createTable(doc, headers, rows);

        // Footer
        addFooter(doc, 1);

        doc.end();

        stream.on('finish', () => {
            console.log(`✅ Finance report generated: ${fileName}`);
            res.json({
                success: true,
                message: 'Finance report generated',
                report: { fileUrl: `/uploads/reports/${fileName}` }
            });
        });

        stream.on('error', err => {
            console.error('❌ Stream error:', err);
            res.status(500).json({ success: false, message: err.message });
        });
    } catch (err) {
        console.error('❌ Generate finance report error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
