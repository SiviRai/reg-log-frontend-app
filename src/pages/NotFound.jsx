import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NotFound = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="not-found-wrapper">
      <div className="not-found-card">
        <div className="not-found-code">404</div>
        <h1 className="not-found-title">Page Not Found</h1>
        <p className="not-found-desc">
          Oops! The page you are looking for doesn't exist or has been moved.
        </p>
        <Link
          to={isAuthenticated ? '/' : '/login'}
          className="btn btn-primary"
        >
          {isAuthenticated ? 'Back to Dashboard' : 'Back to Login'}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
