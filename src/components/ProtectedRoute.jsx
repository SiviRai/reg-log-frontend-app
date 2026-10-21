import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute: Enforces authentication check before allowing access to private routes.
 * Redirects unauthenticated visitors to /login with state preservation.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        color: '#6366F1',
        fontWeight: 600,
        fontSize: '1.125rem'
      }}>
        Loading your session...
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page and remember the location they tried to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
