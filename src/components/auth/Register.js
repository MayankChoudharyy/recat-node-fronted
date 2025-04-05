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
import { PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const result = await register(formData.name, formData.email, formData.password);
      if (result.success) {
        navigate('/chat');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="auth-container">
      <Paper className="auth-paper">
        <Avatar className="auth-avatar">
          <PersonAddIcon className="auth-avatar-icon" />
        </Avatar>
        <Typography component="h1" variant="h5" className="auth-title">
          Miki Chat
        </Typography>
        <Typography component="h2" variant="h6" className="auth-subtitle">
          Create Account
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
            id="name"
            label="Full Name"
            name="name"
            autoComplete="name"
            autoFocus
            value={formData.name}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
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
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            autoComplete="new-password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Button>
          <Box className="auth-links" sx={{ justifyContent: 'center' }}>
            <Link component={RouterLink} to="/login" className="auth-link">
              Already have an account? Sign In
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register; 