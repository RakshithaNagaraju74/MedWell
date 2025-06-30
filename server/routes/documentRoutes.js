const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Node.js file system module

const documentController = require('../controllers/documentController');

const router = express.Router();

// Ensure the uploads directory exists
const UPLOAD_DIRECTORY = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(UPLOAD_DIRECTORY)) {
    fs.mkdirSync(UPLOAD_DIRECTORY, { recursive: true });
}

// Configure Multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIRECTORY); // Files will be stored in the 'uploads' directory
  },
  filename: (req, file, cb) => {
    // Create a unique filename to prevent collisions
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to allow only images and PDFs
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and PDF files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB file size limit, matching frontend comment
});

// POST /api/documents/upload - Upload a single document
router.post('/upload', upload.single('document'), documentController.uploadDocument);

// GET /api/documents/:userId - Get all documents for a specific user
router.get('/:userId', documentController.getDocuments);

// DELETE /api/documents/:id - Delete a specific document
router.delete('/:id', documentController.deleteDocument);

module.exports = router;