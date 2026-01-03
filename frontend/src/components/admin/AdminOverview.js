import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminOverview() {
  const [stats, setStats] = useState({
    totalStaff: 0,
    activeAlerts: 0,
    availableBeds: 0,
    availableAmbulances: 0,
    totalBeds: 0,
    totalAmbulances: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [staffRes, alertsRes, bedsRes, ambulancesRes, allBedsRes, allAmbulancesRes] = await Promise.all([
        axios.get('/api/staff'),
        axios.get('/api/alerts'),
        axios.get('/api/beds?status=available'),
        axios.get('/api/ambulances?status=available'),
        axios.get('/api/beds'),
        axios.get('/api/ambulances')
      ]);

      setStats({
        totalStaff: staffRes.data.length,
        activeAlerts: alertsRes.data.filter(a => a.status === 'active').length,
        availableBeds: bedsRes.data.length,
        availableAmbulances: ambulancesRes.data.length,
        totalBeds: allBedsRes.data.length,
        totalAmbulances: allAmbulancesRes.data.length
      });
    } catch (error) {
      console.error('Error loading admin stats:', error);
      setStats({
        totalStaff: 0,
        activeAlerts: 0,
        availableBeds: 0,
        availableAmbulances: 0,
        totalBeds: 0,
        totalAmbulances: 0
      });
    }
  };

  return (
    <div className="admin-overview">
      <h2>System Overview</h2>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <h3>Total Staff</h3>
          <div className="stat-value">{stats.totalStaff}</div>
          <p>Active personnel</p>
        </div>

        <div className="admin-stat-card">
          <h3>Active Alerts</h3>
          <div className="stat-value alert-count">{stats.activeAlerts}</div>
          <p>Require attention</p>
        </div>

        <div className="admin-stat-card">
          <h3>Bed Availability</h3>
          <div className="stat-value">{stats.availableBeds}/{stats.totalBeds}</div>
          <p>Beds ready</p>
        </div>

        <div className="admin-stat-card">
          <h3>Ambulance Status</h3>
          <div className="stat-value">{stats.availableAmbulances}/{stats.totalAmbulances}</div>
          <p>Available units</p>
        </div>
      </div>

      <div className="quick-admin-actions">
        <h3>Quick Actions</h3>
        <div className="admin-action-grid">
          <button className="admin-action-btn">Create Emergency Alert</button>
          <button className="admin-action-btn">Schedule Staff</button>
          <button className="admin-action-btn">Check Resources</button>
          <button className="admin-action-btn">Generate Report</button>
        </div>
      </div>
    </div>
  );
}

export default AdminOverview;