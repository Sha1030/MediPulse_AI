const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  shift: {
    type: String,
    enum: ['morning', 'evening', 'night', 'on_call'],
    required: true
  },
  startTime: {
    type: String,
    required: true // Format: "HH:MM"
  },
  endTime: {
    type: String,
    required: true // Format: "HH:MM"
  },
  department: {
    type: String,
    enum: ['emergency', 'icu', 'general', 'pediatrics', 'surgery', 'ambulance'],
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'swapped'],
    default: 'scheduled'
  },
  notes: {
    type: String
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for efficient queries
scheduleSchema.index({ staffId: 1, date: 1 });
scheduleSchema.index({ date: 1, department: 1, shift: 1 });

module.exports = mongoose.model('Schedule', scheduleSchema);