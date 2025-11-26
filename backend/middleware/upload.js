const multer = require('multer');
const path = require('path');

// Generic file upload configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadPath = 'uploads/general/';
        
        if (file.fieldname === 'studentPhoto') {
            uploadPath = 'uploads/students/photos/';
        } else if (file.fieldname === 'materialFile') {
            uploadPath = 'uploads/materials/';
        } else if (file.fieldname === 'receipt') {
            uploadPath = 'uploads/finance/receipts/';
        }
        
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Allow images, PDFs, documents, and videos
    if (file.mimetype.startsWith('image/') || 
        file.mimetype === 'application/pdf' ||
        file.mimetype === 'application/msword' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.mimetype.startsWith('video/')) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images, PDFs, documents, and videos are allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Error handling middleware for multer
const handleUploadErrors = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File too large. Maximum size is 10MB.'
            });
        }
    } else if (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
    next();
};

module.exports = { upload, handleUploadErrors };