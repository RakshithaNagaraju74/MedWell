// backend/routes/symptoms.js
const express = require('express');
const router = express.Router();
const Symptom = require('../models/Symptom');

// GET all symptoms for a specific user
router.get('/:userId', async (req, res) => {
  try {
    const symptoms = await Symptom.find({ userId: req.params.userId }).sort({ date: 1 });
    res.json(symptoms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching symptoms.' });
  }
});

// POST a new symptom entry
router.post('/', async (req, res) => {
  const { userId, name, intensity, date, notes } = req.body;

  try {
    const newSymptom = new Symptom({
      userId,
      name,
      intensity,
      date: date || Date.now(),
      notes,
    });

    const savedSymptom = await newSymptom.save();
    res.status(201).json(savedSymptom);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message || 'Error saving symptom.' });
  }
});

// DELETE a symptom entry by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedSymptom = await Symptom.findByIdAndDelete(req.params.id);
    if (!deletedSymptom) {
      return res.status(404).json({ message: 'Symptom entry not found.' });
    }
    res.json({ message: 'Symptom entry deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting symptom.' });
  }
});

module.exports = router;