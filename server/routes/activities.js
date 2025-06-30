// backend/routes/activities.js
const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');

// GET all activities for a specific user
router.get('/:userId', async (req, res) => {
  try {
    const activities = await Activity.find({ userId: req.params.userId }).sort({ date: 1 });
    res.json(activities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching activities.' });
  }
});

// POST a new activity entry
router.post('/', async (req, res) => {
  const { userId, date, steps, activeMinutes, caloriesBurned, activityType } = req.body;

  try {
    const newActivity = new Activity({
      userId,
      date: date || Date.now(),
      steps,
      activeMinutes,
      caloriesBurned,
      activityType,
    });

    const savedActivity = await newActivity.save();
    res.status(201).json(savedActivity);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message || 'Error saving activity.' });
  }
});

// DELETE an activity entry by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedActivity = await Activity.findByIdAndDelete(req.params.id);
    if (!deletedActivity) {
      return res.status(404).json({ message: 'Activity entry not found.' });
    }
    res.json({ message: 'Activity entry deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting activity.' });
  }
});

module.exports = router;