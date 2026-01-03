import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import Modal from '../Modal';

function AlertManagement() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAlert, setNewAlert] = useState({
    type: 'surge_warning',
    severity: 'high',
    title: '',
    message: '',
    area: 'hospital_wide',
    expiresAt: ''
  });

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const response = await axios.get('/api/alerts');
      setAlerts(response.data);
    } catch (error) {
      console.error('Error loading alerts:', error);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/alerts', newAlert);
      setNewAlert({
        type: 'surge_warning',
        severity: 'high',
        title: '',
        message: '',
        area: 'hospital_wide',
        expiresAt: ''
      });
      setShowCreateForm(false);
      loadAlerts(); // Refresh the alerts list
    } catch (error) {
      console.error('Error creating alert:', error);
      alert('Failed to create alert');
    }
  };

  const handleEmergencyBroadcast = async () => {
    try {
      await axios.post('/api/alerts', {
        type: 'surge_active',
        severity: 'critical',
        title: 'Emergency Broadcast',
        message: 'Immediate attention required for all emergency personnel',
        area: 'hospital_wide'
      });
      loadAlerts();
      alert('Emergency broadcast sent to all staff!');
    } catch (error) {
      console.error('Error sending emergency broadcast:', error);
      alert('Failed to send emergency broadcast');
    }
  };

  if (loading) return <div className="loading">Loading alerts...</div>;

  const activeAlerts = alerts.filter(a => a.status === 'active');
  const resolvedAlerts = alerts.filter(a => a.status === 'resolved');

  return (
    <div className="alert-management">
      <h2>Alert Management</h2>

      <div className="alert-summary">
        <div className="alert-stat">
          <h3>Active Alerts</h3>
          <div className="stat-value alert-count">{activeAlerts.length}</div>
        </div>
        <div className="alert-stat">
          <h3>Resolved Today</h3>
          <div className="stat-value">{resolvedAlerts.filter(a =>
            new Date(a.createdAt).toDateString() === new Date().toDateString()
          ).length}</div>
        </div>
      </div>

      <Modal
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        title="Create New Alert"
        size="medium"
      >
          <form onSubmit={handleCreateAlert}>
            <div className="form-group">
              <label>Alert Type:</label>
              <select
                value={newAlert.type}
                onChange={(e) => setNewAlert({...newAlert, type: e.target.value})}
                required
              >
                <option value="surge_warning">Surge Warning</option>
                <option value="surge_active">Surge Active</option>
                <option value="resource_critical">Resource Critical</option>
                <option value="staff_shortage">Staff Shortage</option>
                <option value="ambulance_unavailable">Ambulance Unavailable</option>
                <option value="bed_full">Bed Full</option>
                <option value="emergency">Emergency</option>
                <option value="warning">Warning</option>
                <option value="info">Information</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            <div className="form-group">
              <label>Severity:</label>
              <select
                value={newAlert.severity}
                onChange={(e) => setNewAlert({...newAlert, severity: e.target.value})}
                required
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div className="form-group">
              <label>Title:</label>
              <input
                type="text"
                value={newAlert.title}
                onChange={(e) => setNewAlert({...newAlert, title: e.target.value})}
                required
                placeholder="Alert title"
              />
            </div>
            <div className="form-group">
              <label>Message:</label>
              <textarea
                value={newAlert.message}
                onChange={(e) => setNewAlert({...newAlert, message: e.target.value})}
                required
                placeholder="Alert message"
                rows="3"
              />
            </div>
            <div className="form-group">
              <label>Area:</label>
              <select
                value={newAlert.area}
                onChange={(e) => setNewAlert({...newAlert, area: e.target.value})}
                required
              >
                <option value="hospital_wide">Hospital Wide</option>
                <option value="north">North</option>
                <option value="south">South</option>
                <option value="east">East</option>
                <option value="west">West</option>
                <option value="central">Central</option>
                <option value="suburban">Suburban</option>
              </select>
            </div>
            <div className="form-group">
              <label>Expires At (optional):</label>
              <input
                type="datetime-local"
                value={newAlert.expiresAt}
                onChange={(e) => setNewAlert({...newAlert, expiresAt: e.target.value})}
                placeholder="Leave empty for 24 hours from now"
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="create-btn">Create Alert</button>
              <button type="button" onClick={() => setShowCreateForm(false)} className="cancel-btn">Cancel</button>
            </div>
          </form>
      </Modal>

      <div className="alerts-list-admin">
        <h3>All Alerts</h3>
        {alerts.map(alert => (
          <div key={alert._id} className={`alert-item-admin ${alert.status}`}>
            <div className="alert-header-admin">
              <span className="alert-type-admin">{alert.type.replace('_', ' ').toUpperCase()}</span>
              <span className="alert-severity-admin">{alert.severity}</span>
              <span className="alert-status-admin">{alert.status}</span>
              <span className="alert-time-admin">
                {format(new Date(alert.createdAt), 'MMM dd, HH:mm')}
              </span>
            </div>
            <div className="alert-content-admin">
              <h4>{alert.title}</h4>
              <p>{alert.message}</p>
            </div>
          </div>
        ))}
        {alerts.length === 0 && (
          <div className="no-alerts">No alerts found</div>
        )}
      </div>

      <div className="alert-actions">
        <button className="alert-btn" onClick={() => setShowCreateForm(true)}>Create New Alert</button>
        <button className="alert-btn emergency-btn" onClick={handleEmergencyBroadcast}>Emergency Broadcast</button>
      </div>
    </div>
  );
}

export default AlertManagement;