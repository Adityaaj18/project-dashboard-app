import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import './Settings.css';

const Settings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    taskReminders: true,
    projectUpdates: false,
    weeklyReports: true,
    theme: 'light',
    language: 'en'
  });
  const [saved, setSaved] = useState(false);

  const handleToggle = (key) => {
    setSettings({
      ...settings,
      [key]: !settings[key]
    });
  };

  const handleSelect = (key, value) => {
    setSettings({
      ...settings,
      [key]: value
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('userSettings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!user) {
    return (
      <div className="settings-container">
        <div className="error-state">
          <h2>No user logged in</h2>
          <p>Please log in to access settings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h2>Settings</h2>
        <p>Manage your account preferences and notifications</p>
      </div>

      {saved && (
        <div className="success-message">
          Settings saved successfully!
        </div>
      )}

      <div className="settings-content">
        <div className="settings-section">
          <h3>Notifications</h3>
          <p className="section-description">
            Choose what notifications you'd like to receive
          </p>

          <div className="settings-list">
            <div className="setting-item">
              <div className="setting-info">
                <h4>Email Notifications</h4>
                <p>Receive email updates about your account activity</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={() => handleToggle('emailNotifications')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>Task Reminders</h4>
                <p>Get reminded about upcoming task deadlines</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.taskReminders}
                  onChange={() => handleToggle('taskReminders')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>Project Updates</h4>
                <p>Notifications when projects you're part of are updated</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.projectUpdates}
                  onChange={() => handleToggle('projectUpdates')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>Weekly Reports</h4>
                <p>Receive weekly summary of your activities</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.weeklyReports}
                  onChange={() => handleToggle('weeklyReports')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3>Appearance</h3>
          <p className="section-description">
            Customize how the application looks
          </p>

          <div className="settings-list">
            <div className="setting-item">
              <div className="setting-info">
                <h4>Theme</h4>
                <p>Choose your preferred color theme</p>
              </div>
              <select
                className="setting-select"
                value={settings.theme}
                onChange={(e) => handleSelect('theme', e.target.value)}
              >
                <option value="light">Light</option>
                <option value="dark">Dark (Coming Soon)</option>
                <option value="auto">Auto (Coming Soon)</option>
              </select>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>Language</h4>
                <p>Select your preferred language</p>
              </div>
              <select
                className="setting-select"
                value={settings.language}
                onChange={(e) => handleSelect('language', e.target.value)}
              >
                <option value="en">English</option>
                <option value="es">Spanish (Coming Soon)</option>
                <option value="fr">French (Coming Soon)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3>Account</h3>
          <p className="section-description">
            Manage your account security and preferences
          </p>

          <div className="settings-list">
            <div className="setting-item">
              <div className="setting-info">
                <h4>Change Password</h4>
                <p>Update your account password</p>
              </div>
              <button className="secondary-button">Change Password</button>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>Two-Factor Authentication</h4>
                <p>Add an extra layer of security to your account</p>
              </div>
              <button className="secondary-button">Enable 2FA</button>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>Delete Account</h4>
                <p>Permanently delete your account and all data</p>
              </div>
              <button className="danger-button">Delete Account</button>
            </div>
          </div>
        </div>

        <div className="settings-actions">
          <button className="save-button" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
