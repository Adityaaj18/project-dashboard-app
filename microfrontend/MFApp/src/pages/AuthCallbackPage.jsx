import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('AuthCallbackPage mounted');
    console.log('Current URL:', window.location.href);

    const token = searchParams.get('token');
    const userParam = searchParams.get('user');
    const errorParam = searchParams.get('error');

    console.log('Token:', token ? 'present' : 'missing');
    console.log('User param:', userParam ? 'present' : 'missing');
    console.log('Error param:', errorParam);

    if (errorParam) {
      const errorMessages = {
        'auth_failed': 'Authentication failed. Please try again.',
        'token_generation_failed': 'Failed to generate authentication token.',
      };
      setError(errorMessages[errorParam] || 'An error occurred during authentication.');
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    if (token && userParam) {
      try {
        console.log('Parsing user data...');
        const user = JSON.parse(decodeURIComponent(userParam));
        console.log('User parsed successfully:', user);

        // Store user and token in localStorage
        localStorage.setItem('user', JSON.stringify({ user, token }));
        console.log('Stored in localStorage, redirecting to dashboard...');

        // Redirect to dashboard
        setTimeout(() => {
          window.location.href = '/';
        }, 500);
      } catch (err) {
        console.error('Error parsing user data:', err);
        setError('Failed to process authentication data: ' + err.message);
        setTimeout(() => navigate('/login'), 3000);
      }
    } else {
      console.error('Missing token or user param');
      setError('Missing authentication data.');
      setTimeout(() => navigate('/login'), 3000);
    }
  }, [searchParams, navigate]);

  return (
    <div className="page-container" style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      {error ? (
        <>
          <div style={{ color: '#f85149', fontSize: '1.2rem' }}>{error}</div>
          <div style={{ color: '#8b949e' }}>Redirecting to login...</div>
        </>
      ) : (
        <>
          <div className="loading-spinner"></div>
          <div style={{ color: '#8b949e' }}>Completing authentication...</div>
        </>
      )}
    </div>
  );
};

export default AuthCallbackPage;
