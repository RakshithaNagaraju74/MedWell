const Document = require('../models/Document');
const fs = require('fs');
const path = require('path');

const UPLOAD_DIRECTORY = process.env.UPLOAD_PATH || './uploads';

// @desc    Upload a new document
// @route   POST /api/documents/upload
// @access  Public (implement authentication later)
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const { userId, documentType, documentDate, documentTitle } = req.body;

    // Basic validation for required fields from frontend
    if (!userId || !documentType || !documentTitle.trim()) {
      // If validation fails, delete the uploaded file to prevent orphans
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting orphaned file:', err);
      });
      return res.status(400).json({ message: 'Missing required fields: userId, documentType, documentTitle.' });
    }

    // Prepare document data for MongoDB
    const newDocument = new Document({
      userId,
      originalName: req.file.originalname,
      fileName: req.file.filename,
      filePath: `/uploads/${req.file.filename}`, // Path accessible from frontend
      documentTitle,
      documentType,
      documentDate: documentDate ? new Date(documentDate) : undefined, // Convert to Date object, handle optional
      fileMimeType: req.file.mimetype
    });

    await newDocument.save();

    res.status(201).json({
      message: 'Document uploaded successfully',
      document: newDocument // Send back the saved document data
    });

  } catch (error) {
    console.error('Error in uploadDocument:', error);
    // If an error occurs after file upload but before DB save, delete the file
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting partially processed file:', err);
      });
    }
    res.status(500).json({ message: 'Server error during document upload.' });
  }
};

// @desc    Get all documents for a specific user
// @route   GET /api/documents/:userId
// @access  Public (implement authentication later)
exports.getDocuments = async (req, res) => {
  try {
    const { userId } = req.params;
    // Sort by documentType alphabetically (asc) then by documentDate (desc for most recent first)
    const documents = await Document.find({ userId }).sort({ documentType: 1, documentDate: -1 });
    res.status(200).json({ documents });
  } catch (error) {
    console.error('Error in getDocuments:', error);
    res.status(500).json({ message: 'Server error fetching documents.' });
  }
};

// @desc    Delete a document
// @route   DELETE /api/documents/:id
// @access  Public (implement authentication later)
exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found.' });
    }

    // Optional: Add authorization check here (e.g., ensure document.userId === req.user.id)

    // Delete the file from the file system first
    const filePath = path.join(__dirname, '..', UPLOAD_DIRECTORY, document.fileName);
    fs.unlink(filePath, async (err) => {
      if (err) {
        console.error('Error deleting file from disk:', err);
        // Decide if you want to proceed with DB deletion even if file delete fails
        // For robustness, often you'd still remove DB entry to prevent broken links
      }

      // Then delete the document from the database
      await Document.findByIdAndDelete(id);
      res.status(200).json({ message: 'Document deleted successfully.' });
    });

  } catch (error) {
    console.error('Error in deleteDocument:', error);
    res.status(500).json({ message: 'Server error during document deletion.' });
  }
};