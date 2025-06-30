const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { identifyMedicine } = require('../utils/medicineIdentifier');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const result = await identifyMedicine(req.file.path);

    fs.unlink(req.file.path, () => {}); // clean up
    res.json(result);
  } catch (err) {
    console.error('❌ Route error:', err.message);
    res.status(500).json({ error: 'Failed to process image' });
  }
});

module.exports = router;
