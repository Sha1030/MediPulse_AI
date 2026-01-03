const mongoose = require('mongoose');
const Bed = require('./models/Bed');
const Ambulance = require('./models/Ambulance');
const Schedule = require('./models/Schedule');
const Alert = require('./models/Alert');
const Area = require('./models/Area');
require('dotenv').config();

// Sample beds data
const bedsData = [
  { bedNumber: 'ER-001', type: 'emergency', ward: 'Emergency Ward A', floor: 1, status: 'occupied', currentPatient: null, notes: 'Patient with chest pain', equipment: ['monitor', 'oxygen'] },
  { bedNumber: 'ER-002', type: 'emergency', ward: 'Emergency Ward A', floor: 1, status: 'available', equipment: ['monitor', 'oxygen'] },
  { bedNumber: 'ER-003', type: 'emergency', ward: 'Emergency Ward A', floor: 1, status: 'maintenance', notes: 'Under maintenance', equipment: ['monitor', 'oxygen'] },
  { bedNumber: 'ICU-101', type: 'icu', ward: 'ICU Ward 1', floor: 2, status: 'occupied', currentPatient: null, notes: 'Critical condition', equipment: ['ventilator', 'monitor', 'oxygen', 'suction', 'defibrillator'] },
  { bedNumber: 'ICU-102', type: 'icu', ward: 'ICU Ward 1', floor: 2, status: 'available', equipment: ['ventilator', 'monitor', 'oxygen', 'suction', 'defibrillator'] },
  { bedNumber: 'ICU-103', type: 'icu', ward: 'ICU Ward 1', floor: 2, status: 'occupied', currentPatient: null, notes: 'Post-surgery monitoring', equipment: ['ventilator', 'monitor', 'oxygen', 'suction'] },
  { bedNumber: 'GEN-201', type: 'general', ward: 'General Ward B', floor: 3, status: 'available', equipment: ['monitor', 'oxygen'] },
  { bedNumber: 'GEN-202', type: 'general', ward: 'General Ward B', floor: 3, status: 'occupied', currentPatient: null, notes: 'Recovery from surgery', equipment: ['monitor', 'oxygen', 'suction'] },
  { bedNumber: 'PED-301', type: 'pediatric', ward: 'Pediatric Ward', floor: 4, status: 'available', equipment: ['monitor', 'oxygen'] },
  { bedNumber: 'PED-302', type: 'pediatric', ward: 'Pediatric Ward', floor: 4, status: 'occupied', currentPatient: null, notes: 'Child with fever', equipment: ['monitor', 'oxygen'] }
];

// Sample ambulances data
const ambulancesData = [
  { 
    vehicleNumber: 'AMB-001', 
    type: 'advanced',
    status: 'available', 
    location: {
      address: 'Hospital Base',
      area: 'central',
      coordinates: [0, 0]
    },
    equipment: ['defibrillator', 'ventilator', 'monitor', 'oxygen']
  },
  { 
    vehicleNumber: 'AMB-002', 
    type: 'basic',
    status: 'on_call', 
    location: {
      address: 'Downtown Area',
      area: 'central',
      coordinates: [0, 0]
    },
    equipment: ['monitor', 'oxygen', 'stretcher']
  },
  { 
    vehicleNumber: 'AMB-003', 
    type: 'advanced',
    status: 'maintenance', 
    location: {
      address: 'Service Center',
      area: 'central',
      coordinates: [0, 0]
    },
    equipment: ['defibrillator', 'ventilator', 'monitor', 'oxygen'],
    notes: 'Routine maintenance'
  },
  { 
    vehicleNumber: 'AMB-004', 
    type: 'advanced',
    status: 'available', 
    location: {
      address: 'Hospital Base',
      area: 'central',
      coordinates: [0, 0]
    },
    equipment: ['defibrillator', 'ventilator', 'monitor', 'oxygen', 'suction']
  },
  { 
    vehicleNumber: 'AMB-005', 
    type: 'basic',
    status: 'on_call', 
    location: {
      address: 'North District',
      area: 'north',
      coordinates: [0, 0]
    },
    equipment: ['monitor', 'oxygen', 'stretcher', 'suction']
  }
];

// Sample areas data
const areasData = [
  {
    name: 'Downtown',
    region: 'central',
    riskLevel: 'high',
    population: 50000,
    trafficDensity: 'high',
    industrialActivity: 'medium',
    elderlyPopulation: 8000,
    coordinates: {
      type: 'Polygon',
      coordinates: [[
        [-74.01, 40.71],
        [-74.01, 40.72],
        [-73.99, 40.72],
        [-73.99, 40.71],
        [-74.01, 40.71]
      ]]
    }
  },
  {
    name: 'North District',
    region: 'north',
    riskLevel: 'medium',
    population: 35000,
    trafficDensity: 'medium',
    industrialActivity: 'high',
    elderlyPopulation: 5000,
    coordinates: {
      type: 'Polygon',
      coordinates: [[
        [-74.01, 40.73],
        [-74.01, 40.74],
        [-73.99, 40.74],
        [-73.99, 40.73],
        [-74.01, 40.73]
      ]]
    }
  },
  {
    name: 'South Suburbs',
    region: 'south',
    riskLevel: 'low',
    population: 25000,
    trafficDensity: 'low',
    industrialActivity: 'low',
    elderlyPopulation: 6000,
    coordinates: {
      type: 'Polygon',
      coordinates: [[
        [-74.01, 40.69],
        [-74.01, 40.70],
        [-73.99, 40.70],
        [-73.99, 40.69],
        [-74.01, 40.69]
      ]]
    }
  },
  {
    name: 'East Industrial',
    region: 'east',
    riskLevel: 'high',
    population: 20000,
    trafficDensity: 'high',
    industrialActivity: 'high',
    elderlyPopulation: 2000,
    coordinates: {
      type: 'Polygon',
      coordinates: [[
        [-73.98, 40.71],
        [-73.98, 40.72],
        [-73.96, 40.72],
        [-73.96, 40.71],
        [-73.98, 40.71]
      ]]
    }
  },
  {
    name: 'West Residential',
    region: 'west',
    riskLevel: 'medium',
    population: 40000,
    trafficDensity: 'medium',
    industrialActivity: 'low',
    elderlyPopulation: 10000,
    coordinates: {
      type: 'Polygon',
      coordinates: [[
        [-74.04, 40.71],
        [-74.04, 40.72],
        [-74.02, 40.72],
        [-74.02, 40.71],
        [-74.04, 40.71]
      ]]
    }
  }
];

