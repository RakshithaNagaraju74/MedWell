const Prescription = require('../models/Prescription');
const { extractTextFromImage } = require('../utils/ocrUtils');
const axios = require('axios');

const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models/facebook/bart-large-cnn'; // summarization model
const HUGGINGFACE_API_TOKEN = process.env.HUGGINGFACE_API_TOKEN;
const HUGGINGFACE_NER_API = 'https://api-inference.huggingface.co/models/dslim/bert-base-NER';
async function callHuggingFaceAPI(inputText) {
  try {
    const response = await axios.post(
      HUGGINGFACE_API_URL,
      { inputs: inputText },
      {
        headers: { Authorization: `Bearer ${HUGGINGFACE_API_TOKEN}` },
      }
    );
    if (response.data && response.data[0] && response.data[0].summary_text) {
      return response.data[0].summary_text;
    } else {
      return inputText; // fallback
    }
  } catch (error) {
    console.error('Hugging Face API error:', error.response?.data || error.message);
    return inputText; // fallback on error
  }
}
async function extractMedicinesWithNER(text) {
  try {
    const response = await axios.post(
      HUGGINGFACE_NER_API,
      { inputs: text },
      {
        headers: {
          Authorization: `Bearer ${HUGGINGFACE_API_TOKEN}`,
        },
      }
    );

    // Parse entities
    const predictions = response.data;
    const medicineCandidates = predictions
      .filter(item => item.entity_group === 'MISC' || item.entity_group === 'ORG') // adjust as needed
      .map(item => item.word)
      .filter(word => /^[A-Za-z]/.test(word) && word.length <= 40);

    // Remove duplicates and subwords
    const cleanList = Array.from(new Set(medicineCandidates.map(w => w.replace(/^##/, ''))));

    return cleanList;
  } catch (error) {
    console.error('NER API error:', error.response?.data || error.message);
    return []; // fallback on error
  }
}
exports.handleUpload = async (req, res) => {
  const { imageUrl } = req.body;
  if (!imageUrl) return res.status(400).json({ error: 'Missing image URL' });

  try {
    const rawText = await extractTextFromImage(imageUrl);
    const cleanedText = await callHuggingFaceAPI(rawText); // optional summarization

    const medicines = await extractMedicinesWithNER(cleanedText);

    const prescription = new Prescription({
      imageUrl,
      extractedText: cleanedText,
      medicines,
    });

    await prescription.save();

    res.json({ success: true, prescription });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI extraction failed' });
  }
};

// Keep your existing extractMedicines or improve it
function extractMedicines(text) {
  const lines = text.split('\n').map(line => line.trim());
  return lines.filter(line => /^[A-Za-z]/.test(line) && line.length < 40);
}
