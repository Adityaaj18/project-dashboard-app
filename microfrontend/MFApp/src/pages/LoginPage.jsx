import React, { lazy, Suspense, useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = lazy(() => import("AuthAppHost/Login"));
const Register = lazy(() => import("AuthAppHost/Register"));

const LoginPage = () => {
    const navigate = useNavigate();
    const [showRegister, setShowRegister] = useState(false);

    const handleLoginSuccess = () => {
        navigate('/');
    };

    const handleRegisterSuccess = () => {
        navigate('/');
    };

    const switchToRegister = () => {
        setShowRegister(true);
    };

    const switchToLogin = () => {
        setShowRegister(false);
    };

    return (
        <div className="page-container">
            <Suspense fallback={<div className="loading">Loading...</div>}>
                {showRegister ? (
                    <Register
                        onRegisterSuccess={handleRegisterSuccess}
                        onSwitchToLogin={switchToLogin}
                    />
                ) : (
                    <Login
                        onLoginSuccess={handleLoginSuccess}
                        onSwitchToRegister={switchToRegister}
                    />
                )}
            </Suspense>
        </div>
    );
}

export default LoginPage;
