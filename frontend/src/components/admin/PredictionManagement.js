import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from '../Modal';

function PredictionManagement() {
  const [predictions, setPredictions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPredictForm, setShowPredictForm] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [newPrediction, setNewPrediction] = useState({
    day_of_week: 0,
    hour_of_day: 12,
    previous_load: 50,
    seasonal_indicator: 1,
    accident_probability: 0.1,
    scenario_name: ''
  });

  useEffect(() => {
    loadPredictions();
    loadAnalytics();
  }, []);

  const loadPredictions = async () => {
    try {
      const response = await axios.get('/api/predictions?limit=20');
      setPredictions(response.data.predictions || []);
    } catch (error) {
      console.error('Error loading predictions:', error);
      setPredictions([]);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await axios.get('/api/analytics?days=7');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error loading analytics:', error);
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  const handleMakePrediction = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/predict', newPrediction);
      setPredictionResult(response.data);
      setShowPredictForm(false);
      loadPredictions();
      loadAnalytics();
      alert('Prediction completed successfully!');
    } catch (error) {
      console.error('Error making prediction:', error);
      const errorMessage = error.response?.data?.error || 'Failed to make prediction. Make sure the ML service is running.';
      alert(errorMessage);
    }
  };

  const handleDeletePrediction = async (predictionId) => {
    if (window.confirm('Are you sure you want to delete this prediction?')) {
      try {
        await axios.delete(`/api/predictions/${predictionId}`);
        loadPredictions();
        loadAnalytics();
        alert('Prediction deleted successfully!');
      } catch (error) {
        console.error('Error deleting prediction:', error);
        alert('Failed to delete prediction');
      }
    }
  };

  const getDayName = (dayNum) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNum] || 'Unknown';
  };

  const getAlertLevelColor = (level) => {
    switch (level) {
      case 'RED': return 'red';
      case 'YELLOW': return 'yellow';
      case 'GREEN': return 'green';
      default: return 'gray';
    }
  };

  if (loading) return <div className="loading">Loading prediction data...</div>;

  return (
    <div className="prediction-management">
      <h2>Emergency Load Prediction</h2>

      {analytics && (
        <div className="prediction-analytics">
          <h3>📊 Analytics Overview</h3>
          <div className="analytics-grid">
            <div className="analytics-card">
              <div className="card-icon">🔢</div>
              <div className="card-content">
                <h4>Total Predictions</h4>
                <div className="analytics-value">{analytics.total_predictions}</div>
                <p className="card-description">Predictions made</p>
              </div>
            </div>
            <div className="analytics-card">
              <div className="card-icon">🏥</div>
              <div className="card-content">
                <h4>Average Emergency Load</h4>
                <div className="analytics-value">{analytics.average_emergency_load?.toFixed(1) || 'N/A'}</div>
                <p className="card-description">Emergency load %</p>
              </div>
            </div>
            <div className="analytics-card">
              <div className="card-icon">🛏️</div>
              <div className="card-content">
                <h4>Average ICU Beds</h4>
                <div className="analytics-value">{analytics.average_icu_beds?.toFixed(1) || 'N/A'}</div>
                <p className="card-description">ICU beds needed</p>
              </div>
            </div>
          </div>

          <div className="alert-distribution">
            <h4>🚨 Alert Level Distribution</h4>
            <div className="alert-bars">
              {Object.entries(analytics.alert_distribution || {}).map(([level, count]) => (
                <div key={level} className="alert-bar-item">
                  <div className="alert-info">
                    <span className={`alert-indicator ${getAlertLevelColor(level)}`}></span>
                    <span className="alert-label">{level}</span>
                    <span className="alert-count">{count}</span>
                  </div>
                  <div className="bar-container">
                    <div
                      className={`bar ${getAlertLevelColor(level)}`}
                      style={{ width: `${(count / analytics.total_predictions) * 100}%` }}
                    ></div>
                  </div>
                  <span className="alert-percentage">{((count / analytics.total_predictions) * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="prediction-history">
        <h3>📈 Recent Predictions</h3>
        <div className="prediction-list">
          {predictions.map(prediction => (
            <div key={prediction._id} className="prediction-card">
              <div className="prediction-header">
                <div className="prediction-meta">
                  <span className="prediction-date">
                    📅 {new Date(prediction.timestamp).toLocaleDateString()} at {new Date(prediction.timestamp).toLocaleTimeString()}
                  </span>
                  <span className={`alert-badge ${getAlertLevelColor(prediction.alert_level)}`}>
                    {prediction.alert_level} ALERT
                  </span>
                </div>
                <button
                  className="delete-btn-small"
                  onClick={() => handleDeletePrediction(prediction._id)}
                  title="Delete prediction"
                >
                  🗑️
                </button>
              </div>
              <div className="prediction-content">
                <div className="prediction-params">
                  <div className="param-grid">
                    <div className="param-item">
                      <span className="param-label">Day:</span>
                      <span className="param-value">{getDayName(prediction.day_of_week)}</span>
                    </div>
                    <div className="param-item">
                      <span className="param-label">Hour:</span>
                      <span className="param-value">{prediction.hour_of_day}:00</span>
                    </div>
                    <div className="param-item">
                      <span className="param-label">Load:</span>
                      <span className="param-value">{prediction.previous_load}%</span>
                    </div>
                    <div className="param-item">
                      <span className="param-label">Season:</span>
                      <span className="param-value">{prediction.seasonal_indicator}</span>
                    </div>
                    <div className="param-item">
                      <span className="param-label">Accident:</span>
                      <span className="param-value">{(prediction.accident_probability * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                  {prediction.scenario_name && (
                    <div className="scenario-tag">
                      <span className="scenario-label">Scenario:</span>
                      <span className="scenario-value">{prediction.scenario_name}</span>
                    </div>
                  )}
                </div>
                <div className="prediction-results">
                  <h5>Predicted Requirements:</h5>
                  <div className="results-grid">
                    <div className="result-item">
                      <span className="result-label">Emergency Load</span>
                      <span className="result-value">{prediction.emergency_load?.toFixed(1) || 'N/A'}</span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">ICU Beds</span>
                      <span className="result-value">{prediction.icu_beds_required || 'N/A'}</span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">Ventilators</span>
                      <span className="result-value">{prediction.ventilator_demand || 'N/A'}</span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">Staff</span>
                      <span className="result-value">{prediction.staff_workload || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {predictions.length === 0 && (
            <div className="no-predictions">No predictions found</div>
          )}
        </div>
      </div>

      {predictionResult && (
        <div className="prediction-result">
          <h3>🎯 Latest Prediction Result</h3>
          <div className="result-card">
            <div className="result-header">
              <div className="result-status">
                <span className={`alert-badge-large ${getAlertLevelColor(predictionResult.prediction.alert_level)}`}>
                  {predictionResult.prediction.alert_level} ALERT LEVEL
                </span>
                <span className="result-time">
                  📅 {new Date(predictionResult.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="result-content">
              <h4>Resource Requirements:</h4>
              <div className="result-metrics">
                <div className="metric-card">
                  <div className="metric-icon">🚑</div>
                  <div className="metric-info">
                    <span className="metric-label">Emergency Load</span>
                    <span className="metric-value">{predictionResult.prediction.emergency_load?.toFixed(1)}</span>
                    <span className="metric-unit">%</span>
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon">🛏️</div>
                  <div className="metric-info">
                    <span className="metric-label">ICU Beds Needed</span>
                    <span className="metric-value">{predictionResult.prediction.icu_beds}</span>
                    <span className="metric-unit">beds</span>
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon">🫁</div>
                  <div className="metric-info">
                    <span className="metric-label">Ventilators</span>
                    <span className="metric-value">{predictionResult.prediction.ventilator_demand}</span>
                    <span className="metric-unit">units</span>
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon">👥</div>
                  <div className="metric-info">
                    <span className="metric-label">Staff Required</span>
                    <span className="metric-value">{predictionResult.prediction.staff_workload}</span>
                    <span className="metric-unit">personnel</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={showPredictForm}
        onClose={() => setShowPredictForm(false)}
        title="Make New Prediction"
        size="large"
      >
          <form onSubmit={handleMakePrediction}>
            <div className="form-row">
              <div className="form-group">
                <label>Day of Week:</label>
                <select
                  value={newPrediction.day_of_week}
                  onChange={(e) => setNewPrediction({...newPrediction, day_of_week: parseInt(e.target.value)})}
                  required
                >
                  <option value={0}>Sunday</option>
                  <option value={1}>Monday</option>
                  <option value={2}>Tuesday</option>
                  <option value={3}>Wednesday</option>
                  <option value={4}>Thursday</option>
                  <option value={5}>Friday</option>
                  <option value={6}>Saturday</option>
                </select>
              </div>
              <div className="form-group">
                <label>Hour of Day:</label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={newPrediction.hour_of_day}
                  onChange={(e) => setNewPrediction({...newPrediction, hour_of_day: parseInt(e.target.value)})}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Previous Load (%):</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={newPrediction.previous_load}
                  onChange={(e) => setNewPrediction({...newPrediction, previous_load: parseFloat(e.target.value)})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Seasonal Indicator:</label>
                <select
                  value={newPrediction.seasonal_indicator}
                  onChange={(e) => setNewPrediction({...newPrediction, seasonal_indicator: parseInt(e.target.value)})}
                  required
                >
                  <option value={0}>Low Season</option>
                  <option value={1}>Normal Season</option>
                  <option value={2}>High Season</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Accident Probability:</label>
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.01"
                  value={newPrediction.accident_probability}
                  onChange={(e) => setNewPrediction({...newPrediction, accident_probability: parseFloat(e.target.value)})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Scenario Name:</label>
                <input
                  type="text"
                  value={newPrediction.scenario_name}
                  onChange={(e) => setNewPrediction({...newPrediction, scenario_name: e.target.value})}
                  placeholder="Optional scenario description"
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="predict-btn">Make Prediction</button>
              <button type="button" onClick={() => setShowPredictForm(false)} className="cancel-btn">Cancel</button>
            </div>
          </form>
      </Modal>

      <div className="prediction-actions">
        <button className="prediction-btn" onClick={() => setShowPredictForm(true)}>Make New Prediction</button>
        <button className="prediction-btn" onClick={() => { loadPredictions(); loadAnalytics(); }}>Refresh Data</button>
      </div>
    </div>
  );
}

export default PredictionManagement;