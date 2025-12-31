import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, user, isLoading }) => {
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="protected-route-loading">
        <div className="loading-spinner">Checking authentication...</div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    // Save the attempted location to redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated, render the protected content
  return children;
};

export default ProtectedRoute;
