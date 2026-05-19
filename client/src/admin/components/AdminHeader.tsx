import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FiBell, FiMenu, FiClock, FiUser, FiInfo } from 'react-icons/fi';

interface AdminHeaderProps {
  onMenuClick: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onMenuClick }) => {
  const location = useLocation();
  const [time, setTime] = useState(new Date());
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Live ticking date and time clock
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Title selector based on route pathname
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/admin/dashboard') || path === '/admin') return 'Dashboard Overview';
    if (path.includes('/admin/appointments')) return 'Appointments Management';
    if (path.includes('/admin/queue')) return 'Queue Command Center';
    if (path.includes('/admin/services')) return 'Services & Departments';
    if (path.includes('/admin/citizens')) return 'Citizens Database';
    if (path.includes('/admin/reports')) return 'Operational Reports & Analytics';
    if (path.includes('/admin/settings')) return 'Global System Settings';
    return 'Administration';
  };

  // Mock Notifications for the premium drop-down
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'New Priority citizen (Elderly) booked Birth Certificate slot.', time: '5m ago', read: false },
    { id: 2, text: 'Land department queue reached daily capacity limit.', time: '1h ago', read: false },
    { id: 3, text: 'Peak hours load detected at Civil Registration desk.', time: '3h ago', read: true }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <header className="h-20 bg-white border-b border-slate-200/80 px-6 md:px-8 flex items-center justify-between shrink-0 relative z-30 font-sans shadow-sm">
      
      {/* Left: Mobile Trigger & Dynamic Page Title */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick} 
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer"
        >
          <FiMenu className="text-xl" />
        </button>
        <div className="flex flex-col">
          <h2 className="text-lg md:text-xl font-extrabold text-slate-900 tracking-tight transition-all duration-300">
            {getPageTitle()}
          </h2>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-bold tracking-wider mt-0.5">
            <FiUser className="text-[11px]" />
            Arba Minch City Administration
          </span>
        </div>
      </div>

      {/* Right: Date Clock, Notifications, Admin Profile Card */}
      <div className="flex items-center gap-3.5 md:gap-5">
        
        {/* Live Date and Time */}
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200/60 rounded-2xl text-[13px] text-slate-600 font-semibold shadow-inner">
          <FiClock className="text-amber-500 shrink-0 text-sm" />
          <span className="tabular-nums font-mono leading-none mt-0.5">
            {time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} — {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>

        {/* Notifications Icon with Badge dropdown */}
        <div className="relative">
          <button 
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-3 bg-slate-50 border border-slate-200/60 rounded-2xl text-slate-600 hover:bg-slate-100 hover:text-slate-950 transition-all relative cursor-pointer shadow-sm"
          >
            <FiBell className="text-lg" />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-5 h-5 bg-amber-500 text-slate-950 font-black text-[9px] rounded-full border border-white flex items-center justify-center animate-bounce shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {notificationsOpen && (
            <>
              {/* Overlay to close */}
              <div onClick={() => setNotificationsOpen(false)} className="fixed inset-0 z-40 bg-transparent" />
              
              <div className="absolute right-0 mt-3.5 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden py-1 animate-in fade-in slide-in-from-top-3 duration-200">
                <div className="flex justify-between items-center px-4 py-3 bg-slate-50 border-b border-slate-200/80">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">System Alerts</span>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllRead} 
                      className="text-[10px] text-amber-600 hover:text-amber-700 font-bold hover:underline cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map(n => (
                    <div 
                      key={n.id} 
                      className={`px-4 py-3.5 border-b border-slate-100 last:border-0 flex items-start gap-3 transition-colors ${
                        n.read ? 'bg-white hover:bg-slate-50' : 'bg-amber-500/[0.03] hover:bg-amber-500/[0.06]'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.read ? 'bg-slate-300' : 'bg-amber-500'}`} />
                      <div className="flex flex-col gap-1">
                        <p className="text-[12px] text-slate-700 leading-normal font-medium">{n.text}</p>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">{n.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-50 px-4 py-2 border-t border-slate-200/80 text-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase leading-none">Powered by MQAMS Engine</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profile Card */}
        <div className="flex items-center gap-3 pl-1 border-l border-slate-200/80">
          
          {/* Avatar (Visual design) */}
          <div className="w-10 h-10 rounded-2xl bg-[#0f172a] text-amber-500 flex items-center justify-center font-extrabold text-sm border border-slate-800 shadow-sm shrink-0">
            SA
          </div>
          
          <div className="hidden lg:flex flex-col">
            <span className="text-xs font-bold text-slate-900 leading-none">System Admin</span>
            <span className="text-emerald-500 text-[10px] font-bold mt-1 inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
              Live Session
            </span>
          </div>

        </div>

      </div>

    </header>
  );
};

export default AdminHeader;
