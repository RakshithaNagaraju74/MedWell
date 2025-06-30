// backend/routes/sleeps.js
const express = require('express');
const router = express.Router();
const Sleep = require('../models/Sleep');

// GET all sleep entries for a specific user
router.get('/:userId', async (req, res) => {
  try {
    const sleeps = await Sleep.find({ userId: req.params.userId }).sort({ date: 1 });
    res.json(sleeps);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching sleep entries.' });
  }
});

// POST a new sleep entry
router.post('/', async (req, res) => {
  const { userId, date, durationHours, deepSleepHours, lightSleepHours, remSleepHours, qualityRating, notes } = req.body;

  try {
    const newSleep = new Sleep({
      userId,
      date: date || Date.now(),
      durationHours,
      deepSleepHours,
      lightSleepHours,
      remSleepHours,
      qualityRating,
      notes,
    });

    const savedSleep = await newSleep.save();
    res.status(201).json(savedSleep);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message || 'Error saving sleep entry.' });
  }
});

// DELETE a sleep entry by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedSleep = await Sleep.findByIdAndDelete(req.params.id);
    if (!deletedSleep) {
      return res.status(404).json({ message: 'Sleep entry not found.' });
    }
    res.json({ message: 'Sleep entry deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting sleep entry.' });
  }
});

module.exports = router;