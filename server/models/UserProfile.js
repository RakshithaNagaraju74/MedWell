// models/UserProfile.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true }, // Unique identifier for the user
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number },
  gender: { type: String }, // Added gender field
  heartRate: { type: Number },
  sleepHours: { type: Number },
  activeHours: { type: Number },
  weight: { type: Number },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update `updatedAt` field on save
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('UserProfile', userSchema);
