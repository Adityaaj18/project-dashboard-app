import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import './Settings.css';

function Settings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    taskReminders: true,
    projectUpdates: false,
    weeklyReports: true,
    theme: 'dark',
    language: 'en',
    twoFactorAuth: false
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
      await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

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
    } catch (error) {
      setPasswordError(error.message || 'Failed to change password');
    }
  };

  const canChangePassword = user?.provider === 'email';

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h2>Settings</h2>
        <p>Manage your account preferences and security</p>
      </div>

      <div className="settings-content">
        <div className="settings-section">
          <h3>Notifications</h3>
          <p className="section-description">Choose what updates you want to receive</p>

          <div className="settings-list">
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Email Notifications</div>
                <div className="setting-sublabel">Receive email updates about your projects</div>
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
                <div className="setting-label">Task Reminders</div>
                <div className="setting-sublabel">Get reminded about upcoming task deadlines</div>
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
                <div className="setting-label">Project Updates</div>
                <div className="setting-sublabel">Notifications when projects are updated</div>
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
                <div className="setting-label">Weekly Reports</div>
                <div className="setting-sublabel">Receive weekly project status summaries</div>
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
          <p className="section-description">Customize how the app looks</p>

          <div className="settings-list">
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Theme</div>
                <div className="setting-sublabel">Choose your preferred color scheme</div>
              </div>
              <select
                value={settings.theme}
                onChange={(e) => handleSelect('theme', e.target.value)}
                className="setting-select"
              >
                <option value="dark">Dark</option>
                <option value="light">Light (Coming Soon)</option>
              </select>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Language</div>
                <div className="setting-sublabel">Select your preferred language</div>
              </div>
              <select
                value={settings.language}
                onChange={(e) => handleSelect('language', e.target.value)}
                className="setting-select"
              >
                <option value="en">English</option>
                <option value="es">Spanish (Coming Soon)</option>
                <option value="fr">French (Coming Soon)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3>Security</h3>
          <p className="section-description">Manage your account security settings</p>

          <div className="settings-list">
            {canChangePassword && (
              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-label">Password</div>
                  <div className="setting-sublabel">Change your account password</div>
                </div>
                <button
                  className="change-password-btn"
                  onClick={() => setShowChangePassword(!showChangePassword)}
                >
                  {showChangePassword ? 'Cancel' : 'Change Password'}
                </button>
              </div>
            )}

            {!canChangePassword && (
              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-label">Password</div>
                  <div className="setting-sublabel">You signed in with {user?.provider}. Password change is not available.</div>
                </div>
              </div>
            )}

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Two-Factor Authentication</div>
                <div className="setting-sublabel">Add an extra layer of security (Coming Soon)</div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.twoFactorAuth}
                  onChange={() => handleToggle('twoFactorAuth')}
                  disabled
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          {showChangePassword && canChangePassword && (
            <div className="change-password-form">
              <h4>Change Password</h4>
              {passwordError && <div className="error-message">{passwordError}</div>}
              {passwordSuccess && <div className="success-message">{passwordSuccess}</div>}

              <form onSubmit={handleChangePassword}>
                <div className="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                  />
                </div>

                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Enter new password"
                  />
                </div>

                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                  />
                </div>

                <button type="submit" className="submit-password-btn">
                  Update Password
                </button>
              </form>
            </div>
          )}
        </div>

        <div className="settings-actions">
          <button onClick={handleSave} className="save-settings-btn">
            {saved ? 'Settings Saved!' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
