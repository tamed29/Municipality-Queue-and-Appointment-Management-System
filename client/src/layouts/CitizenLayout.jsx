import React, { useContext, useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../store/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { subscribeToStore, getMyNotifications, dismissBannerNotification } from '../store/appointmentStore';

const CitizenLayout = () => {
  const { user } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeCalls, setActiveCalls] = useState([]);

  useEffect(() => {
    if (!user) return;
    const updateCalls = () => {
      const calls = getMyNotifications(user.id).filter(
        notif => (notif.type === 'called' || notif.type === 'queue_called') && !notif.isDismissed
      );
      setActiveCalls(calls);
    };
    updateCalls();
    return subscribeToStore(updateCalls);
  }, [user]);

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <Sidebar 
        role="user" 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        {/* Called Notification Banners Stack */}
        {activeCalls.length > 0 && (
          <div className="w-full shrink-0 flex flex-col gap-2 p-4 bg-slate-950 border-b border-slate-900 z-[9999] animate-in slide-in-from-top duration-300">
            {activeCalls.map(call => (
              <div 
                key={call.id}
                className="bg-blue-600/90 border border-blue-500/30 text-white rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-blue-500/20 animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📢</span>
                  <div className="flex flex-col">
                    <strong className="text-sm font-extrabold">{call.title}</strong>
                    <span className="text-xs text-blue-100 font-semibold">{call.message}</span>
                  </div>
                </div>
                <button
                  onClick={() => dismissBannerNotification(call.id)}
                  className="bg-white text-blue-600 hover:bg-blue-50 px-5 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer shrink-0"
                >
                  OK, I'm Going
                </button>
              </div>
            ))}
          </div>
        )}
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CitizenLayout;

