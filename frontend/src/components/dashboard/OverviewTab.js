import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

function OverviewTab() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeAlerts: 0,
    todaysSchedules: 0,
    availableBeds: 0,
    availableAmbulances: 0,
    department: user.department
  });

  const loadStats = useCallback(async () => {
    try {
      const [alertsRes, schedulesRes, bedsRes, ambulancesRes] = await Promise.all([
        axios.get('/api/alerts'),
        axios.get('/api/schedules'),
        axios.get('/api/beds?status=available'),
        axios.get('/api/ambulances?status=available')
      ]);

      setStats({
        activeAlerts: alertsRes.data.filter(a => a.status === 'active').length,
        todaysSchedules: schedulesRes.data.filter(s =>
          new Date(s.date).toDateString() === new Date().toDateString()
        ).length,
        availableBeds: bedsRes.data.length,
        availableAmbulances: ambulancesRes.data.length,
        department: user.department
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      setStats({
        activeAlerts: 0,
        todaysSchedules: 0,
        availableBeds: 0,
        availableAmbulances: 0,
        department: user.department
      });
    }
  }, [user.department]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <div className="overview-tab">
      <h2>Dashboard Overview</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Active Alerts</h3>
          <div className="stat-value">{stats.activeAlerts}</div>
          <p>Require attention</p>
        </div>

        <div className="stat-card">
          <h3>Today's Schedules</h3>
          <div className="stat-value">{stats.todaysSchedules}</div>
          <p>Shifts assigned</p>
        </div>

        <div className="stat-card">
          <h3>Available Beds</h3>
          <div className="stat-value">{stats.availableBeds}</div>
          <p>Ready for patients</p>
        </div>

        <div className="stat-card">
          <h3>Available Ambulances</h3>
          <div className="stat-value">{stats.availableAmbulances}</div>
          <p>Emergency response</p>
        </div>
      </div>

      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <button className="action-btn">View Emergency Load</button>
          <button className="action-btn">Check Resources</button>
          <button className="action-btn">Contact Admin</button>
        </div>
      </div>
    </div>
  );
}

export default OverviewTab;