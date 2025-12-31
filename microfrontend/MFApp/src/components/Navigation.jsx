import React, { useState, lazy, Suspense, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";

let useAuthHook = null;

const ProfileDropdownContent = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const [authModule, setAuthModule] = useState(null);

    useEffect(() => {
        import("AuthAppHost/AuthContext").then(module => {
            setAuthModule(module);
            useAuthHook = module.useAuth;
        });
    }, []);

    if (!authModule || !useAuthHook) {
        return (
            <button
                className="login-btn"
                onClick={() => navigate('/login')}
            >
                Login
            </button>
        );
    }

    const { user, logout } = useAuthHook();

    if (!user) {
        return (
            <button
                className="login-btn"
                onClick={() => navigate('/login')}
            >
                Login
            </button>
        );
    }

    return (
        <div className="profile-dropdown">
            <button
                className="profile-button"
                onClick={() => setIsOpen(!isOpen)}
            >
                <img src={user.avatar} alt={user.name} className="profile-avatar-small" />
                <span>{user.name}</span>
                <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
            </button>

            {isOpen && (
                <div className="dropdown-menu">
                    <div className="dropdown-header">
                        <div className="dropdown-user-info">
                            <strong>{user.name}</strong>
                            <span>{user.email}</span>
                        </div>
                    </div>
                    <div className="dropdown-divider"></div>
                    <button
                        className="dropdown-item"
                        onClick={() => {
                            setIsOpen(false);
                            navigate('/profile');
                        }}
                    >
                        👤 My Profile
                    </button>
                    <button
                        className="dropdown-item"
                        onClick={() => {
                            setIsOpen(false);
                            navigate('/settings');
                        }}
                    >
                        ⚙️ Settings
                    </button>
                    <div className="dropdown-divider"></div>
                    <button
                        className="dropdown-item logout"
                        onClick={() => {
                            logout();
                            setIsOpen(false);
                            navigate('/login');
                        }}
                    >
                        🚪 Logout
                    </button>
                </div>
            )}
        </div>
    );
};

const ProfileDropdown = () => {
    return (
        <Suspense fallback={
            <button className="login-btn">Loading...</button>
        }>
            <ProfileDropdownContent />
        </Suspense>
    );
};

const Navigation = () => {
    return (
        <nav className="navigation">
            <div className="nav-container">
                <div className="nav-brand">
                    <h1>Microfrontend Portal</h1>
                </div>
                <div className="nav-links">
                    <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                        Dashboard
                    </NavLink>
                    <NavLink to="/projects" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                        Projects
                    </NavLink>
                </div>
                <ProfileDropdown />
            </div>
        </nav>
    );
}

export default Navigation;
