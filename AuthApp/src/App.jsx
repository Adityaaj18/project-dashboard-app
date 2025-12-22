import React from 'react';
import { AuthProvider } from './context/AuthContext.jsx';
import Login from './components/Login.jsx';

const App = () => {
  return (
    <AuthProvider>
      <Login />
    </AuthProvider>
  );
};

export default App;
