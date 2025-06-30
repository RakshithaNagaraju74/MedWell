const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  imageUrl: String,
  extractedText: String,
  medicines: [String],
  reminders: [String], // future extension
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Prescription', prescriptionSchema);
