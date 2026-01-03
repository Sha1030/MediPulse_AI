const express = require('express');
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { auth, requireAdmin, requireStaff } = require('./middleware/auth');

const Prediction = require('./models/Prediction');
const User = require('./models/User');
const Bed = require('./models/Bed');
const Ambulance = require('./models/Ambulance');
const Schedule = require('./models/Schedule');
const Maintenance = require('./models/Maintenance');
const Area = require('./models/Area');
const Alert = require('./models/Alert');

require('dotenv').config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3002"],
    methods: ["GET", "POST"]
  }
});

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Sham:shc@cluster0.sk6neiy.mongodb.net/MediPulse_AI?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json());

// ML Service URL
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';

// Socket.IO setup for real-time alerts
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-alerts', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined alerts room`);
  });

  socket.on('join-admin', () => {
    socket.join('admin');
    console.log('Admin joined admin room');
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Authentication Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        employeeId: user.employeeId
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/register', auth, requireAdmin, async (req, res) => {
  try {
    const { name, email, password, role, department, phone, employeeId, shift, skills } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { employeeId }]
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email or employee ID already exists' });
    }

    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      role,
      department,
      phone,
      employeeId,
      shift,
      skills
    });

    await user.save();

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        employeeId: user.employeeId
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/auth/me', auth, async (req, res) => {
  res.json({ user: req.user });
});

app.put('/api/auth/me', auth, async (req, res) => {
  try {
    const { name, phone } = req.body;

    const updateData = {};
    if (typeof name === 'string' && name.trim() !== '') {
      updateData.name = name.trim();
    }
    if (typeof phone === 'string' && phone.trim() !== '') {
      updateData.phone = phone.trim();
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: error.message });
  }
});


