import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PasswordField from '../components/PasswordField';
import { validatePasswordSecurity } from '../utils/crypto';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const identifier = location.state?.identifier || '';
  const isVerified = location.state?.verified || false;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If user tries to directly open /reset-password without verifying OTP, redirect them
  if (!isVerified || !identifier) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-card-body" style={{ textAlign: 'center' }}>
            <h2 className="auth-title" style={{ fontSize: '1.25rem', color: '#DC2626' }}>
              Verification Required
            </h2>
            <p className="auth-subtitle">
              You must verify your OTP before resetting your password.
            </p>
            <div style={{ marginTop: '1.5rem' }}>
              <Link to="/forgot-password" className="btn btn-primary">
                Go to Forgot Password
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const passwordCriteria = validatePasswordSecurity(password);

  const validateForm = () => {
    const newErrors = {};

    if (!password) {
      newErrors.password = 'New password is required';
    } else if (!passwordCriteria.isValid) {
      newErrors.password = passwordCriteria.message;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage({ type: '', text: '' });

    if (!validateForm()) return;

    setIsSubmitting(true);
    const result = await resetPassword(identifier, password);
    setIsSubmitting(false);

    if (result.success) {
      setStatusMessage({
        type: 'success',
        text: 'Password updated and encrypted successfully! Redirecting to Login...'
      });

      setTimeout(() => {
        navigate('/login', {
          state: {
            registrationSuccess: 'Your password has been reset! Please login with your new password.'
          }
        });
      }, 1600);
    } else {
      setStatusMessage({ type: 'error', text: result.message });
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-card-accent" />
        <div className="auth-card-body">
          <div className="auth-header">
            <span className="auth-badge">Security Update</span>
            <h1 className="auth-title">Reset Password</h1>
            <p className="auth-subtitle">
              Create a new secure password for <strong>{identifier}</strong>
            </p>
          </div>

          {statusMessage.text && (
            <div className={`alert ${statusMessage.type === 'success' ? 'alert-success' : 'alert-error'}`}>
              <span>{statusMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <PasswordField
              id="newPassword"
              name="newPassword"
              label="New Password"
              required={true}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
              }}
              placeholder="Enter new password"
              error={errors.password}
              autoComplete="new-password"
            />

            {/* Password Criteria Checklist */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.45)',
              padding: '0.65rem 0.85rem',
              borderRadius: '10px',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              fontSize: '0.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem'
            }}>
              <span style={{ fontWeight: 700, color: '#475569', marginBottom: '0.15rem' }}>
                Password Security Requirements:
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem' }}>
                <span style={{ color: passwordCriteria.checks.minLength ? '#059669' : '#94A3B8', fontWeight: 600 }}>
                  {passwordCriteria.checks.minLength ? '✓' : '○'} Min 8 characters
                </span>
                <span style={{ color: passwordCriteria.checks.hasUpper ? '#059669' : '#94A3B8', fontWeight: 600 }}>
                  {passwordCriteria.checks.hasUpper ? '✓' : '○'} 1 Uppercase (A-Z)
                </span>
                <span style={{ color: passwordCriteria.checks.hasLower ? '#059669' : '#94A3B8', fontWeight: 600 }}>
                  {passwordCriteria.checks.hasLower ? '✓' : '○'} 1 Lowercase (a-z)
                </span>
                <span style={{ color: passwordCriteria.checks.hasDigit ? '#059669' : '#94A3B8', fontWeight: 600 }}>
                  {passwordCriteria.checks.hasDigit ? '✓' : '○'} 1 Numeric digit (0-9)
                </span>
              </div>
              <span style={{ color: passwordCriteria.checks.hasSpecial ? '#059669' : '#94A3B8', fontWeight: 600 }}>
                {passwordCriteria.checks.hasSpecial ? '✓' : '○'} 1 Special character (!@#$%^&*)
              </span>
            </div>

            <PasswordField
              id="confirmNewPassword"
              name="confirmNewPassword"
              label="Confirm New Password"
              required={true}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
              }}
              placeholder="Confirm new password"
              error={errors.confirmPassword}
              autoComplete="new-password"
            />

            <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-block" style={{ marginTop: '0.5rem' }}>
              {isSubmitting ? 'Encrypting & Saving...' : 'Reset & Save Password'}
            </button>
          </form>

          <div className="auth-footer">
            Cancel and return to{' '}
            <Link to="/login" className="auth-footer-link">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
