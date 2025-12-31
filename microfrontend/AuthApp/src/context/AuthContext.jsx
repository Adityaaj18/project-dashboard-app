import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api.js';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedData = JSON.parse(storedUser);
        // Validate that parsed data has expected structure
        // The stored data is { user: {...}, token: '...' }
        if (parsedData && typeof parsedData === 'object' && parsedData.user && parsedData.user.id) {
          setUser(parsedData.user); // Store user object without token
        } else {
          // Invalid user data, clear it
          console.warn('Invalid user data structure in localStorage:', parsedData);
          localStorage.removeItem('user');
        }
      }
    } catch (error) {
      console.error('Failed to parse stored user data:', error);
      // Clear corrupted data
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });

      if (response.success) {
        const { user, token } = response.data;
        setUser(user);
        // Store both user and token
        localStorage.setItem('user', JSON.stringify({ user, token }));
        return user;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (name, email, password, role, department) => {
    try {
      const response = await authAPI.register({
        name,
        email,
        password,
        role,
        department
      });

      if (response.success) {
        const { user, token } = response.data;
        setUser(user);
        // Store both user and token
        localStorage.setItem('user', JSON.stringify({ user, token }));
        return user;
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const loginWithGoogle = () => {
    // Redirect to backend Google OAuth endpoint
    const backendUrl = 'http://localhost:5000';
    window.location.href = `${backendUrl}/api/auth/google`;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateProfile = async (updates) => {
    try {
      const response = await authAPI.updateProfile(updates);

      if (response.success) {
        const updatedUser = response.data;
        setUser(updatedUser);

        // Update localStorage with new user data
        const storedData = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({
          ...storedData,
          user: updatedUser
        }));

        return updatedUser;
      } else {
        throw new Error(response.message || 'Profile update failed');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
    updateProfile,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
