# MEDIPULSE AI

A predictive healthcare resource management system that uses AI/ML to forecast hospital emergency load and optimize resource allocation.

## Architecture

- **Frontend**: React.js dashboard with real-time predictions, history, and analytics
- **Backend**: Node.js + Express API orchestration layer with MongoDB
- **ML Service**: Python + Flask microservice with scikit-learn models
- **Database**: MongoDB for storing prediction records and analytics
- **Training Data**: Synthetic hospital data (CSV) for model training

## Features

### Core AI Predictions
- Emergency patient load forecasting (6-24 hours ahead)
- ICU bed requirements prediction
- Critical resource (ventilators) demand forecasting
- Staff workload intelligence (Low/Medium/High)

### Preparedness Alert System
- **GREEN**: Safe operations
- **YELLOW**: Caution required
- **RED**: Overload risk - immediate action needed

### AI-Generated Recommendations
- Staff augmentation suggestions
- ICU bed preparation alerts
- Emergency protocol activation

### Database & Analytics
- **Persistent Storage**: All predictions saved to MongoDB
- **Prediction History**: View past predictions with timestamps
- **Analytics Dashboard**: Real-time insights and trends
- **Dynamic Content**: Data-driven recommendations and alerts

## Quick Start

### Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- MongoDB (local or cloud instance)
- pip

### 1. Setup MongoDB
**Option A: Local MongoDB**
```bash
# Install MongoDB locally
# Windows: Download from mongodb.com
# macOS: brew install mongodb-community
# Linux: Follow official documentation

# Start MongoDB service
mongod
```

**Option B: MongoDB Atlas (Cloud)**
- Create account at mongodb.com/atlas
- Create free cluster
- Get connection string and update `.env`

### 2. Train ML Models
```bash
cd ml-service
pip install -r requirements.txt
python train_model.py
```

### 3. Start MongoDB & Services
```bash
# Terminal 1: Start MongoDB (if local)
mongod

# Terminal 2: Start ML Service
cd ml-service
python app.py
# Runs on http://localhost:5000

# Terminal 3: Start Backend API
cd backend
npm install
npm start
# Runs on http://localhost:3001

# Terminal 4: Start Frontend Dashboard
cd frontend
npm install
npm start
# Runs on http://localhost:3000
```

## Demo Flow

### Setup (5 minutes):
1. **Install MongoDB** and start the service
2. **Train models**: `cd ml-service && python train_model.py`
3. **Install dependencies**: Run `npm install` in backend/ and frontend/
4. **Start all services** in order

### Demo Execution (15 minutes):

#### 1. Make Predictions Tab
- Click "Normal Monday Morning" → Should show GREEN status
- Click "Peak Friday Afternoon" → Should show YELLOW/RED status
- Click "Outbreak Scenario" → Should show RED with emergency recommendations
- **All predictions are automatically saved to database**

#### 2. Prediction History Tab
- View all past predictions with timestamps
- See alert levels and key metrics
- Data persists between sessions

#### 3. Analytics Dashboard Tab
- **Total Predictions**: Running count of all predictions made
- **Average Metrics**: Emergency load, ICU beds over time
- **Alert Distribution**: GREEN/YELLOW/RED breakdown
- **Real-time Updates**: Analytics refresh with new predictions

### Key Demo Points:
- **Persistent Data**: Predictions saved to MongoDB, survive app restarts
- **Dynamic Analytics**: Real-time dashboard updates
- **Historical Trends**: Track prediction patterns over time
- **Explainable AI**: Models predict based on day/time patterns and external factors
- **Proactive Healthcare**: Shifts from reactive to predictive resource management

## API Endpoints

### ML Service (Flask)
- `POST /predict` - Get predictions from ML models
- `GET /health` - Service health check

### Backend API (Express + MongoDB)
- `POST /api/predict` - Orchestrate prediction requests & save to DB
- `GET /api/scenarios` - Get demo scenario presets
- `GET /api/predictions` - Retrieve prediction history with pagination
- `GET /api/analytics` - Get analytics data and insights
- `DELETE /api/predictions/:id` - Delete prediction record
- `GET /api/health` - Backend health check

### Database Schema
```javascript
Prediction {
  day_of_week: Number,
  hour_of_day: Number,
  previous_load: Number,
  seasonal_indicator: Number,
  accident_probability: Number,
  emergency_load: Number,
  icu_beds_required: Number,
  ventilator_demand: Number,
  staff_workload: String,
  alert_level: String,
  recommendations: [String],
  timestamp: Date,
  scenario_name: String
}
```

## Technology Stack

- **Frontend**: React 18, Axios, date-fns, CSS3
- **Backend**: Node.js, Express, Mongoose, CORS, dotenv
- **ML Service**: Python, Flask, scikit-learn, joblib
- **Database**: MongoDB with Mongoose ODM
- **Data**: Pandas, CSV processing

## Environment Configuration

Create `.env` file in backend/ directory:
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/hospital-prediction
ML_SERVICE_URL=http://localhost:5000
```

## Hackathon Notes

This prototype demonstrates:
- **Full-Stack Integration**: React + Node.js + Python + MongoDB
- **Persistent Data Layer**: MongoDB for record keeping
- **Real-time Analytics**: Dynamic dashboard with live data
- **Scalable Architecture**: Microservices ready for production deployment
- **Healthcare AI**: Explainable predictions for medical decision support

For production deployment, consider:
- Real hospital data integration (with HIPAA compliance)
- Advanced ML models (LSTM, ensemble methods)
- User authentication and role-based access
- Real-time data streaming (WebSockets)
- Advanced analytics and reporting
- Cloud deployment (AWS/Azure/GCP)