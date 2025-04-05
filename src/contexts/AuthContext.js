import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    setUser,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

const login = async (email, password) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data;
  } catch (error) {
    throw error;
  }
};

const register = async (name, email, password) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data;
  } catch (error) {
    throw error;
  }
};

const forgotPassword = async (email) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send reset email');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

const resetPassword = async (email, otp, newPassword) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp, newPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Password reset failed');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

const logout = () => {
  localStorage.removeItem('token');
  setUser(null);
}; 