// Staff Management Routes
app.get('/api/staff', auth, requireAdmin, async (req, res) => {
  try {
    const { department, role, isActive = true } = req.query;
    const filter = { isActive };

    if (department) filter.department = department;
    if (role) filter.role = role;

    const staff = await User.find(filter).select('-password').sort({ name: 1 });
    res.json(staff);
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/staff/:id', auth, requireAdmin, async (req, res) => {
  try {
    const { name, role, department, phone, shift, skills, isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, role, department, phone, shift, skills, isActive },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating staff:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Bed Management Routes
app.get('/api/beds', auth, async (req, res) => {
  try {
    const { type, status, ward } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (status) filter.status = status;
    if (ward) filter.ward = ward;

    const beds = await Bed.find(filter).sort({ bedNumber: 1 });
    res.json(beds);
  } catch (error) {
    console.error('Error fetching beds:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/beds', auth, requireAdmin, async (req, res) => {
  try {
    const bed = new Bed(req.body);
    await bed.save();
    res.status(201).json(bed);
  } catch (error) {
    console.error('Error creating bed:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/beds/:id', auth, requireAdmin, async (req, res) => {
  try {
    const bed = await Bed.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!bed) {
      return res.status(404).json({ error: 'Bed not found' });
    }
    res.json(bed);
  } catch (error) {
    console.error('Error updating bed:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Ambulance Management Routes
app.get('/api/ambulances', auth, async (req, res) => {
  try {
    const { status, area } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (area) filter['location.area'] = area;

    const ambulances = await Ambulance.find(filter).sort({ vehicleNumber: 1 });
    res.json(ambulances);
  } catch (error) {
    console.error('Error fetching ambulances:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/ambulances', auth, requireAdmin, async (req, res) => {
  try {
    const ambulance = new Ambulance(req.body);
    await ambulance.save();
    res.status(201).json(ambulance);
  } catch (error) {
    console.error('Error creating ambulance:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/ambulances/:id', auth, requireAdmin, async (req, res) => {
  try {
    const ambulance = await Ambulance.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!ambulance) {
      return res.status(404).json({ error: 'Ambulance not found' });
    }
    res.json(ambulance);
  } catch (error) {
    console.error('Error updating ambulance:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Maintenance Management Routes
app.get('/api/maintenance', auth, async (req, res) => {
  try {
    const { status, resourceType } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (resourceType) filter.resourceType = resourceType;

    const maintenance = await Maintenance.find(filter)
      .populate('assignedStaff', 'name email')
      .populate('createdBy', 'name')
      .sort({ scheduledDate: 1 });

    res.json(maintenance);
  } catch (error) {
    console.error('Error fetching maintenance:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/maintenance', auth, requireAdmin, async (req, res) => {
  try {
    const maintenance = new Maintenance({
      ...req.body,
      createdBy: req.user.id
    });
    await maintenance.save();

    const populatedMaintenance = await Maintenance.findById(maintenance._id)
      .populate('assignedStaff', 'name email')
      .populate('createdBy', 'name');

    res.status(201).json(populatedMaintenance);
  } catch (error) {
    console.error('Error creating maintenance:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/maintenance/:id', auth, requireAdmin, async (req, res) => {
  try {
    const maintenance = await Maintenance.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('assignedStaff', 'name email')
      .populate('createdBy', 'name');

    if (!maintenance) {
      return res.status(404).json({ error: 'Maintenance not found' });
    }

    res.json(maintenance);
  } catch (error) {
    console.error('Error updating maintenance:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/maintenance/:id', auth, requireAdmin, async (req, res) => {
  try {
    const maintenance = await Maintenance.findByIdAndDelete(req.params.id);

    if (!maintenance) {
      return res.status(404).json({ error: 'Maintenance not found' });
    }

    res.json({ message: 'Maintenance deleted successfully' });
  } catch (error) {
    console.error('Error deleting maintenance:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Schedule Management Routes
app.get('/api/schedules', auth, async (req, res) => {
  try {
    const { staffId, date, department } = req.query;
    const filter = {};

    if (staffId) filter.staffId = staffId;
    if (date) filter.date = new Date(date);
    if (department) filter.department = department;

    // Staff can only see their own schedules, admins can see all
    if (req.user.role !== 'admin') {
      filter.staffId = req.user._id;
    }

    const schedules = await Schedule.find(filter)
      .populate('staffId', 'name role department')
      .sort({ date: 1, startTime: 1 });

    res.json(schedules);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/schedules', auth, requireAdmin, async (req, res) => {
  try {
    const schedule = new Schedule({
      ...req.body,
      assignedBy: req.user._id
    });
    await schedule.save();

    const populatedSchedule = await Schedule.findById(schedule._id)
      .populate('staffId', 'name role department');

    res.status(201).json(populatedSchedule);
  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/schedules/:id', auth, requireAdmin, async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('staffId', 'name role department');

    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    res.json(schedule);
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Area Management Routes
app.get('/api/areas', auth, async (req, res) => {
  try {
    const areas = await Area.find().sort({ name: 1 });
    res.json(areas);
  } catch (error) {
    console.error('Error fetching areas:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/areas', auth, requireAdmin, async (req, res) => {
  try {
    const area = new Area(req.body);
    await area.save();
    res.status(201).json(area);
  } catch (error) {
    console.error('Error creating area:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Alert Management Routes
app.get('/api/alerts', auth, async (req, res) => {
  try {
    const { status = 'active', severity } = req.query;
    const filter = { status };

    if (severity) filter.severity = severity;

    // Staff see alerts relevant to their department/area
    if (req.user.role !== 'admin') {
      filter.$or = [
        { area: 'hospital_wide' },
        { area: req.user.department }
      ];
    }

    const alerts = await Alert.find(filter)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/alerts', auth, requireAdmin, async (req, res) => {
  try {
    const alertData = {
      ...req.body,
      createdBy: req.user._id
    };

    // Set default area if not provided
    if (!alertData.area) {
      alertData.area = 'hospital_wide';
    }

    // Set default expiration if not provided (24 hours from now)
    if (!alertData.expiresAt) {
      alertData.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }

    const alert = new Alert(alertData);
    await alert.save();

    // Emit real-time alert to relevant users
    io.to('admin').emit('new-alert', alert);
    if (alert.area === 'hospital_wide') {
      // Emit to all connected users for hospital-wide alerts
      io.emit('new-alert', alert);
    } else {
      // Emit to users in specific area (would need user location tracking)
      io.emit('area-alert', { area: alert.area, alert });
    }

    res.status(201).json(alert);
  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Prediction Routes
app.post('/api/predict', async (req, res) => {
  try {
    const { day_of_week, hour_of_day, previous_load, seasonal_indicator, accident_probability, scenario_name } = req.body;

    // Validate input
    if (day_of_week === undefined || hour_of_day === undefined || previous_load === undefined ||
        seasonal_indicator === undefined || accident_probability === undefined) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Call ML service
    const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict`, {
      day_of_week: parseInt(day_of_week),
      hour_of_day: parseInt(hour_of_day),
      previous_load: parseFloat(previous_load),
      seasonal_indicator: parseInt(seasonal_indicator),
      accident_probability: parseFloat(accident_probability)
    });

    // Save prediction to database
    const predictionData = {
      day_of_week: parseInt(day_of_week),
      hour_of_day: parseInt(hour_of_day),
      previous_load: parseFloat(previous_load),
      seasonal_indicator: parseInt(seasonal_indicator),
      accident_probability: parseFloat(accident_probability),
      scenario_name: scenario_name || 'Manual Prediction',
      emergency_load: mlResponse.data.emergency_load,
      icu_beds_required: mlResponse.data.icu_beds,
      ventilator_demand: mlResponse.data.ventilator_demand,
      staff_workload: mlResponse.data.staff_workload,
      alert_level: mlResponse.data.alert_level,
      recommendations: mlResponse.data.recommendations
    };

    const prediction = new Prediction(predictionData);
    await prediction.save();

    res.json({
      success: true,
      prediction: mlResponse.data,
      id: prediction._id,
      timestamp: prediction.timestamp
    });
  } catch (error) {
    console.error('Error getting prediction:', error);
    
    // Check if it's an ML service connection error
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(503).json({ 
        error: 'ML service is not available. Please ensure the ML service is running on port 5000.' 
      });
    }
    
    // Check if it's a response error from ML service
    if (error.response) {
      return res.status(error.response.status).json({ 
        error: `ML service error: ${error.response.data.error || 'Unknown error'}` 
      });
    }
    
    res.status(500).json({ error: 'Failed to get prediction from ML service' });
  }
});

app.put('/api/alerts/:id/acknowledge', auth, async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    // Check if user already acknowledged
    const alreadyAcknowledged = alert.acknowledgedBy.some(
      ack => ack.userId.toString() === req.user._id.toString()
    );

    if (!alreadyAcknowledged) {
      alert.acknowledgedBy.push({ userId: req.user._id });
      await alert.save();
    }

    res.json(alert);
  } catch (error) {
    console.error('Error acknowledging alert:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend service is healthy' });
});

// Get prediction history
app.get('/api/predictions', async (req, res) => {
  try {
    const { limit = 50, page = 1, alert_level, start_date, end_date } = req.query;

    let query = {};

    // Filter by alert level
    if (alert_level) {
      query.alert_level = alert_level;
    }

    // Filter by date range
    if (start_date || end_date) {
      query.timestamp = {};
      if (start_date) query.timestamp.$gte = new Date(start_date);
      if (end_date) query.timestamp.$lte = new Date(end_date);
    }

    const predictions = await Prediction.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Prediction.countDocuments(query);

    res.json({
      predictions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching predictions:', error);
    res.status(500).json({ error: 'Failed to fetch predictions' });
  }
});

// Get prediction analytics
app.get('/api/analytics', async (req, res) => {
  try {
    const { days = 7 } = req.query;

    // Get predictions from last N days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const predictions = await Prediction.find({
      timestamp: { $gte: startDate }
    }).sort({ timestamp: 1 });

    // Calculate analytics
    const analytics = {
      total_predictions: predictions.length,
      average_emergency_load: predictions.reduce((sum, p) => sum + p.emergency_load, 0) / predictions.length || 0,
      average_icu_beds: predictions.reduce((sum, p) => sum + p.icu_beds_required, 0) / predictions.length || 0,
      alert_distribution: {
        GREEN: predictions.filter(p => p.alert_level === 'GREEN').length,
        YELLOW: predictions.filter(p => p.alert_level === 'YELLOW').length,
        RED: predictions.filter(p => p.alert_level === 'RED').length
      },
      hourly_patterns: {},
      daily_patterns: {}
    };

    // Hourly patterns
    for (let hour = 0; hour < 24; hour++) {
      const hourPredictions = predictions.filter(p => p.hour_of_day === hour);
      analytics.hourly_patterns[hour] = {
        count: hourPredictions.length,
        avg_load: hourPredictions.reduce((sum, p) => sum + p.emergency_load, 0) / hourPredictions.length || 0
      };
    }

    // Daily patterns
    for (let day = 0; day < 7; day++) {
      const dayPredictions = predictions.filter(p => p.day_of_week === day);
      analytics.daily_patterns[day] = {
        count: dayPredictions.length,
        avg_load: dayPredictions.reduce((sum, p) => sum + p.emergency_load, 0) / dayPredictions.length || 0
      };
    }

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Delete prediction (for cleanup)
app.delete('/api/predictions/:id', async (req, res) => {
  try {
    const prediction = await Prediction.findByIdAndDelete(req.params.id);
    if (!prediction) {
      return res.status(404).json({ error: 'Prediction not found' });
    }
    res.json({ message: 'Prediction deleted successfully' });
  } catch (error) {
    console.error('Error deleting prediction:', error);
    res.status(500).json({ error: 'Failed to delete prediction' });
  }
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO enabled for real-time alerts`);
});