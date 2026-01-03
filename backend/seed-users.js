const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// Demo users data
const demoUsers = [
  {
    name: 'Admin User',
    email: 'admin@hospital.com',
    password: 'admin123',
    role: 'admin',
    department: 'emergency',
    phone: '+1-555-0100',
    employeeId: 'ADM001',
    shift: 'flexible',
    skills: ['emergency_care', 'icu_care']
  },
  {
    name: 'Dr. Sarah Johnson',
    email: 'doctor@hospital.com',
    password: 'doctor123',
    role: 'doctor',
    department: 'emergency',
    phone: '+1-555-0101',
    employeeId: 'DOC001',
    shift: 'morning',
    skills: ['emergency_care', 'surgery']
  },
  {
    name: 'Nurse Michael Chen',
    email: 'nurse@hospital.com',
    password: 'nurse123',
    role: 'nurse',
    department: 'emergency',
    phone: '+1-555-0102',
    employeeId: 'NUR001',
    shift: 'evening',
    skills: ['emergency_care', 'pediatrics']
  },
  {
    name: 'Dr. Emily Rodriguez',
    email: 'emily@hospital.com',
    password: 'doctor123',
    role: 'doctor',
    department: 'icu',
    phone: '+1-555-0103',
    employeeId: 'DOC002',
    shift: 'night',
    skills: ['icu_care', 'ventilator_management']
  },
  {
    name: 'Nurse David Kim',
    email: 'david@hospital.com',
    password: 'nurse123',
    role: 'nurse',
    department: 'icu',
    phone: '+1-555-0104',
    employeeId: 'NUR002',
    shift: 'morning',
    skills: ['icu_care', 'emergency_care']
  },
  {
    name: 'Paramedic Lisa Wong',
    email: 'lisa@hospital.com',
    password: 'paramedic123',
    role: 'paramedic',
    department: 'ambulance',
    phone: '+1-555-0105',
    employeeId: 'PAR001',
    shift: 'flexible',
    skills: ['ambulance_driver', 'emergency_care']
  }
];

async function seedUsers() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Sham:shc@cluster0.sk6neiy.mongodb.net/MediPulse_AI?retryWrites=true&w=majority';

    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing users (optional - comment out if you want to keep existing users)
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create demo users
    const createdUsers = [];
    for (const userData of demoUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push({
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      });
    }

    console.log('Demo users created successfully!');
    console.log('\n=== DEMO ACCOUNTS ===');
    createdUsers.forEach(user => {
      console.log(`${user.role.toUpperCase()}: ${user.email} / ${user.role}123`);
      console.log(`  Name: ${user.name}`);
      console.log(`  Department: ${user.department}`);
      console.log('');
    });

    console.log('You can now login with these accounts in the application!');

  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seed function
seedUsers();