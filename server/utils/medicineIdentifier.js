require('dotenv').config();
const axios = require('axios');
const sharp = require('sharp');
const Tesseract = require('tesseract.js');

// 1. OCR using Tesseract + Sharp
async function extractTextFromImage(imagePath) {
  const buffer = await sharp(imagePath)
    .resize(512)
    .grayscale()
    .threshold(150)
    .toBuffer();

  const { data: { text } } = await Tesseract.recognize(buffer, 'eng');
  console.log('🔍 OCR Extracted Text:', text.trim());
  return text.trim();
}

// 2. Extract likely medicine name(s) for focused correction
function extractMedicineCandidates(text) {
  const lines = text.split('\n');
  const candidates = lines
    .filter(line =>
      /para|mol|met|tablet|cap|500|[A-Za-z]{6,}/i.test(line) &&
      !line.match(/^\d+$/)
    )
    .map(line => line.replace(/[^a-zA-Z0-9\- ]/g, '').trim());

  const joined = candidates.join(' ');
  console.log('🔎 Likely Medicine Candidate:', joined);
  return joined;
}

// 3. Spell-correct using Groq AI
async function correctMedicineSpelling(text) {
  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama3-8b-8192',
        messages: [
          { role: 'system', content: 'You are a medical language expert.' },
          {
            role: 'user',
            content: `The following text was extracted from a prescription or label and may contain spelling mistakes:\n\n"${text}"\n\nCorrect any misspelled medicine names and return ONLY the corrected version of the text. Do not add any explanations or formatting.`
          }
        ],
        temperature: 0.2,
        max_tokens: 200
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const corrected = response.data.choices?.[0]?.message?.content?.trim();
    console.log('✅ Corrected Text:', corrected);
    return corrected || text;
  } catch (error) {
    console.error('⚠️ Spelling Correction Failed:', error.message);
    return text; // fallback
  }
}

// 4. Ask Groq for medicine info
async function queryGroqForMedicineInfo(extractedText) {
  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama3-8b-8192',
        messages: [
          { role: 'system', content: 'You are a medical expert AI.' },
          {
            role: 'user',
            content: `This text was extracted from a medicine label or pill imprint:\n\n"${extractedText}"\n\nBased on this, return ONLY the medicine name and its uses in a short bullet list. Do NOT include explanations or reasoning. Format it like this:\n\nMedicine Name: <name>\nUses:\n- <use 1>\n- <use 2>`
          }
        ],
        temperature: 0.2,
        max_tokens: 300
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.choices?.[0]?.message?.content || 'No information found.';
    return {
      source: 'Groq AI',
      caption: `Extracted Text: ${extractedText}`,
      usage: content,
      image: null
    };
  } catch (err) {
    console.error('❌ Groq API Error:', err.message);
    return {
      source: 'Groq Error',
      caption: extractedText,
      usage: 'Failed to identify medicine information.',
      image: null
    };
  }
}

// 5. Full pipeline: OCR → Filter → Correct → Info
async function identifyMedicine(imagePath) {
  const extractedText = await extractTextFromImage(imagePath);

  if (!extractedText) {
    return {
      source: 'OCR',
      caption: 'No readable text found in the image.',
      usage: 'Please try with a clearer image.',
      image: null
    };
  }

  const medicineText = extractMedicineCandidates(extractedText);
  const correctedText = await correctMedicineSpelling(medicineText);
  return await queryGroqForMedicineInfo(correctedText);
}

module.exports = { identifyMedicine };
