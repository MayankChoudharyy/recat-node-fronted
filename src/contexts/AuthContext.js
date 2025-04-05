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

const checkAuth = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    setUser(null);
    return;
  }

  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Authentication failed');
    }

    setUser(data.user);
  } catch (error) {
    localStorage.removeItem('token');
    setUser(null);
  }
}; 