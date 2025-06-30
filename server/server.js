const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const Groq = require('groq-sdk');

// Load environment variables
dotenv.config();
const app = express();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Middleware
app.use(cors({
  origin: 'https://medwell-1-c5wc.onrender.com', // <== Your React frontend hosted on Render
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ MongoDB connected');
}).catch((err) => console.error('❌ MongoDB connection error:', err));

// Route imports
const prescriptionRoutes = require('./routes/prescriptions');
const medicineRoutes = require('./routes/medicines');
const documentRoutes = require('./routes/documentRoutes');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/UserSetup');
const remindersRoutes = require("./routes/reminders");
const vitalSignRoutes = require('./routes/vitalSigns');
const symptomRoutes = require('./routes/symptoms');
const activityRoutes = require('./routes/activities');
const sleepRoutes = require('./routes/sleeps');

const User = require('./models/UserProfile');
const Reminder = require('./models/Reminder');

// Routes
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/reminders', remindersRoutes);
app.use('/api/vitalsigns', vitalSignRoutes);
app.use('/api/symptoms', symptomRoutes);
app.use('/api/lifestyle/activity', activityRoutes);
app.use('/api/lifestyle/sleep', sleepRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('🧠 AI Health Assistant Backend is running!');
});

// GET user profile
app.get('/api/user/profile', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ message: 'userId is required' });
  try {
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST/PUT user profile
app.post('/api/user/profile', async (req, res) => {
  const { userId, name, email, ...rest } = req.body;
  if (!userId || !name || !email) {
    return res.status(400).json({ message: 'userId, name, email required' });
  }
  try {
    const updatedUser = await User.findOneAndUpdate(
      { userId },
      { name, email, ...rest },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT update user profile
app.put('/api/user/profile', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ message: 'userId is required' });

  try {
    const updatedUser = await User.findOneAndUpdate(
      { userId },
      { $set: req.body },
      { new: true }
    );
    if (!updatedUser) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET all reminders
app.get('/api/reminders', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ message: 'userId is required' });

  try {
    const reminders = await Reminder.find({ userId }).sort({ dueDate: 1 });
    res.status(200).json(reminders);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST new reminder
app.post('/api/reminders', async (req, res) => {
  const { userId, title, dueDate, description } = req.body;
  if (!userId || !title || !dueDate)
    return res.status(400).json({ message: 'userId, title, dueDate required' });

  try {
    const newReminder = new Reminder({ userId, title, dueDate, description });
    await newReminder.save();
    res.status(201).json(newReminder);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST symptom identification
app.post('/api/symptom-checker/identify', async (req, res) => {
  try {
    const { symptoms } = req.body;
    if (!Array.isArray(symptoms) || symptoms.length === 0)
      return res.status(400).json({ message: 'Symptoms array required' });

    const prompt = `Given these symptoms: ${symptoms.join(', ')}, list possible medical conditions and advice.`;
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama3-8b-8192',
      temperature: 0.7,
      max_tokens: 1024,
    });

    const aiResponse = chatCompletion.choices[0]?.message?.content || 'No information found.';
    res.json({ result: aiResponse });
  } catch (err) {
    res.status(500).json({ message: 'Symptom checker error', error: err.message });
  }
});

// POST AI chatbot
app.post('/api/chat', async (req, res) => {
  try {
    const { message, chatHistory = [] } = req.body;
    if (!message) return res.status(400).json({ message: 'Message is required' });

    const messages = [
      {
        role: 'system',
        content:
          'You are a helpful health assistant. Provide general info, do not diagnose. Suggest users consult a doctor.',
      },
      ...chatHistory.map((m) => ({ role: m.role, content: m.message || m.content })),
      { role: 'user', content: message },
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages,
      model: 'llama3-8b-8192',
      temperature: 0.7,
      max_tokens: 512,
    });

    const reply = chatCompletion.choices[0]?.message?.content || 'No response.';
    res.json({ response: reply });
  } catch (err) {
    res.status(500).json({ message: 'Chat error', error: err.message });
  }
});

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);

});
