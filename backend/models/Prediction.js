const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  // Input parameters
  day_of_week: {
    type: Number,
    required: true,
    min: 0,
    max: 6
  },
  hour_of_day: {
    type: Number,
    required: true,
    min: 0,
    max: 23
  },
  previous_load: {
    type: Number,
    required: true,
    min: 0
  },
  seasonal_indicator: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  accident_probability: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },

  // Prediction results
  emergency_load: {
    type: Number,
    required: true
  },
  icu_beds_required: {
    type: Number,
    required: true
  },
  ventilator_demand: {
    type: Number,
    required: true
  },
  staff_workload: {
    type: String,
    required: true,
    enum: ['LOW', 'MEDIUM', 'HIGH']
  },
  alert_level: {
    type: String,
    required: true,
    enum: ['GREEN', 'YELLOW', 'RED']
  },
  recommendations: [{
    type: String
  }],

  // Metadata
  timestamp: {
    type: Date,
    default: Date.now
  },
  scenario_name: {
    type: String,
    default: 'Custom'
  }
});

// Index for efficient queries
predictionSchema.index({ timestamp: -1 });
predictionSchema.index({ alert_level: 1, timestamp: -1 });

module.exports = mongoose.model('Prediction', predictionSchema);