const express = require('express');
const Course = require('../models/Course');
const router = express.Router();

// Get all courses
router.get('/', async (req, res) => {
    try {
        const { category, class_level } = req.query;
        let filter = {};
        
        if (category) filter.category = category;
        if (class_level) filter.class_level = class_level;
        
        const courses = await Course.find(filter).sort({ class_level: 1 });
        
        res.json({
            success: true,
            data: courses,
            count: courses.length
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Get course by ID
router.get('/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }
        
        res.json({
            success: true,
            data: course
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Create new course (Admin only)
router.post('/', async (req, res) => {
    try {
        const course = await Course.create(req.body);
        
        res.status(201).json({
            success: true,
            data: course
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Update course
router.put('/:id', async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }
        
        res.json({
            success: true,
            data: course
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Delete course
router.delete('/:id', async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);
        
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Course deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Get courses by class level
router.get('/class/:level', async (req, res) => {
    try {
        const courses = await Course.find({ 
            class_level: req.params.level,
            isActive: true 
        }).sort({ name: 1 });
        
        res.json({
            success: true,
            data: courses,
            count: courses.length
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

module.exports = router;