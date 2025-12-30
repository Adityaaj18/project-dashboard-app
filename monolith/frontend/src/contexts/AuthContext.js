import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const userData = await authAPI.getProfile();
        const perms = await authAPI.getPermissions();
        setUser(userData);
        setPermissions(perms);
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    const data = await authAPI.login({ email, password });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    const perms = await authAPI.getPermissions();
    setPermissions(perms);
    return data;
  };

  const register = async (userData) => {
    const data = await authAPI.register(userData);
    localStorage.setItem('token', data.token);
    setUser(data.user);
    const perms = await authAPI.getPermissions();
    setPermissions(perms);
    return data;
  };

  const loginWithGoogle = () => {
    authAPI.loginWithGoogle();
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setPermissions({});
  };

  const updateUser = async (userData) => {
    const updatedUser = await authAPI.updateProfile(userData);
    setUser(prev => ({ ...prev, ...updatedUser }));
    return updatedUser;
  };

  const value = {
    user,
    permissions,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
    updateUser,
    checkAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
