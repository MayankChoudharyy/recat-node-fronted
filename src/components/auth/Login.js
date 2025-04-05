import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  Box,
  Alert,
  Avatar
} from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        navigate('/chat');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="auth-container">
      <Paper className="auth-paper">
        <Avatar className="auth-avatar">
          <PersonIcon className="auth-avatar-icon" />
        </Avatar>
        <Typography component="h1" variant="h5" className="auth-title">
          Miki Chat
        </Typography>
        <Typography component="h2" variant="h6" className="auth-subtitle">
          Sign In
        </Typography>
        
        {error && (
          <Alert severity="error" className="auth-alert">
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} className="auth-form">
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={formData.email}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
          <Box className="auth-links">
            <Link component={RouterLink} to="/forgot-password" className="auth-link">
              Forgot password?
            </Link>
            <Link component={RouterLink} to="/register" className="auth-link">
              Don't have an account? Sign Up
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login; 