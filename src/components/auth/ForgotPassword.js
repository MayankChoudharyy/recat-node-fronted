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
import { LockReset as LockResetIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const result = await forgotPassword(email);
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An error occurred while sending the reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="auth-container">
      <Paper className="auth-paper">
        <Avatar className="auth-avatar">
          <LockResetIcon className="auth-avatar-icon" />
        </Avatar>
        <Typography component="h1" variant="h5" className="auth-title">
          Miki Chat
        </Typography>
        <Typography component="h2" variant="h6" className="auth-subtitle">
          Forgot Password
        </Typography>
        
        {error && (
          <Alert severity="error" className="auth-alert">
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" className="auth-alert">
            Password reset instructions have been sent to your email.
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Instructions'}
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

export default ForgotPassword; 