const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { preprocessImage } = require('../utils/preprocessImage');
const { sendToOCR } = require('../utils/ocrUtils');
const { correctPrescription } = require('../utils/llmCorrection');

const router = express.Router();

// Multer setup for image upload
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now().toString(16) + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Upload endpoint: preprocess image, OCR, then use Groq LLM to correct prescription text
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

    const rawImagePath = req.file.path;
    const processedImagePath = `uploads/processed-${req.file.filename}.png`;

    // Preprocess the uploaded image
    await preprocessImage(rawImagePath, processedImagePath);

    // Extract text from preprocessed image
    const extractedText = await sendToOCR(processedImagePath);

    // Cleanup temporary files
    fs.unlinkSync(rawImagePath);
    fs.unlinkSync(processedImagePath);

    // Use Groq API LLM to correct the extracted prescription text
    const digitalPrescription = await correctPrescription(extractedText);

    res.json({
      originalText: extractedText.trim(),
      digitalPrescription,
    });
  } catch (error) {
    console.error('Error in /upload:', error);
    res.status(500).json({
      error: 'Failed to extract and process text',
      details: error.message || 'Unknown error',
    });
  }
});

module.exports = router;
