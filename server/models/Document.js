const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  // Assuming a simple string userId for now. In a real app, this might be a Mongoose.Types.ObjectId referencing a User model.
  userId: {
    type: String,
    required: true,
    index: true // Index for faster queries by user
  },
  originalName: { // The name of the file as uploaded by the user
    type: String,
    required: true
  },
  fileName: { // The unique name given to the file on the server
    type: String,
    required: true,
    unique: true
  },
  filePath: { // The URL/path to access the stored file
    type: String,
    required: true
  },
  documentTitle: { // The user-entered title for the document
    type: String,
    required: true
  },
  documentType: {
    type: String,
    required: true,
    enum: ['prescription', 'report', 'medication', 'other'] // Matching frontend types
  },
  documentDate: { // The date associated with the document (e.g., date of report)
    type: Date,
    required: false // It was optional in your frontend, so keep it optional here
  },
  uploadDate: { // When the document was uploaded to the system
    type: Date,
    default: Date.now
  },
  fileMimeType: { // Store the file's MIME type for rendering/previewing
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Document', documentSchema);