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
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

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

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    try {
      // Get token from localStorage
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const token = userData.token;

      if (!token) {
        setPasswordError('Not authenticated. Please log in again.');
        return;
      }

      const response = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        setPasswordSuccess('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setTimeout(() => {
          setShowChangePassword(false);
          setPasswordSuccess('');
        }, 2000);
      } else {
        setPasswordError(data.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Change password error:', error);
      setPasswordError('An error occurred. Please try again.');
    }
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
              <button
                className="secondary-button"
                onClick={() => setShowChangePassword(true)}
              >
                Change Password
              </button>
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

      {showChangePassword && (
        <div className="modal-overlay" onClick={() => setShowChangePassword(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Change Password</h3>
              <button
                className="modal-close"
                onClick={() => setShowChangePassword(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="password-form">
              {passwordError && (
                <div className="error-message">{passwordError}</div>
              )}
              {passwordSuccess && (
                <div className="success-message">{passwordSuccess}</div>
              )}

              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({
                    ...passwordData,
                    currentPassword: e.target.value
                  })}
                  placeholder="Enter current password"
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value
                  })}
                  placeholder="Enter new password (min 6 characters)"
                />
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value
                  })}
                  placeholder="Confirm new password"
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="primary-button">
                  Change Password
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowChangePassword(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
