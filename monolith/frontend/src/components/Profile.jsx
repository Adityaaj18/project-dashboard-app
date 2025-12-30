import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import './Profile.css';

function Profile() {
  const { user, updateUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    role: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await authAPI.getProfile();
      setProfileData(data);
      setFormData({
        name: data.name || '',
        department: data.department || '',
        role: data.role || 'viewer'
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Update profile (name, department)
      await updateUser({ name: formData.name, department: formData.department });

      // If role changed, update it separately
      if (formData.role !== profileData.role) {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/auth/users/${profileData.id}/role`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ role: formData.role })
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to update role');
        }
      }

      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
      loadProfile();
    } catch (error) {
      console.error('Failed to update profile:', error);
      setError(error.message || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profileData?.name || '',
      department: profileData?.department || '',
      role: profileData?.role || 'viewer'
    });
    setError('');
    setSuccess('');
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!profileData) {
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
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="profile-sidebar">
          <div className="profile-avatar-section">
            <img src={profileData.avatar} alt={profileData.name} className="profile-avatar" />
            <h3>{profileData.name}</h3>
            <p className="profile-email">{profileData.email}</p>
            <span className={`role-badge role-${profileData.role?.toLowerCase().replace(/\s+/g, '-')}`}>
              {profileData.role || 'Viewer'}
            </span>
            {profileData.provider && (
              <span className="provider-badge">
                Signed in with {profileData.provider === 'google' ? 'Google' : 'Email'}
              </span>
            )}
          </div>

          <div className="profile-stats">
            <div className="stat-card">
              <div className="stat-value">{profileData.tasksCompleted || 0}</div>
              <div className="stat-label">Tasks Completed</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{profileData.activeProjects || 0}</div>
              <div className="stat-label">Active Projects</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {profileData.created_at ? new Date(profileData.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
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
                      value={profileData.email}
                      disabled
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="role">Role/Title</label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="role-select-input"
                    >
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="team lead">Team Lead</option>
                      <option value="developer">Developer</option>
                      <option value="viewer">Viewer</option>
                    </select>
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
                  <p>{profileData.name}</p>
                </div>
                <div className="info-item">
                  <label>Email Address</label>
                  <p>{profileData.email}</p>
                </div>
                <div className="info-item">
                  <label>Role/Title</label>
                  <p>{profileData.role || 'Not specified'}</p>
                </div>
                <div className="info-item">
                  <label>Department</label>
                  <p>{profileData.department || 'Not specified'}</p>
                </div>
                <div className="info-item">
                  <label>User ID</label>
                  <p className="user-id">{profileData.id}</p>
                </div>
                <div className="info-item">
                  <label>Join Date</label>
                  <p>{profileData.created_at ? new Date(profileData.created_at).toLocaleDateString() : 'N/A'}</p>
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
                  <h4>Completed {profileData.tasksCompleted || 0} tasks</h4>
                  <p>Keep up the great work!</p>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon">📊</div>
                <div className="activity-details">
                  <h4>Managing {profileData.activeProjects || 0} active projects</h4>
                  <p>Track your progress in the Projects section</p>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon">🎯</div>
                <div className="activity-details">
                  <h4>Member for {profileData.created_at ? Math.floor((new Date() - new Date(profileData.created_at)) / (1000 * 60 * 60 * 24 * 30)) : 0} months</h4>
                  <p>Thank you for being part of our team!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
