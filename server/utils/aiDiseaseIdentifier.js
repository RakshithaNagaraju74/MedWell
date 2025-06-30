const axios = require('axios');

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Function to list available models for your API key
async function listModels() {
  try {
    const response = await axios.get('https://api.groq.com/openai/v1/models', {
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
    });
    console.log('Available models:', response.data);
  } catch (err) {
    console.error('Error fetching models:', err.response?.data || err.message);
  }
}

// Run this once to see your available models
// listModels();

async function identifyDisease(symptoms) {
  const messages = [
    {
      role: "system",
      content: "You are a medical expert AI assistant."
    },
    {
      role: "user",
      content: `Given the following symptoms: ${symptoms.join(', ')}, identify possible diseases and explain briefly.\n\nResponse format:\n- Disease Name: Short description\n- Disease Name: Short description`
    }
  ];

  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: "llama3-8b-8192", // <-- Replace with a model name you have access to from listModels()
        messages: messages,
        max_tokens: 100,
        temperature: 0.5,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
      }
    );

    const completion = response.data.choices[0].message.content.trim();
    return completion;
  } catch (error) {
    console.error('Error calling Groq API:', error.response?.data || error.message);
    throw new Error('Failed to identify disease');
  }
}

module.exports = { identifyDisease, listModels };
