import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PasswordField from '../components/PasswordField';

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    identifier: '', // Can be Email or 10-digit Mobile Number
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    if (location.state?.registrationSuccess) {
      setStatusMessage({ type: 'success', text: location.state.registrationSuccess });
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.identifier.trim()) {
      newErrors.identifier = 'Email Address or Mobile number is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage({ type: '', text: '' });

    if (!validateForm()) return;

    setIsSubmitting(true);
    const result = await login(formData.identifier, formData.password);
    setIsSubmitting(false);

    if (result.success) {
      const destination = location.state?.from?.pathname || '/';
      navigate(destination, { replace: true });
    } else {
      setStatusMessage({ type: 'error', text: result.message });
    }
  };

  // Quick fill demo customer
  const handleFillDemo = (type = 'email') => {
    setFormData({
      identifier: type === 'email' ? 'sivi@luxecart.com' : '9876543210',
      password: 'Password123!'
    });
    setErrors({});
    setStatusMessage({
      type: 'info',
      text: `Demo credentials prefilled (${type === 'email' ? 'via Email' : 'via Mobile'})! Click Login to authenticate.`
    });
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-card-accent" />
        <div className="auth-card-body">
          <div className="auth-header">
            <span className="auth-badge">Customer Authentication</span>
            <h1 className="auth-title">Customer Login</h1>
            <p className="auth-subtitle">
              Sign in with your Email Address or Mobile Number
            </p>
          </div>

          {statusMessage.text && (
            <div className={`alert ${statusMessage.type === 'success' ? 'alert-success' : statusMessage.type === 'info' ? 'alert-info' : 'alert-error'}`}>
              <span>{statusMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {/* Email Address OR Mobile Number */}
            <div className="form-group">
              <label htmlFor="identifier" className="form-label">
                Email Address or Mobile Number <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <div className="form-input-container">
                <input
                  type="text"
                  id="identifier"
                  name="identifier"
                  value={formData.identifier}
                  onChange={handleChange}
                  placeholder="name@example.com or 10-digit Mobile"
                  className={`form-input ${errors.identifier ? 'input-error' : ''}`}
                  autoComplete="username"
                />
              </div>
              {errors.identifier && <span className="form-error">{errors.identifier}</span>}
            </div>

            {/* Password Field */}
            <div>
              <PasswordField
                id="password"
                name="password"
                label="Password"
                required={true}
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your account password"
                error={errors.password}
                autoComplete="current-password"
              />
              <div style={{ textAlign: 'right', marginTop: '0.25rem' }}>
                <Link
                  to="/forgot-password"
                  style={{
                    fontSize: '0.8rem',
                    color: '#6366F1',
                    textDecoration: 'none',
                    fontWeight: 600
                  }}
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-block" style={{ marginTop: '0.35rem' }}>
              {isSubmitting ? 'Verifying & Generating JWT...' : 'Login'}
            </button>
          </form>

          {/* Demo Customer Evaluation */}
          <div className="demo-box">
            <div className="demo-box-header">
              <span>Demo Customer Credentials</span>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button type="button" onClick={() => handleFillDemo('email')} className="btn-quick-fill">
                  Email Login
                </button>
                <button type="button" onClick={() => handleFillDemo('mobile')} className="btn-quick-fill">
                  Mobile Login
                </button>
              </div>
            </div>
            <div className="demo-credentials-text">
              Email: <strong>sivi@luxecart.com</strong> | Mobile: <strong>9876543210</strong><br />
              Pass: <strong>Password123!</strong> (Meets all 5 security rules)
            </div>
          </div>

          <div className="auth-footer">
            Don't have an account yet?{' '}
            <Link to="/register" className="auth-footer-link">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
