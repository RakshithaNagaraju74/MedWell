// backend/models/VitalSign.js
const mongoose = require('mongoose');

const vitalSignSchema = new mongoose.Schema({
  userId: {
    type: String, // In a real app, this would be a reference to a User model (ObjectId)
    required: true,
    index: true, // For faster lookups by user
  },
  type: { // e.g., 'bloodPressure', 'heartRate', 'temperature', 'oxygenSaturation', 'weight', 'bloodGlucose'
    type: String,
    required: true,
    enum: ['bloodPressure', 'heartRate', 'temperature', 'oxygenSaturation', 'weight', 'bloodGlucose']
  },
  value: { // For single value vitals (HR, Temp, O2, Weight, Glucose)
    type: Number,
  },
  systolic: { // For blood pressure
    type: Number,
  },
  diastolic: { // For blood pressure
    type: Number,
  },
  unit: { // e.g., 'bpm', 'mmHg', '°F', '%', 'lbs', 'mg/dL'
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
    required: true,
  },
  notes: {
    type: String,
  },
}, { timestamps: true }); // Adds createdAt and updatedAt timestamps

// Pre-save validation for blood pressure
vitalSignSchema.pre('save', function(next) {
  if (this.type === 'bloodPressure' && (this.systolic === undefined || this.diastolic === undefined)) {
    return next(new Error('Blood pressure type requires systolic and diastolic values.'));
  }
  if (this.type !== 'bloodPressure' && this.value === undefined) {
    return next(new Error(`${this.type} type requires a single 'value'.`));
  }
  next();
});

module.exports = mongoose.model('VitalSign', vitalSignSchema);