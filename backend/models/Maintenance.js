const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  resourceType: {
    type: String,
    enum: ['bed', 'ambulance'],
    required: true
  },
  resourceId: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  estimatedDuration: {
    type: Number, // in hours
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  assignedStaff: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  actualStartDate: {
    type: Date
  },
  actualEndDate: {
    type: Date
  },
  cost: {
    type: Number,
    min: 0
  },
  notes: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
maintenanceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Maintenance', maintenanceSchema);