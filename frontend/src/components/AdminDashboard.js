import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminOverview from './admin/AdminOverview';
import StaffManagement from './admin/StaffManagement';
import ResourceManagement from './admin/ResourceManagement';
import AlertManagement from './admin/AlertManagement';
import AdminAnalytics from './admin/AdminAnalytics';
import AreaManagement from './admin/AreaManagement';
import PredictionManagement from './admin/PredictionManagement';
import HealthCheck from './admin/HealthCheck';

function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    const section = searchParams.get('section');
    if (section && ['overview', 'staff', 'resources', 'alerts', 'analytics', 'areas', 'predictions', 'health'].includes(section)) {
      setActiveSection(section);
    }
  }, [searchParams]);

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Admin Dashboard - MEDIPULSE AI</h1>
        <div className="admin-user-info">
          <span>Admin: {user.name}</span>
          <button onClick={() => navigate('/dashboard')} className="back-btn">Back to Staff View</button>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </header>

      <nav className="admin-nav">
        <button
          className={activeSection === 'overview' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveSection('overview')}
        >
          Overview
        </button>
        <button
          className={activeSection === 'staff' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveSection('staff')}
        >
          Staff Management
        </button>
        <button
          className={activeSection === 'resources' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveSection('resources')}
        >
          Resources
        </button>
        <button
          className={activeSection === 'alerts' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveSection('alerts')}
        >
          Alert Management
        </button>
        <button
          className={activeSection === 'analytics' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveSection('analytics')}
        >
          Analytics
        </button>
        <button
          className={activeSection === 'areas' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveSection('areas')}
        >
          Areas
        </button>
        <button
          className={activeSection === 'predictions' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveSection('predictions')}
        >
          Predictions
        </button>
        <button
          className={activeSection === 'health' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveSection('health')}
        >
          Health Check
        </button>
      </nav>

      <main className="admin-content">
        {activeSection === 'overview' && <AdminOverview />}
        {activeSection === 'staff' && <StaffManagement />}
        {activeSection === 'resources' && <ResourceManagement />}
        {activeSection === 'alerts' && <AlertManagement />}
        {activeSection === 'analytics' && <AdminAnalytics />}
        {activeSection === 'areas' && <AreaManagement />}
        {activeSection === 'predictions' && <PredictionManagement />}
        {activeSection === 'health' && <HealthCheck />}
      </main>
    </div>
  );
}

export default AdminDashboard;