import React, { lazy, Suspense, useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation.jsx";
import Footer from "./components/Footer.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import ProjectsPage from "./pages/ProjectsPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import { DataProvider } from "./context/DataContext.jsx";

import "./style.css";

const AppContent = ({ user, isLoading }) => {
  return (
    <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
      <div className="app-container">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute user={user} isLoading={isLoading}>
                  <ErrorBoundary>
                    <DashboardPage />
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects"
              element={
                <ProtectedRoute user={user} isLoading={isLoading}>
                  <ErrorBoundary>
                    <ProjectsPage />
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute user={user} isLoading={isLoading}>
                  <ErrorBoundary>
                    <ProfilePage />
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute user={user} isLoading={isLoading}>
                  <ErrorBoundary>
                    <SettingsPage />
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
};

const AppWithAuth = () => {
  const [AuthProvider, setAuthProvider] = useState(null);
  const [useAuth, setUseAuth] = useState(null);

  useEffect(() => {
    let isMounted = true;

    import("AuthAppHost/AuthContext")
      .then(module => {
        if (isMounted) {
          setAuthProvider(() => module.AuthProvider);
          setUseAuth(() => module.useAuth);
        }
      })
      .catch(error => {
        console.error("Failed to load AuthContext:", error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!AuthProvider || !useAuth) {
    return <div className="loading">Loading authentication...</div>;
  }

  return (
    <AuthProvider>
      <AuthConsumer useAuth={useAuth} />
    </AuthProvider>
  );
};

const AuthConsumer = ({ useAuth }) => {
  const { user, loading } = useAuth();

  return (
    <DataProvider>
      <Router>
        <AppContent user={user} isLoading={loading} />
      </Router>
    </DataProvider>
  );
};

const App = () => {
  return (
    <Suspense fallback={<div className="loading">Loading...</div>}>
      <AppWithAuth />
    </Suspense>
  );
};

export default App;
