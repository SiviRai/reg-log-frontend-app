import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PasswordField from '../components/PasswordField';
import { validatePasswordSecurity } from '../utils/crypto';

const Register = () => {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Real-time password criteria evaluation
  const passwordCriteria = validatePasswordSecurity(formData.password);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^[0-9]{10}$/;

    // 1. Full Name Validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Full Name must be at least 3 characters';
    } else if (formData.fullName.trim().length > 100) {
      newErrors.fullName = 'Full Name cannot exceed 100 characters';
    }

    // 2. Email Address Validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email Address is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Must follow a valid email format (e.g. user@example.com)';
    }

    // 3. Mobile Number Validation
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!mobileRegex.test(formData.mobile.trim())) {
      newErrors.mobile = 'Mobile number must contain exactly 10 digits';
    }

    // 4. Password Security Validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!passwordCriteria.isValid) {
      newErrors.password = passwordCriteria.message;
    }

    // 5. Confirm Password Match
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm password must match the password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage({ type: '', text: '' });

    if (!validateForm()) return;

    setIsSubmitting(true);
    const result = await register({
      fullName: formData.fullName,
      email: formData.email,
      mobile: formData.mobile,
      password: formData.password
    });
    setIsSubmitting(false);

    if (result.success) {
      setStatusMessage({
        type: 'success',
        text: 'Account registered successfully! Redirecting you to Login...'
      });
      setFormData({ fullName: '', email: '', mobile: '', password: '', confirmPassword: '' });
      setTimeout(() => {
        navigate('/login', {
          state: {
            registrationSuccess: 'Registration successful! You can now login with your Email or Mobile number.'
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
            <span className="auth-badge">Customer Registration</span>
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">
              Join LuxeCart with encrypted authentication and secure access
            </p>
          </div>

          {statusMessage.text && (
            <div className={`alert ${statusMessage.type === 'success' ? 'alert-success' : 'alert-error'}`}>
              <span>{statusMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {/* Full Name */}
            <div className="form-group">
              <label htmlFor="fullName" className="form-label">
                Full Name <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <div className="form-input-container">
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Minimum 3 characters (e.g. Sivi Rai)"
                  className={`form-input ${errors.fullName ? 'input-error' : ''}`}
                  autoComplete="name"
                />
              </div>
              {errors.fullName && <span className="form-error">{errors.fullName}</span>}
            </div>

            {/* Email Address */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <div className="form-input-container">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className={`form-input ${errors.email ? 'input-error' : ''}`}
                  autoComplete="email"
                />
              </div>
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            {/* Mobile Number (10 digits) */}
            <div className="form-group">
              <label htmlFor="mobile" className="form-label">
                Mobile Number <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <div className="form-input-container">
                <input
                  type="tel"
                  id="mobile"
                  name="mobile"
                  maxLength={10}
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="10-digit mobile (e.g. 9876543210)"
                  className={`form-input ${errors.mobile ? 'input-error' : ''}`}
                  autoComplete="tel"
                />
              </div>
              {errors.mobile && <span className="form-error">{errors.mobile}</span>}
            </div>

            {/* Password */}
            <PasswordField
              id="password"
              name="password"
              label="Password"
              required={true}
              value={formData.password}
              onChange={handleChange}
              placeholder="Min 8 chars, 1 Upper, 1 Lower, 1 Num, 1 Spec"
              error={errors.password}
              autoComplete="new-password"
            />

            {/* Real-time Password Security Checklist */}
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

            {/* Confirm Password */}
            <PasswordField
              id="confirmPassword"
              name="confirmPassword"
              label="Confirm Password"
              required={true}
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              error={errors.confirmPassword}
              autoComplete="new-password"
            />

            <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-block" style={{ marginTop: '0.35rem' }}>
              {isSubmitting ? 'Validating & Encrypting...' : 'Register'}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account?{' '}
            <Link to="/login" className="auth-footer-link">
              Login here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
