import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ForgotPassword = () => {
  const { requestPasswordOTP, verifyPasswordOTP } = useAuth();
  const navigate = useNavigate();

  // Step 1: Request OTP | Step 2: Enter & Verify OTP
  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [demoOtpNotification, setDemoOtpNotification] = useState(null);

  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Send OTP
  const handleRequestOTP = (e) => {
    e.preventDefault();
    setStatusMessage({ type: '', text: '' });
    setErrors({});

    if (!identifier.trim()) {
      setErrors({ identifier: 'Please enter your registered Email or Mobile number' });
      return;
    }

    setIsSubmitting(true);
    const result = requestPasswordOTP(identifier);
    setIsSubmitting(false);

    if (result.success) {
      setDemoOtpNotification(result.otp);
      setStatusMessage({
        type: 'success',
        text: `OTP has been dispatched! For testing, your OTP is: ${result.otp}`
      });
      setStep(2);
    } else {
      setStatusMessage({ type: 'error', text: result.message });
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = (e) => {
    e.preventDefault();
    setStatusMessage({ type: '', text: '' });
    setErrors({});

    if (!otp.trim()) {
      setErrors({ otp: 'Please enter the 6-digit OTP' });
      return;
    }

    if (otp.trim().length !== 6) {
      setErrors({ otp: 'OTP must be exactly 6 numeric digits' });
      return;
    }

    setIsSubmitting(true);
    const result = verifyPasswordOTP(identifier, otp);
    setIsSubmitting(false);

    if (result.success) {
      setStatusMessage({
        type: 'success',
        text: 'OTP verified successfully! Redirecting to Reset Password...'
      });

      setTimeout(() => {
        navigate('/reset-password', {
          state: {
            identifier: identifier,
            verified: true
          }
        });
      }, 1200);
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
            <span className="auth-badge">Account Recovery</span>
            <h1 className="auth-title">Forgot Password</h1>
            <p className="auth-subtitle">
              {step === 1
                ? 'Enter your registered Email or Mobile number to receive an OTP'
                : 'Enter the 6-digit OTP sent to your registered account'}
            </p>
          </div>

          {/* Status Alert */}
          {statusMessage.text && (
            <div className={`alert ${statusMessage.type === 'success' ? 'alert-success' : 'alert-error'}`}>
              <span>{statusMessage.text}</span>
            </div>
          )}

          {step === 1 ? (
            /* STEP 1: Enter Identifier */
            <form onSubmit={handleRequestOTP} className="auth-form" noValidate>
              <div className="form-group">
                <label htmlFor="identifier" className="form-label">
                  Registered Email or Mobile Number <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <div className="form-input-container">
                  <input
                    type="text"
                    id="identifier"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. sivi@luxecart.com or 9876543210"
                    className={`form-input ${errors.identifier ? 'input-error' : ''}`}
                    autoComplete="username"
                  />
                </div>
                {errors.identifier && <span className="form-error">{errors.identifier}</span>}
              </div>

              <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-block">
                {isSubmitting ? 'Generating OTP...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            /* STEP 2: Verify OTP */
            <form onSubmit={handleVerifyOTP} className="auth-form" noValidate>
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label htmlFor="otp" className="form-label">
                    Enter 6-Digit OTP <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  {demoOtpNotification && (
                    <button
                      type="button"
                      onClick={() => setOtp(demoOtpNotification)}
                      className="btn-quick-fill"
                      style={{ fontSize: '0.72rem' }}
                    >
                      Auto-Fill OTP ({demoOtpNotification})
                    </button>
                  )}
                </div>

                <div className="form-input-container">
                  <input
                    type="text"
                    id="otp"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP (e.g. 123456)"
                    className={`form-input ${errors.otp ? 'input-error' : ''}`}
                    style={{ letterSpacing: '0.2em', fontWeight: 700, textAlign: 'center' }}
                  />
                </div>
                {errors.otp && <span className="form-error">{errors.otp}</span>}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Change Email/Mobile
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  {isSubmitting ? 'Verifying...' : 'Verify OTP'}
                </button>
              </div>
            </form>
          )}

          <div className="auth-footer">
            Remembered your password?{' '}
            <Link to="/login" className="auth-footer-link">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
