// backend/models/Activity.js
const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  date: {
    type: Date,
    default: Date.now,
    required: true,
  },
  steps: {
    type: Number,
    default: 0,
    min: 0,
  },
  activeMinutes: { // Moderate to vigorous activity minutes
    type: Number,
    default: 0,
    min: 0,
  },
  caloriesBurned: { // Estimated calories burned from activity
    type: Number,
    default: 0,
    min: 0,
  },
  activityType: { // e.g., 'walking', 'running', 'cycling', 'gym'
    type: String,
    enum: ['walking', 'running', 'cycling', 'gym', 'other'],
    default: 'other',
  },
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);