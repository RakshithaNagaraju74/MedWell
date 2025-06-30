// utils/ocrUtils.js
const tesseract = require('tesseract.js');

async function sendToOCR(imagePath) {
  try {
    const result = await tesseract.recognize(imagePath, 'eng', {
      logger: m => console.log(m), // Logs progress
    });
    return result.data.text;
  } catch (err) {
    console.error('Tesseract OCR error:', err);
    throw new Error('Tesseract failed to extract text');
  }
}

module.exports = { sendToOCR };
