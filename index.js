const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const Message = require('./models/Message');

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/elevate_business';

let useMemoryDB = false;
let memoryMessages = [];

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Hooked Up Successfully'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error. Falling back to IN-MEMORY database.', err.message);
    useMemoryDB = true;
  });

// Route: Submit Contact Form
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (useMemoryDB) {
      const newMessage = { _id: Date.now().toString(), name, email, message, status: 'New', createdAt: new Date() };
      memoryMessages.push(newMessage);
      return res.status(201).json({ success: true, data: newMessage });
    }
    const newMessage = new Message({ name, email, message });
    await newMessage.save();
    res.status(201).json({ success: true, data: newMessage });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route: Get All Messages for Admin Dashboard
app.get('/api/admin/messages', async (req, res) => {
  try {
    if (useMemoryDB) {
      return res.status(200).json({ success: true, data: [...memoryMessages].reverse() });
    }
    const messages = await Message.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// Route: Update Message Status
app.patch('/api/admin/messages/:id', async (req, res) => {
  try {
    const { status } = req.body;
    if (useMemoryDB) {
      const index = memoryMessages.findIndex(m => m._id === req.params.id);
      if (index !== -1) memoryMessages[index].status = status;
      return res.status(200).json({ success: true, data: memoryMessages[index] });
    }
    const updated = await Message.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend securely running on port ${PORT}`));
