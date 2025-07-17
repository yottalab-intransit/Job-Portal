const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_PATH || 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const { type } = req.body;
    let folder = 'misc';
    
    switch (type) {
      case 'resume':
        folder = 'resumes';
        break;
      case 'avatar':
        folder = 'avatars';
        break;
      case 'company-logo':
        folder = 'company-logos';
        break;
      case 'cover-image':
        folder = 'cover-images';
        break;
    }
    
    const fullPath = path.join(uploadDir, folder);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
    
    cb(null, fullPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `${req.user._id}-${uniqueSuffix}${extension}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Allowed types: ' + allowedTypes.join(', ')), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
  },
  fileFilter: fileFilter
});

// @route   POST /api/upload
// @desc    Upload file
// @access  Private
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { type } = req.body;
    
    if (!type) {
      return res.status(400).json({
        success: false,
        message: 'File type is required'
      });
    }

    const fileUrl = `/uploads/${path.basename(path.dirname(req.file.path))}/${req.file.filename}`;

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: fileUrl,
        type: type
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during file upload',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   DELETE /api/upload/:filename
// @desc    Delete uploaded file
// @access  Private
router.delete('/:filename', auth, async (req, res) => {
  try {
    const { filename } = req.params;
    const { type } = req.query;

    if (!type) {
      return res.status(400).json({
        success: false,
        message: 'File type is required'
      });
    }

    let folder = 'misc';
    switch (type) {
      case 'resume':
        folder = 'resumes';
        break;
      case 'avatar':
        folder = 'avatars';
        break;
      case 'company-logo':
        folder = 'company-logos';
        break;
      case 'cover-image':
        folder = 'cover-images';
        break;
    }

    const filePath = path.join(uploadDir, folder, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Check if user owns the file (filename should start with user ID)
    if (!filename.startsWith(req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this file'
      });
    }

    // Delete the file
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during file deletion',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/upload/types
// @desc    Get allowed file types and limits
// @access  Public
router.get('/types', (req, res) => {
  try {
    const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf'
    ];

    const maxFileSize = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024;

    res.json({
      success: true,
      data: {
        allowedTypes,
        maxFileSize,
        maxFileSizeMB: Math.round(maxFileSize / (1024 * 1024))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching upload info',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;