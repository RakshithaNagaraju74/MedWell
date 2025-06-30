const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Links reminder to a specific user
  title: { type: String, required: true },
  description: { type: String },
  dueDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reminder', reminderSchema);
