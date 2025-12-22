import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import './Profile.css';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || '',
    department: user?.department || ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      role: user?.role || '',
      department: user?.department || ''
    });
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="profile-container">
        <div className="error-state">
          <h2>No user logged in</h2>
          <p>Please log in to view your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>My Profile</h2>
        <p>Manage your personal information and statistics</p>
      </div>

      <div className="profile-content">
        <div className="profile-sidebar">
          <div className="profile-avatar-section">
            <img src={user.avatar} alt={user.name} className="profile-avatar" />
            <h3>{user.name}</h3>
            <p className="profile-email">{user.email}</p>
            {user.provider && (
              <span className="provider-badge">
                Signed in with {user.provider === 'google' ? 'Google' : 'Email'}
              </span>
            )}
          </div>

          <div className="profile-stats">
            <div className="stat-card">
              <div className="stat-value">{user.tasksCompleted || 0}</div>
              <div className="stat-label">Tasks Completed</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{user.activeProjects || 0}</div>
              <div className="stat-label">Active Projects</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {user.joinDate ? new Date(user.joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
              </div>
              <div className="stat-label">Member Since</div>
            </div>
          </div>
        </div>

        <div className="profile-main">
          <div className="profile-section">
            <div className="section-header">
              <h3>Personal Information</h3>
              {!isEditing && (
                <button className="edit-button" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="role">Role/Title</label>
                    <input
                      type="text"
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="department">Department</label>
                    <input
                      type="text"
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="cancel-button" onClick={handleCancel}>
                    Cancel
                  </button>
                  <button type="submit" className="save-button">
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="info-grid">
                <div className="info-item">
                  <label>Full Name</label>
                  <p>{user.name}</p>
                </div>
                <div className="info-item">
                  <label>Email Address</label>
                  <p>{user.email}</p>
                </div>
                <div className="info-item">
                  <label>Role/Title</label>
                  <p>{user.role || 'Not specified'}</p>
                </div>
                <div className="info-item">
                  <label>Department</label>
                  <p>{user.department || 'Not specified'}</p>
                </div>
                <div className="info-item">
                  <label>User ID</label>
                  <p className="user-id">{user.id}</p>
                </div>
                <div className="info-item">
                  <label>Join Date</label>
                  <p>{user.joinDate ? new Date(user.joinDate).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            )}
          </div>

          <div className="profile-section">
            <h3>Activity Overview</h3>
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon">✓</div>
                <div className="activity-details">
                  <h4>Completed {user.tasksCompleted || 0} tasks</h4>
                  <p>Keep up the great work!</p>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon">📊</div>
                <div className="activity-details">
                  <h4>Managing {user.activeProjects || 0} active projects</h4>
                  <p>Track your progress in the Projects section</p>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon">🎯</div>
                <div className="activity-details">
                  <h4>Member for {user.joinDate ? Math.floor((new Date() - new Date(user.joinDate)) / (1000 * 60 * 60 * 24 * 30)) : 0} months</h4>
                  <p>Thank you for being part of our team!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