// Sample schedules data
const schedulesData = [
  {
    staffId: null, // Will be set after users are created
    date: new Date(),
    startTime: '08:00',
    endTime: '16:00',
    shift: 'morning',
    department: 'emergency',
    status: 'scheduled',
    notes: 'Regular morning shift'
  },
  {
    staffId: null,
    date: new Date(),
    startTime: '16:00',
    endTime: '00:00',
    shift: 'evening',
    department: 'emergency',
    status: 'scheduled'
  },
  {
    staffId: null,
    date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    startTime: '00:00',
    endTime: '08:00',
    shift: 'night',
    department: 'icu',
    status: 'scheduled'
  }
];

// Sample alerts data
const alertsData = [
  {
    type: 'surge_warning',
    severity: 'high',
    title: 'High Emergency Load Predicted',
    message: 'Emergency department expected to reach 85% capacity in next 2 hours. Prepare additional staff and resources.',
    status: 'active',
    area: 'hospital_wide',
    expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
    recommendedActions: [
      { action: 'Activate additional emergency staff', priority: 'high' },
      { action: 'Prepare overflow beds in general ward', priority: 'medium' },
      { action: 'Contact on-call physicians', priority: 'high' }
    ],
    acknowledgedBy: []
  },
  {
    type: 'bed_full',
    severity: 'medium',
    title: 'ICU Bed Shortage Alert',
    message: 'ICU beds at 90% capacity. 2 beds available out of 20 total.',
    status: 'active',
    area: 'hospital_wide',
    expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
    recommendedActions: [
      { action: 'Transfer stable patients to general ward', priority: 'medium' },
      { action: 'Prepare step-down unit beds', priority: 'low' }
    ],
    acknowledgedBy: []
  },
  {
    type: 'ambulance_unavailable',
    severity: 'critical',
    title: 'Multiple Ambulance Requests',
    message: '3 simultaneous emergency calls in downtown area. All ambulances currently engaged.',
    status: 'active',
    area: 'central',
    expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    recommendedActions: [
      { action: 'Dispatch backup ambulances from nearby hospitals', priority: 'immediate' },
      { action: 'Activate mutual aid agreement', priority: 'high' },
      { action: 'Prepare triage protocols', priority: 'high' }
    ],
    acknowledgedBy: []
  }
];

async function seedData() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Sham:shc@cluster0.sk6neiy.mongodb.net/MediPulse_AI?retryWrites=true&w=majority';

    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Get user IDs for schedules
    const User = require('./models/User');
    const users = await User.find({}, '_id role department');

    // Seed beds
    await Bed.deleteMany({});
    await Bed.insertMany(bedsData);
    console.log(`✅ Created ${bedsData.length} beds`);

    // Seed ambulances
    await Ambulance.deleteMany({});
    await Ambulance.insertMany(ambulancesData);
    console.log(`✅ Created ${ambulancesData.length} ambulances`);

    // Seed areas
    await Area.deleteMany({});
    await Area.insertMany(areasData);
    console.log(`✅ Created ${areasData.length} areas`);

    // Seed schedules with user IDs
    await Schedule.deleteMany({});
    const schedulesWithUsers = schedulesData.map((schedule, index) => {
      const user = users[index % users.length]; // Cycle through users
      return { ...schedule, staffId: user._id };
    });
    await Schedule.insertMany(schedulesWithUsers);
    console.log(`✅ Created ${schedulesWithUsers.length} schedules`);

    // Seed alerts
    await Alert.deleteMany({});
    await Alert.insertMany(alertsData);
    console.log(`✅ Created ${alertsData.length} alerts`);

    console.log('\n🎉 All sample data seeded successfully!');
    console.log('\n📊 Sample Data Summary:');
    console.log(`   🛏️  Beds: ${bedsData.length} (${bedsData.filter(b => b.status === 'available').length} available)`);
    console.log(`   🚑 Ambulances: ${ambulancesData.length} (${ambulancesData.filter(a => a.status === 'available').length} available)`);
    console.log(`   📍 Areas: ${areasData.length} (with risk predictions)`);
    console.log(`   📅 Schedules: ${schedulesWithUsers.length} (assigned to staff)`);
    console.log(`   🚨 Alerts: ${alertsData.length} (active emergency notifications)`);

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seed function
seedData();