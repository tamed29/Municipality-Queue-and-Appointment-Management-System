import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminProvider } from './components/AdminContext';
import AdminSidebar from './components/AdminSidebar';
import AdminHeader from './components/AdminHeader';

const AdminDashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-800 antialiased">
      
      {/* Sidebar - Fixed Left, Drawer in Mobile */}
      <AdminSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main Board Section */}
      <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden">
        
        {/* Top Header Bar */}
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />

        {/* Dynamic Nested Page Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 p-4 md:p-8 min-w-0 custom-scrollbar animate-in fade-in duration-300">
          <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
            <Outlet />
          </div>
        </main>

      </div>

    </div>
  );
};

const AdminDashboard: React.FC = () => {
  return (
    <AdminProvider>
      <AdminDashboardLayout />
    </AdminProvider>
  );
};

export default AdminDashboard;
