const mongoose = require('mongoose');

const ambulanceSchema = new mongoose.Schema({
  vehicleNumber: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['basic', 'advanced', 'critical_care', 'neonatal'],
    default: 'basic'
  },
  status: {
    type: String,
    enum: ['available', 'on_call', 'maintenance', 'out_of_service'],
    default: 'available'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    },
    address: String,
    area: {
      type: String,
      enum: ['north', 'south', 'east', 'west', 'central', 'suburban']
    }
  },
  equipment: [{
    type: String,
    enum: ['defibrillator', 'ventilator', 'monitor', 'oxygen', 'stretcher', 'suction', 'medications']
  }],
  crew: [{
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['driver', 'paramedic', 'doctor']
    }
  }],
  currentAssignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Emergency'
  },
  mileage: {
    type: Number,
    default: 0
  },
  lastMaintenance: {
    type: Date
  },
  nextMaintenance: {
    type: Date
  },
  fuelLevel: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  },
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for geospatial queries
ambulanceSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Ambulance', ambulanceSchema);