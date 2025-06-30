const express = require("express");
const router = express.Router();
const Reminder = require("../models/Reminder");

// Get reminders for a user
router.get("/", async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "userId query required" });

  try {
    const reminders = await Reminder.find({ userId }).sort({ dueDate: 1 });
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reminders" });
  }
});

// Create a new reminder
router.post("/", async (req, res) => {
  const { userId, title, description, dueDate } = req.body;
  if (!userId || !title || !dueDate) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const newReminder = new Reminder({
      userId,
      title,
      description,
      dueDate,
    });
    const saved = await newReminder.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ error: "Failed to create reminder" });
  }
});

module.exports = router;
