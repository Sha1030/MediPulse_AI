import React from 'react';
import { format } from 'date-fns';

function AlertsTab({ alerts, onAcknowledge, user }) {
  const activeAlerts = alerts.filter(alert => alert.status === 'active');
  const acknowledgedAlerts = alerts.filter(alert =>
    alert.acknowledgedBy.some(ack => ack.userId === user.id)
  );

  return (
    <div className="alerts-tab">
      <h2>Emergency Alerts</h2>

      <div className="alerts-section">
        <h3>Active Alerts ({activeAlerts.length})</h3>
        <div className="alerts-list">
          {activeAlerts.map(alert => (
            <div key={alert._id} className={`alert-item ${alert.severity}`}>
              <div className="alert-header">
                <span className="alert-type">{alert.type.replace('_', ' ').toUpperCase()}</span>
                <span className="alert-severity">{alert.severity}</span>
                <span className="alert-time">
                  {format(new Date(alert.createdAt), 'MMM dd, HH:mm')}
                </span>
              </div>
              <div className="alert-content">
                <h4>{alert.title}</h4>
                <p>{alert.message}</p>
                {alert.recommendedActions && alert.recommendedActions.length > 0 && (
                  <div className="alert-actions">
                    <h5>Recommended Actions:</h5>
                    <ul>
                      {alert.recommendedActions.map((action, index) => (
                        <li key={index}>{action.action}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <button
                  onClick={() => onAcknowledge(alert._id)}
                  className="acknowledge-btn"
                  disabled={alert.acknowledgedBy.some(ack => ack.userId === user.id)}
                >
                  {alert.acknowledgedBy.some(ack => ack.userId === user.id) ? 'Acknowledged' : 'Acknowledge'}
                </button>
              </div>
            </div>
          ))}
          {activeAlerts.length === 0 && (
            <div className="no-alerts">No active alerts</div>
          )}
        </div>
      </div>

      <div className="alerts-section">
        <h3>Acknowledged Alerts ({acknowledgedAlerts.length})</h3>
        <div className="alerts-list">
          {acknowledgedAlerts.slice(0, 5).map(alert => (
            <div key={alert._id} className="alert-item acknowledged">
              <div className="alert-header">
                <span className="alert-type">{alert.type.replace('_', ' ').toUpperCase()}</span>
                <span className="alert-time">
                  {format(new Date(alert.createdAt), 'MMM dd, HH:mm')}
                </span>
              </div>
              <div className="alert-content">
                <h4>{alert.title}</h4>
                <p>{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AlertsTab;