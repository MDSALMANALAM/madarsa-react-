const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');
const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads/library');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'material-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed!'), false);
        }
    }
});

// Get all materials
router.get('/materials', async (req, res) => {
    try {
        const [materials] = await db.promise().query(
            'SELECT * FROM materials WHERE is_active = 1 ORDER BY created_at DESC'
        );
        
        console.log(`📚 Library materials loaded: ${materials.length} materials`);
        
        res.json({
            success: true,
            materials: materials
        });
    } catch (error) {
        console.error('❌ Error loading materials:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Upload new material
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const { title, description, category, class_level, uploaded_by } = req.body;
        
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'File is required'
            });
        }
        
        const fileSize = (req.file.size / (1024 * 1024)).toFixed(2) + ' MB';
        const filePath = `/uploads/library/${req.file.filename}`;
        
        const [result] = await db.promise().query(
            `INSERT INTO materials (title, description, category, class_level, file_path, file_size, file_type, uploaded_by) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, description || '', category, class_level, filePath, fileSize, 'PDF', uploaded_by || 'Admin']
        );
        
        console.log(`✅ Material uploaded: ${title} (ID: ${result.insertId})`);
        
        res.status(201).json({
            success: true,
            message: 'Material uploaded successfully',
            material: {
                id: result.insertId,
                title,
                category,
                class_level,
                file_path: filePath
            }
        });
    } catch (error) {
        console.error('❌ Error uploading material:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Download material
router.get('/download/:id', async (req, res) => {
    try {
        const [materials] = await db.promise().query(
            'SELECT * FROM materials WHERE id = ?',
            [req.params.id]
        );
        
        if (materials.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Material not found'
            });
        }
        
        const material = materials[0];
        const filePath = path.join(__dirname, '../..', material.file_path);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'File not found on server'
            });
        }
        
        res.download(filePath, `${material.title}.pdf`);
        
        console.log(`📥 Material downloaded: ${material.title}`);
    } catch (error) {
        console.error('❌ Error downloading material:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Increment download count
router.post('/download/:id/count', async (req, res) => {
    try {
        await db.promise().query(
            'UPDATE materials SET download_count = download_count + 1 WHERE id = ?',
            [req.params.id]
        );

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete material
router.delete('/materials/:id', async (req, res) => {
    try {
        await db.promise().query(
            'UPDATE materials SET is_active = 0 WHERE id = ?',
            [req.params.id]
        );

        console.log(`🗑️ Material deleted: ID ${req.params.id}`);

        res.json({
            success: true,
            message: 'Material deleted successfully'
        });
    } catch (error) {
        console.error('❌ Error deleting material:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;

