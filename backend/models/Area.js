const mongoose = require('mongoose');

const areaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  region: {
    type: String,
    enum: ['north', 'south', 'east', 'west', 'central', 'suburban'],
    required: true
  },
  population: {
    type: Number,
    required: true
  },
  hospitals: [{
    hospitalId: String,
    name: String,
    distance: Number, // in km
    capacity: Number
  }],
  riskFactors: {
    trafficDensity: {
      type: Number,
      min: 0,
      max: 10,
      default: 5
    },
    industrialActivity: {
      type: Number,
      min: 0,
      max: 10,
      default: 5
    },
    elderlyPopulation: {
      type: Number,
      min: 0,
      max: 100,
      default: 15 // percentage
    },
    medicalFacilities: {
      type: Number,
      min: 0,
      max: 10,
      default: 5
    },
    crimeRate: {
      type: Number,
      min: 0,
      max: 10,
      default: 5
    }
  },
  historicalData: [{
    date: Date,
    emergencyIncidents: Number,
    averageResponseTime: Number, // in minutes
    weatherConditions: String,
    seasonalFactor: Number
  }],
  coordinates: {
    type: {
      type: String,
      enum: ['Polygon'],
      default: 'Polygon'
    },
    coordinates: [[[Number]]] // GeoJSON polygon coordinates
  },
  emergencyContacts: [{
    type: {
      type: String,
      enum: ['police', 'fire', 'hospital', 'ambulance']
    },
    name: String,
    phone: String,
    address: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for geospatial queries
areaSchema.index({ coordinates: '2dsphere' });
areaSchema.index({ region: 1 });

module.exports = mongoose.model('Area', areaSchema);