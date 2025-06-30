// server/routes/SymptomCheckerRoutes.js
const express = require('express');
const router = express.Router();
const { identifyDisease } = require('../utils/aiDiseaseIdentifier'); // Correct import path for the utility function

// POST endpoint to identify diseases based on symptoms
router.post('/identify', async (req, res) => {
  const { symptoms } = req.body; // Expect an array of symptoms from the request body
  console.log('Backend: Received POST /symptom-checker/identify with symptoms:', symptoms);

  // Basic validation to ensure symptoms are provided and are an array
  if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
    return res.status(400).json({ message: 'Symptoms array is required' });
  }

  try {
    // Call the AI utility function to identify diseases
    const result = await identifyDisease(symptoms);
    // Send the result back as a JSON object
    res.json({ result });
  } catch (error) {
    // Log and send a 500 error if something goes wrong during identification
    console.error('Backend: Error in /symptom-checker/identify:', error);
    res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
});

module.exports = router;
