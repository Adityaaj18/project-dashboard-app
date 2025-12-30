import React, { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Layout.css';

function Layout() {
  const { user, permissions, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadgeClass = (role) => {
    const roleClasses = {
      admin: 'role-admin',
      manager: 'role-manager',
      'team lead': 'role-team-lead',
      developer: 'role-developer',
      viewer: 'role-viewer'
    };
    return roleClasses[role?.toLowerCase()] || 'role-viewer';
  };

  return (
    <div className="app-container">
      <nav className="navigation">
        <div className="nav-container">
          <div className="nav-brand">
            <h1>Microfrontend Portal</h1>
          </div>

          <div className="nav-links">
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Dashboard
            </NavLink>
            <NavLink to="/projects" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Projects
            </NavLink>
          </div>

          <div className="profile-dropdown" ref={dropdownRef}>
            <button
              className="profile-button"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <img
                src={user?.avatar}
                alt={user?.name}
                className="profile-avatar-small"
              />
              <span>{user?.name}</span>
              <span className="dropdown-arrow">▼</span>
            </button>

            {showDropdown && (
              <div className="dropdown-menu">
                <div className="dropdown-header">
                  <div className="dropdown-user-info">
                    <strong>{user?.name}</strong>
                    <span>{user?.email}</span>
                    <span className={`role-badge ${getRoleBadgeClass(user?.role)}`}>
                      {user?.role}
                    </span>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <button
                  className="dropdown-item"
                  onClick={() => {
                    navigate('/profile');
                    setShowDropdown(false);
                  }}
                >
                  👤 Profile
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => {
                    navigate('/settings');
                    setShowDropdown(false);
                  }}
                >
                  ⚙️ Settings
                </button>
                <div className="dropdown-divider"></div>
                <button
                  className="dropdown-item logout"
                  onClick={handleLogout}
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="footer">
        Microfrontend Architecture | {new Date().getFullYear()}
      </footer>
    </div>
  );
}

export default Layout;
