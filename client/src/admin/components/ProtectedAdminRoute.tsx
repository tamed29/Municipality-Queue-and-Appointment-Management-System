import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { ADMIN_SESSION_KEY } from '../../constants/adminAuth';

const ProtectedAdminRoute: React.FC = () => {
  const adminSession = sessionStorage.getItem(ADMIN_SESSION_KEY);

  if (!adminSession) {
    // Not logged in, redirect to login page
    return <Navigate to="/admin/login" replace />;
  }

  // Logged in, render the administrative hierarchy
  return <Outlet />;
};

export default ProtectedAdminRoute;
