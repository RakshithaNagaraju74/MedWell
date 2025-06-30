// backend/models/Sleep.js
const mongoose = require('mongoose');

const sleepSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  date: { // Date of the sleep entry (e.g., the night it started)
    type: Date,
    default: Date.now,
    required: true,
  },
  durationHours: { // Total hours of sleep
    type: Number,
    required: true,
    min: 0,
  },
  deepSleepHours: {
    type: Number,
    min: 0,
  },
  lightSleepHours: {
    type: Number,
    min: 0,
  },
  remSleepHours: {
    type: Number,
    min: 0,
  },
  qualityRating: { // e.g., 1-5
    type: Number,
    min: 1,
    max: 5,
  },
  notes: {
    type: String,
    trim: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Sleep', sleepSchema);