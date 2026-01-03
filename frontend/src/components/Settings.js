import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

function Settings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    alertSounds: true,
    darkMode: false,
    language: 'en'
  });

  const handleSettingChange = (settingName, value) => {
    setSettings(prev => ({
      ...prev,
      [settingName]: value
    }));
  };

  const handleSave = () => {
    // TODO: Implement settings save API call
    console.log('Saving settings:', settings);
    alert('Settings saved successfully!');
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h2>Settings</h2>
      </div>

      <div className="settings-content">
        <div className="settings-section">
          <h3>Notifications</h3>

          <div className="setting-item">
            <label className="setting-label">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
              />
              Email Notifications
            </label>
            <p className="setting-description">Receive alerts and updates via email</p>
          </div>

          <div className="setting-item">
            <label className="setting-label">
              <input
                type="checkbox"
                checked={settings.pushNotifications}
                onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
              />
              Push Notifications
            </label>
            <p className="setting-description">Receive push notifications in your browser</p>
          </div>

          <div className="setting-item">
            <label className="setting-label">
              <input
                type="checkbox"
                checked={settings.alertSounds}
                onChange={(e) => handleSettingChange('alertSounds', e.target.checked)}
              />
              Alert Sounds
            </label>
            <p className="setting-description">Play sound for emergency alerts</p>
          </div>
        </div>

        <div className="settings-section">
          <h3>Appearance</h3>

          <div className="setting-item">
            <label className="setting-label">
              <input
                type="checkbox"
                checked={settings.darkMode}
                onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
              />
              Dark Mode
            </label>
            <p className="setting-description">Use dark theme for the interface</p>
          </div>
        </div>

        <div className="settings-section">
          <h3>Language & Region</h3>

          <div className="setting-item">
            <label htmlFor="language">Language</label>
            <select
              id="language"
              value={settings.language}
              onChange={(e) => handleSettingChange('language', e.target.value)}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
        </div>

        <div className="settings-section">
          <h3>Account</h3>

          <div className="setting-item">
            <label>Current User</label>
            <p className="setting-description">{user?.name} ({user?.email})</p>
          </div>

          <div className="setting-item">
            <label>Role</label>
            <p className="setting-description">{user?.role}</p>
          </div>
        </div>

        <div className="settings-actions">
          <button onClick={handleSave} className="save-settings-btn">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;