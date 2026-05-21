import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import CitizenLayout from './layouts/CitizenLayout';

// Auth
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Citizen
import Dashboard from './pages/citizen/Dashboard';
import BookAppointment from './pages/citizen/BookAppointment';
import MyAppointments from './pages/citizen/MyAppointments';

import Feedback from './pages/citizen/Feedback';
import Notifications from './pages/citizen/Notifications';

// Admin Redesigned
import AdminLogin from './admin/AdminLogin';
import ProtectedAdminRoute from './admin/components/ProtectedAdminRoute';
import AdminDashboard from './admin/AdminDashboard';
import Overview from './admin/pages/Overview';
import Appointments from './admin/pages/Appointments';
import QueueManagement from './admin/pages/QueueManagement';
import Services from './admin/pages/Services';
import Citizens from './admin/pages/Citizens';
import Reports from './admin/pages/Reports';
import Settings from './admin/pages/Settings';

function App() {
  useEffect(() => {
    try {
      // 1. Remove from current session if logged in as kibra
      const curUserRaw = localStorage.getItem('mqams_current_user');
      if (curUserRaw) {
        const curUser = JSON.parse(curUserRaw);
        const fullName = curUser.full_name || curUser.name || '';
        if (fullName.toLowerCase().includes('kibra') || fullName.toLowerCase().includes('tsadkan')) {
          localStorage.removeItem('mqams_current_user');
          localStorage.removeItem('token');
        }
      }

      // 2. Remove from registered users catalog
      const regUsersRaw = localStorage.getItem('mqams_registered_users');
      if (regUsersRaw) {
        const regUsers = JSON.parse(regUsersRaw);
        const cleanedUsers = regUsers.filter(u => {
          const fullName = u.fullName || u.name || u.full_name || '';
          return !(fullName.toLowerCase().includes('kibra') || fullName.toLowerCase().includes('tsadkan'));
        });
        if (cleanedUsers.length !== regUsers.length) {
          localStorage.setItem('mqams_registered_users', JSON.stringify(cleanedUsers));
        }
      }

      // 3. Remove from appointments list
      const appsRaw = localStorage.getItem('mqams_appointments');
      if (appsRaw) {
        const apps = JSON.parse(appsRaw);
        const cleanedApps = apps.filter(a => {
          const citizenName = a.citizenName || '';
          return !(citizenName.toLowerCase().includes('kibra') || citizenName.toLowerCase().includes('tsadkan'));
        });
        if (cleanedApps.length !== apps.length) {
          localStorage.setItem('mqams_appointments', JSON.stringify(cleanedApps));
        }
      }
      
      // Dispatch storage event to alert other context providers
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error('Clean up error:', e);
    }
  }, []);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Citizen Routes */}
      <Route element={<CitizenLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/book-appointment" element={<BookAppointment />} />
        <Route path="/my-appointments" element={<MyAppointments />} />
        <Route path="/dashboard/appointments" element={<MyAppointments />} />

        <Route path="/feedback" element={<Feedback />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/dashboard/notifications" element={<Notifications />} />
      </Route>

      {/* Admin Login Route */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Protected Administrative Dashboard Routes */}
      <Route element={<ProtectedAdminRoute />}>
        <Route element={<AdminDashboard />}>
          <Route path="/admin/dashboard" element={<Overview />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/appointments" element={<Appointments />} />
          <Route path="/admin/queue" element={<QueueManagement />} />
          <Route path="/admin/services" element={<Services />} />
          <Route path="/admin/citizens" element={<Citizens />} />
          <Route path="/admin/reports" element={<Reports />} />
          <Route path="/admin/settings" element={<Settings />} />
        </Route>
      </Route>
      
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;

