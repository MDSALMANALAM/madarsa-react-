const express = require('express');
const multer = require('multer');
const path = require('path');
const Material = require('../models/Material');
const auth = require('../middleware/auth');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/materials/');
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
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/png',
            'video/mp4'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, Word, Images and Videos are allowed!'), false);
        }
    }
});

// Get all materials with filtering
router.get('/', async (req, res) => {
    try {
        const { category, class_level, search } = req.query;
        let filter = { isActive: true };
        
        if (category && category !== 'all') filter.category = category;
        if (class_level && class_level !== 'all') filter.class_level = class_level;
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        const materials = await Material.find(filter)
            .populate('uploaded_by', 'name email')
            .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            data: materials,
            count: materials.length
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Get material by ID
router.get('/:id', async (req, res) => {
    try {
        const material = await Material.findById(req.params.id)
            .populate('uploaded_by', 'name email');
        
        if (!material) {
            return res.status(404).json({
                success: false,
                message: 'Material not found'
            });
        }
        
        // Increment download count
        material.download_count += 1;
        await material.save();
        
        res.json({
            success: true,
            data: material
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Upload new material
router.post('/upload', auth, upload.single('file'), async (req, res) => {
    try {
        const { title, description, category, class_level } = req.body;
        
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'File is required'
            });
        }
        
        const material = await Material.create({
            title,
            description,
            category,
            class_level: class_level || 'all',
            file_path: req.file.path,
            file_size: (req.file.size / (1024 * 1024)).toFixed(2) + ' MB',
            file_type: req.file.mimetype,
            uploaded_by: req.userId
        });
        
        res.status(201).json({
            success: true,
            data: material,
            message: 'Material uploaded successfully'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Update material
router.put('/:id', auth, async (req, res) => {
    try {
        const material = await Material.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!material) {
            return res.status(404).json({
                success: false,
                message: 'Material not found'
            });
        }
        
        res.json({
            success: true,
            data: material,
            message: 'Material updated successfully'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Delete material
router.delete('/:id', auth, async (req, res) => {
    try {
        const material = await Material.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );
        
        if (!material) {
            return res.status(404).json({
                success: false,
                message: 'Material not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Material deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Download material
router.get('/:id/download', async (req, res) => {
    try {
        const material = await Material.findById(req.params.id);
        
        if (!material) {
            return res.status(404).json({
                success: false,
                message: 'Material not found'
            });
        }
        
        // Increment download count
        material.download_count += 1;
        await material.save();
        
        res.download(material.file_path);
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

module.exports = router;