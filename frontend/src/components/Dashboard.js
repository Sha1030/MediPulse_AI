import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import OverviewTab from './dashboard/OverviewTab';
import AlertsTab from './dashboard/AlertsTab';
import ScheduleTab from './dashboard/ScheduleTab';
import AdminPanelTab from './dashboard/AdminPanelTab';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [alerts, setAlerts] = useState([]);
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    if (!user?.id) return;

    // Connect to Socket.IO
    const newSocket = io('http://localhost:3002');

    // Join user room for alerts
    newSocket.emit('join-alerts', user.id);

    // Listen for new alerts
    newSocket.on('new-alert', (alert) => {
      setAlerts(prev => [alert, ...prev]);
    });

    // Load initial data
    loadAlerts();
    loadSchedules();

    return () => newSocket.close();
  }, [user?.id]);

  const loadAlerts = async () => {
    try {
      const response = await axios.get('/api/alerts');
      setAlerts(response.data);
    } catch (error) {
      console.error('Error loading alerts:', error);
      setAlerts([]);
    }
  };

  const loadSchedules = async () => {
    try {
      const response = await axios.get('/api/schedules');
      setSchedules(response.data);
    } catch (error) {
      console.error('Error loading schedules:', error);
      setSchedules([]);
    }
  };

  const acknowledgeAlert = async (alertId) => {
    try {
      const response = await axios.put(`/api/alerts/${alertId}/acknowledge`);
      // Update the alert in the state with the response from backend
      setAlerts(prev => prev.map(alert =>
        alert._id === alertId ? response.data : alert
      ));
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>MEDIPULSE AI</h1>
        <div className="user-info">
          <span>Welcome, {user.name} ({user.role})</span>
          <div className="header-actions">
            <button onClick={() => navigate('/profile')} className="nav-link-btn">Profile</button>
            <button onClick={() => navigate('/settings')} className="nav-link-btn">Settings</button>
            <button onClick={logout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      <nav className="dashboard-nav">
        <button
          className={activeTab === 'overview' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={activeTab === 'alerts' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('alerts')}
        >
          Alerts {alerts.filter(a => a.status === 'active').length > 0 && `(${alerts.filter(a => a.status === 'active').length})`}
        </button>
        <button
          className={activeTab === 'schedule' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('schedule')}
        >
          My Schedule
        </button>
        {user.role === 'admin' && (
          <button
            className={activeTab === 'admin' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => setActiveTab('admin')}
          >
            Admin Panel
          </button>
        )}
      </nav>

      <main className="dashboard-content">
        {activeTab === 'overview' && <OverviewTab user={user} />}
        {activeTab === 'alerts' && (
          <AlertsTab
            alerts={alerts}
            onAcknowledge={acknowledgeAlert}
            user={user}
          />
        )}
        {activeTab === 'schedule' && <ScheduleTab schedules={schedules} />}
        {activeTab === 'admin' && user.role === 'admin' && <AdminPanelTab />}
      </main>
    </div>
  );
}

export default Dashboard;