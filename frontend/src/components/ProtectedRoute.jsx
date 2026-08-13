import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token, loading } = useContext(AuthContext);

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center' }}>Loading authentication context...</div>;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="glass-card" style={{ margin: '2rem auto', maxWidth: '600px', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>403 Access Denied</h2>
        <p>You do not have authorization to view this module. Required role: {allowedRoles.join(', ')}.</p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
