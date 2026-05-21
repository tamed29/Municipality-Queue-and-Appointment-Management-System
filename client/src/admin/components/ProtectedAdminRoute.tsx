import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { ADMIN_SESSION_KEY } from '../../constants/adminAuth';
import { AuthContext } from '../../store/AuthContext';

const ProtectedAdminRoute: React.FC = () => {
  const adminSession = sessionStorage.getItem(ADMIN_SESSION_KEY);
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-950">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-bold animate-pulse">Verifying admin session...</p>
      </div>
    );
  }

  if (!adminSession || !user || user.role !== 'admin') {
    // Not logged in as admin, redirect to admin login page
    return <Navigate to="/admin/login" replace />;
  }

  // Logged in as admin, render the administrative hierarchy
  return <Outlet />;
};

export default ProtectedAdminRoute;

