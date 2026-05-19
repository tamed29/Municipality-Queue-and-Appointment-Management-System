import React from 'react';
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
import QueueStatus from './pages/citizen/QueueStatus';
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
        <Route path="/queue-status" element={<QueueStatus />} />
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

