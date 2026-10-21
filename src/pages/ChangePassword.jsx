import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PasswordField from '../components/PasswordField';
import { validatePasswordSecurity } from '../utils/crypto';

const ChangePassword = () => {
  const { changePassword, currentUser } = useAuth();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordCriteria = validatePasswordSecurity(newPassword);

  const validateForm = () => {
    const newErrors = {};

    if (!currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (!passwordCriteria.isValid) {
      newErrors.newPassword = passwordCriteria.message;
    } else if (currentPassword === newPassword) {
      newErrors.newPassword = 'New password cannot be identical to your current password';
    }

    if (!confirmNewPassword) {
      newErrors.confirmNewPassword = 'Confirm new password is required';
    } else if (newPassword !== confirmNewPassword) {
      newErrors.confirmNewPassword = 'New passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage({ type: '', text: '' });

    if (!validateForm()) return;

    setIsSubmitting(true);
    const result = await changePassword(currentPassword, newPassword);
    setIsSubmitting(false);

    if (result.success) {
      setStatusMessage({
        type: 'success',
        text: 'Your password has been changed securely!'
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');

      setTimeout(() => {
        navigate('/');
      }, 1500);
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
            <span className="auth-badge">Account Security</span>
            <h1 className="auth-title">Change Password</h1>
            <p className="auth-subtitle">
              Update password for logged in account: <strong>{currentUser?.email}</strong>
            </p>
          </div>

          {statusMessage.text && (
            <div className={`alert ${statusMessage.type === 'success' ? 'alert-success' : 'alert-error'}`}>
              <span>{statusMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {/* Current Password */}
            <PasswordField
              id="currentPassword"
              name="currentPassword"
              label="Current Password"
              required={true}
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                if (errors.currentPassword) setErrors((prev) => ({ ...prev, currentPassword: '' }));
              }}
              placeholder="Enter your current password"
              error={errors.currentPassword}
              autoComplete="current-password"
            />

            {/* New Password */}
            <PasswordField
              id="newPassword"
              name="newPassword"
              label="New Password"
              required={true}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: '' }));
              }}
              placeholder="Enter new strong password"
              error={errors.newPassword}
              autoComplete="new-password"
            />

            {/* Criteria Checklist */}
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

            {/* Confirm New Password */}
            <PasswordField
              id="confirmNewPassword"
              name="confirmNewPassword"
              label="Confirm New Password"
              required={true}
              value={confirmNewPassword}
              onChange={(e) => {
                setConfirmNewPassword(e.target.value);
                if (errors.confirmNewPassword) setErrors((prev) => ({ ...prev, confirmNewPassword: '' }));
              }}
              placeholder="Confirm new password"
              error={errors.confirmNewPassword}
              autoComplete="new-password"
            />

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <Link to="/" className="btn btn-secondary" style={{ flex: 1 }}>
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
                style={{ flex: 1.3 }}
              >
                {isSubmitting ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
