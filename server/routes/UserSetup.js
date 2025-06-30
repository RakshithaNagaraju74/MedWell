// routes/UserSetup.js
const express = require('express');
const router = express.Router();
const UserProfile = require('../models/UserProfile'); // Ensure this path is correct

// POST/PUT user profile (create or update)
router.post('/profile', async (req, res) => {
  console.log('Backend: Received POST /api/user/profile with body:', req.body);

  // Extract all required fields from the request body
  const { userId, name, email, age, gender, weight, heartRate, sleepHours, activeHours } = req.body;

  // Validate essential fields for profile creation/update
  if (!userId || !name || !email) {
    console.log('Backend: Missing userId, name, or email in request body');
    return res.status(400).json({ message: 'userId, name, and email are required for profile setup' });
  }

  try {
    // Use findOneAndUpdate with upsert: true to either find and update, or create if not found
    const updatedProfile = await UserProfile.findOneAndUpdate(
      { userId }, // Query to find the user
      { // Fields to set/update
        name,
        email,
        age: Number(age), // Ensure numbers are cast
        gender,
        weight: Number(weight),
        heartRate: Number(heartRate),
        sleepHours: Number(sleepHours),
        activeHours: Number(activeHours),
        updatedAt: Date.now() // Manually update updatedAt for consistency, though pre-save hook handles it
      },
      {
        new: true, // Return the updated document
        upsert: true, // Create a new document if no document matches the query
        setDefaultsOnInsert: true // Apply schema defaults when creating new document
      }
    );

    console.log('Backend: Profile saved/updated successfully:', updatedProfile);
    res.status(200).json(updatedProfile); // Send back the complete updated profile
  } catch (err) {
    console.error('Backend: Error saving profile:', err);
    // Send a more descriptive error message from Mongoose validation if available
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message, errors: err.errors });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET user profile by userId
router.get('/profile', async (req, res) => {
  console.log('Backend: GET /api/user/profile called with query:', req.query);
  const { userId } = req.query;
  if (!userId) {
    console.log('Backend: Missing userId query parameter');
    return res.status(400).json({ message: 'userId query parameter is required' });
  }

  try {
    const profile = await UserProfile.findOne({ userId });
    if (!profile) {
      console.log('Backend: Profile not found for userId:', userId);
      return res.status(404).json({ message: 'Profile not found' });
    }
    console.log('Backend: Profile found:', profile);
    res.json(profile);
  } catch (err) {
    console.error('Backend: Error fetching profile:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
