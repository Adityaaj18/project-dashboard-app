import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Users.css';

function Users() {
  const { user, permissions } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load users');
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/auth/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update role');
      }

      setSuccess('Role updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
      loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const getRoleBadgeClass = (role) => {
    const roleClasses = {
      admin: 'role-admin',
      manager: 'role-manager',
      'team lead': 'role-team-lead',
      developer: 'role-developer',
      viewer: 'role-viewer'
    };
    return roleClasses[role.toLowerCase()] || 'role-viewer';
  };

  if (!permissions.viewUsers) {
    return (
      <div className="users-container">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You don't have permission to view users.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="users-container">
      <div className="users-header">
        <h1>User Management</h1>
        <p>View and manage user roles and permissions</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="users-grid">
        {users.map(u => (
          <div key={u.id} className="user-card">
            <div className="user-card-header">
              <img src={u.avatar} alt={u.name} className="user-card-avatar" />
              <div className="user-card-info">
                <h3>{u.name}</h3>
                <p className="user-email">{u.email}</p>
                {u.provider && (
                  <span className="provider-badge">
                    {u.provider === 'google' ? 'Google' : 'Email'}
                  </span>
                )}
              </div>
            </div>

            <div className="user-card-body">
              <div className="user-detail">
                <span className="detail-label">Department:</span>
                <span className="detail-value">{u.department || 'Not specified'}</span>
              </div>

              <div className="user-detail">
                <span className="detail-label">Joined:</span>
                <span className="detail-value">
                  {new Date(u.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="user-detail">
                <span className="detail-label">Current Role:</span>
                <span className={`role-badge ${getRoleBadgeClass(u.role)}`}>
                  {u.role}
                </span>
              </div>

              {permissions.manageUsers && u.id !== user.id && (
                <div className="user-detail">
                  <span className="detail-label">Change Role:</span>
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    className="role-select"
                  >
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="team lead">Team Lead</option>
                    <option value="developer">Developer</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
              )}

              {u.id === user.id && (
                <div className="current-user-badge">
                  You
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {users.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No Users Found</h3>
          <p>There are no users in the system yet.</p>
        </div>
      )}
    </div>
  );
}

export default Users;
