const mongoose = require('mongoose');

const bedSchema = new mongoose.Schema({
  bedNumber: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['general', 'icu', 'emergency', 'pediatric', 'maternity'],
    required: true
  },
  ward: {
    type: String,
    required: true
  },
  floor: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'maintenance', 'reserved'],
    default: 'available'
  },
  equipment: [{
    type: String,
    enum: ['ventilator', 'monitor', 'oxygen', 'suction', 'defibrillator']
  }],
  currentPatient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient'
  },
  lastMaintenance: {
    type: Date
  },
  nextMaintenance: {
    type: Date
  },
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Bed', bedSchema);