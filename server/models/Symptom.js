// backend/models/Symptom.js
const mongoose = require('mongoose');

const symptomSchema = new mongoose.Schema({
  userId: {
    type: String, // In a real app, this would be a reference to a User model (ObjectId)
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  intensity: { // 1-5 scale, or similar
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  date: {
    type: Date,
    default: Date.now,
    required: true,
  },
  notes: {
    type: String,
    trim: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Symptom', symptomSchema);