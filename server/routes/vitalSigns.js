// backend/routes/vitalSigns.js
const express = require('express');
const router = express.Router();
const VitalSign = require('../models/VitalSign');

// GET all vital signs for a specific user
router.get('/:userId', async (req, res) => {
  try {
    const vitalSigns = await VitalSign.find({ userId: req.params.userId }).sort({ date: 1 });
    res.json(vitalSigns);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching vital signs.' });
  }
});

// POST a new vital sign entry
router.post('/', async (req, res) => {
  const { userId, type, value, systolic, diastolic, unit, date, notes } = req.body;

  try {
    const newVitalSign = new VitalSign({
      userId,
      type,
      value: type !== 'bloodPressure' ? value : undefined,
      systolic: type === 'bloodPressure' ? systolic : undefined,
      diastolic: type === 'bloodPressure' ? diastolic : undefined,
      unit,
      date: date || Date.now(), // Allow specifying date, default to now
      notes,
    });

    const savedVitalSign = await newVitalSign.save();
    res.status(201).json(savedVitalSign);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message || 'Error saving vital sign.' });
  }
});

// DELETE a vital sign entry by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedVitalSign = await VitalSign.findByIdAndDelete(req.params.id);
    if (!deletedVitalSign) {
      return res.status(404).json({ message: 'Vital sign entry not found.' });
    }
    res.json({ message: 'Vital sign entry deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting vital sign.' });
  }
});

module.exports = router;