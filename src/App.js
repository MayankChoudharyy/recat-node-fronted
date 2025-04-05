import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import Chat from './components/chat/Chat';

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route 
        path="/" 
        element={user ? <Chat /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/login" 
        element={!user ? <Login /> : <Navigate to="/" />} 
      />
      <Route 
        path="/register" 
        element={!user ? <Register /> : <Navigate to="/" />} 
      />
      <Route 
        path="/forgot-password" 
        element={!user ? <ForgotPassword /> : <Navigate to="/" />} 
      />
      <Route 
        path="/reset-password" 
        element={!user ? <ResetPassword /> : <Navigate to="/" />} 
      />
    </Routes>
  );
}

export default App; 