const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String,
    trim: true
  },
  originalUrl: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    trim: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  source: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create a unique compound index on title and date to avoid duplicates
EventSchema.index({ title: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Event', EventSchema); 