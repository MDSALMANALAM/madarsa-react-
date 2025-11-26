const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  class_level: String,
  category: {
    type: String,
    enum: ['quran', 'hadith', 'fiqh', 'seerah', 'modern'],
    default: 'modern'
  },
  duration: String,
  fees: Number,
  is_active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
