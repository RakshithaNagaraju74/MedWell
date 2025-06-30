// utils/preprocessImage.js
const sharp = require('sharp');

async function preprocessImage(inputPath, outputPath) {
  try {
    await sharp(inputPath)
      .grayscale()               // Convert to black & white
      .normalize()               // Enhance contrast
      .resize({ width: 1200 })   // Resize for clarity
      .toFile(outputPath);
  } catch (err) {
    console.error('Image preprocessing error:', err);
    throw new Error('Image preprocessing failed');
  }
}

module.exports = { preprocessImage };
