require('dotenv').config(); // ✅ Load env variables from .env
const axios = require('axios');

const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
  throw new Error('GROQ_API_KEY environment variable not set');
}

async function correctPrescription(ocrText) {
  const prompt = `
  You are a medical assistant.

Below is OCR-extracted text from a handwritten prescription. Please:

1. Correct only **clear spelling mistakes** in medicine names. Do NOT replace them with unrelated or inferred drug names.
2. Do NOT substitute brand names with generics unless the original name is clearly misspelled.
3. For each medicine, extract the following fields:
   - Medicine Name
   - Dosage (e.g., 100 mg)
   - Quantity (e.g., 1 tab, 2 tabs)
   - Frequency (e.g., BID, TID, QD)
   - Purpose (what it is commonly prescribed for)

❗Return only the cleaned and structured output in the format below. Do not include explanations or extra text.

Prescription text:
${ocrText}

Output format:
- Medicine Name: ...
  Dosage: ...
  Quantity: ...
  Frequency: ...
  Purpose: ...
  `;


  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: "llama3-8b-8192",
        messages: [
          { role: "system", content: "You are a helpful medical assistant." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 500,
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const cleanedText = response.data.choices[0].message.content.trim();
    return cleanedText.split('\n').filter(line => line.trim().length > 0);

  } catch (error) {
    console.error('Error calling Groq API:', error.response?.data || error.message);
    throw new Error('Failed to get corrected prescription from Groq API');
  }
}

module.exports = { correctPrescription };
