require('dotenv').config();
const axios = require('axios');

const HUGGINGFACE_API_TOKEN = process.env.HUGGINGFACE_API_TOKEN;// get it from huggingface.co
const NER_MODEL_URL = 'https://api-inference.huggingface.co/models/dslim/bert-base-NER';

exports.extractMedicinesWithNER = async (text) => {
  try {
    const response = await axios.post(
      NER_MODEL_URL,
      { inputs: text },
      {
        headers: {
          Authorization: `Bearer ${HUGGINGFACE_API_TOKEN}`,
        },
      }
    );

    const entities = response.data;

    // Filter entities by relevant types (like "DRUG" or "MISC" or "B-MED" depending on model used)
    const medicines = entities
      .filter((item) => item.entity_group === 'ORG' || item.entity_group === 'MISC' || item.entity_group === 'PER') // or customize
      .map((item) => item.word);

    return medicines;
  } catch (err) {
    console.error('NER API failed:', err.message);
    return [];
  }
};
