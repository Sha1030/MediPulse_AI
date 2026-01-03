const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['surge_warning', 'surge_active', 'resource_critical', 'staff_shortage', 'ambulance_unavailable', 'bed_full', 'emergency', 'warning', 'info', 'maintenance', 'emergency_broadcast'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  area: {
    type: String,
    enum: ['north', 'south', 'east', 'west', 'central', 'suburban', 'hospital_wide'],
    default: 'hospital_wide'
  },
  prediction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prediction'
  },
  affectedResources: {
    beds: {
      type: Number,
      default: 0
    },
    icuBeds: {
      type: Number,
      default: 0
    },
    ventilators: {
      type: Number,
      default: 0
    },
    staff: {
      type: Number,
      default: 0
    },
    ambulances: {
      type: Number,
      default: 0
    }
  },
  recommendedActions: [{
    action: String,
    priority: {
      type: String,
      enum: ['immediate', 'high', 'medium', 'low']
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date
  }],
  status: {
    type: String,
    enum: ['active', 'acknowledged', 'resolved', 'expired'],
    default: 'active'
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // Default to 24 hours from now
  },
  acknowledgedBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    acknowledgedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
alertSchema.index({ status: 1, severity: 1, createdAt: -1 });
alertSchema.index({ expiresAt: 1 });

module.exports = mongoose.model('Alert', alertSchema);