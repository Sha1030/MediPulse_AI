import React, { useState, useEffect } from 'react';
import axios from 'axios';

function HealthCheck() {
  const [healthStatus, setHealthStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState(null);

  useEffect(() => {
    checkHealth();
    // Set up periodic health checks every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkHealth = async () => {
    try {
      const startTime = Date.now();
      const response = await axios.get('/api/health');
      const responseTime = Date.now() - startTime;

      setHealthStatus({
        status: 'healthy',
        message: response.data.status,
        responseTime: responseTime,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      setHealthStatus({
        status: 'unhealthy',
        message: error.response?.data?.error || 'Service unavailable',
        responseTime: null,
        timestamp: new Date().toISOString(),
        error: error.message
      });
    } finally {
      setLoading(false);
      setLastChecked(new Date());
    }
  };

  if (loading) return <div className="loading">Checking system health...</div>;

  return (
    <div className="health-check">
      <h2>🔍 System Health Check</h2>

      <div className="health-status">
        <div className={`status-card ${healthStatus?.status}`}>
          <div className="status-header">
            <div className="status-light"></div>
            <div className="status-info">
              <h3>Backend Service</h3>
              <p className="status-message">
                {healthStatus?.status === 'healthy' ? '✅ Operational' : '❌ Issues Detected'}
              </p>
            </div>
          </div>

          <div className="health-details">
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">📊 Status:</span>
                <span className={`detail-value ${healthStatus?.status}`}>
                  {healthStatus?.status?.toUpperCase()}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">💬 Message:</span>
                <span className="detail-value">{healthStatus?.message}</span>
              </div>
              {healthStatus?.responseTime && (
                <div className="detail-item">
                  <span className="detail-label">⚡ Response Time:</span>
                  <span className="detail-value">{healthStatus.responseTime}ms</span>
                </div>
              )}
              <div className="detail-item">
                <span className="detail-label">🕒 Last Checked:</span>
                <span className="detail-value">
                  {lastChecked?.toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {healthStatus?.status === 'unhealthy' && (
          <div className="error-card">
            <h4>🚨 Error Details</h4>
            <div className="error-content">
              <p><strong>Error:</strong> {healthStatus.error}</p>
            </div>
            <div className="troubleshooting">
              <h5>🔧 Troubleshooting Steps:</h5>
              <ul>
                <li>🔍 Check if the backend server is running</li>
                <li>🗄️ Verify the database connection</li>
                <li>📋 Check server logs for detailed error messages</li>
                <li>⚙️ Ensure all required environment variables are set</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="health-actions">
        <button className="health-btn" onClick={checkHealth}>
          🔄 Check Health Now
        </button>
        <p className="auto-refresh">⏰ Auto-refreshing every 30 seconds</p>
      </div>

      <div className="system-info">
        <h3>💻 System Information</h3>
        <div className="info-grid">
          <div className="info-card">
            <div className="info-icon">🏷️</div>
            <div className="info-content">
              <span className="info-label">Frontend Version:</span>
              <span className="info-value">1.0.0</span>
            </div>
          </div>
          <div className="info-card">
            <div className="info-icon">🌐</div>
            <div className="info-content">
              <span className="info-label">API Base URL:</span>
              <span className="info-value">{axios.defaults.baseURL}</span>
            </div>
          </div>
          <div className="info-card">
            <div className="info-icon">🖥️</div>
            <div className="info-content">
              <span className="info-label">User Agent:</span>
              <span className="info-value">{navigator.userAgent.split(' ').slice(0, 3).join(' ')}...</span>
            </div>
          </div>
          <div className="info-card">
            <div className="info-icon">📡</div>
            <div className="info-content">
              <span className="info-label">Connection:</span>
              <span className={`info-value ${navigator.onLine ? 'online' : 'offline'}`}>
                {navigator.onLine ? '🟢 Online' : '🔴 Offline'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HealthCheck;