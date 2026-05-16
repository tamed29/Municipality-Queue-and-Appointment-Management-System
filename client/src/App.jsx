import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import CitizenLayout from './layouts/CitizenLayout';
import AdminLayout from './layouts/AdminLayout';

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

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageServices from './pages/admin/ManageServices';
import QueueControl from './pages/admin/QueueControl';
import ManageAppointments from './pages/admin/ManageAppointments';

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
        <Route path="/queue-status" element={<QueueStatus />} />
        <Route path="/feedback" element={<Feedback />} />
      </Route>

      {/* Admin Routes */}
      <Route element={<AdminLayout />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<ManageUsers />} />
        <Route path="/admin/services" element={<ManageServices />} />
        <Route path="/admin/queue" element={<QueueControl />} />
        <Route path="/admin/appointments" element={<ManageAppointments />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
