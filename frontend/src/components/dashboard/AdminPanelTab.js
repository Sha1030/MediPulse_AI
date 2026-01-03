import React from 'react';
import { useNavigate } from 'react-router-dom';

function AdminPanelTab() {
  const navigate = useNavigate();

  return (
    <div className="admin-panel-tab">
      <h2>Admin Quick Access</h2>
      <div className="admin-actions">
        <button
          className="admin-btn"
          onClick={() => navigate('/admin')}
        >
          Full Admin Dashboard
        </button>
        <button
          className="admin-btn"
          onClick={() => navigate('/admin?section=analytics')}
        >
          View Analytics
        </button>
        <button
          className="admin-btn"
          onClick={() => navigate('/admin?section=staff')}
        >
          Manage Staff
        </button>
        <button
          className="admin-btn"
          onClick={() => navigate('/admin?section=resources')}
        >
          Resource Management
        </button>
        <button
          className="admin-btn"
          onClick={() => navigate('/admin?section=alerts')}
        >
          Create Alert
        </button>
        <button
          className="admin-btn"
          onClick={() => navigate('/admin?section=areas')}
        >
          Manage Areas
        </button>
        <button
          className="admin-btn"
          onClick={() => navigate('/admin?section=predictions')}
        >
          Emergency Predictions
        </button>
        <button
          className="admin-btn"
          onClick={() => navigate('/admin?section=health')}
        >
          System Health
        </button>
      </div>
    </div>
  );
}

export default AdminPanelTab;