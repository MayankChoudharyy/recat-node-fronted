import React, { useState } from 'react';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
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
import { VpnKey as VpnKeyIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { resetPassword } = useAuth();
  const [formData, setFormData] = useState({
    email: location.state?.email || '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
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
    setSuccess(false);

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword(
        formData.email,
        formData.otp,
        formData.newPassword
      );
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An error occurred while resetting password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="auth-container">
      <Paper className="auth-paper">
        <Avatar className="auth-avatar">
          <VpnKeyIcon className="auth-avatar-icon" />
        </Avatar>
        <Typography component="h1" variant="h5" className="auth-title">
          Miki Chat
        </Typography>
        <Typography component="h2" variant="h6" className="auth-subtitle">
          Reset Password
        </Typography>
        
        {error && (
          <Alert severity="error" className="auth-alert">
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" className="auth-alert">
            Password has been reset successfully. Redirecting to login...
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
            value={formData.email}
            onChange={handleChange}
            disabled={!!location.state?.email}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="otp"
            label="OTP Code"
            name="otp"
            autoComplete="off"
            value={formData.otp}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="newPassword"
            label="New Password"
            type="password"
            id="newPassword"
            autoComplete="new-password"
            value={formData.newPassword}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm New Password"
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
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </Button>
          <Box className="auth-links" sx={{ justifyContent: 'center' }}>
            <Link component={RouterLink} to="/login" className="auth-link">
              Back to Login
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default ResetPassword; 