import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ADMIN_SESSION_KEY } from '../../constants/adminAuth';
import { toast } from 'react-hot-toast';
import { 
  FiGrid, 
  FiCalendar, 
  FiTrendingUp, 
  FiSliders, 
  FiUsers, 
  FiDatabase,
  FiLogOut,
  FiActivity
} from 'react-icons/fi';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: FiGrid },
    { name: 'Appointments', path: '/admin/appointments', icon: FiCalendar },
    { name: 'Queue Management', path: '/admin/queue', icon: FiActivity },
    { name: 'Services & Departments', path: '/admin/services', icon: FiSliders },
    { name: 'Citizens', path: '/admin/citizens', icon: FiUsers },
    { name: 'Reports', path: '/admin/reports', icon: FiTrendingUp },
    { name: 'Settings', path: '/admin/settings', icon: FiDatabase }
  ];

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    sessionStorage.removeItem('mqams_admin_email');
    toast.error('System Administrator session logged out.');
    navigate('/admin/login');
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          onClick={onClose} 
          className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-[#0f172a] border-r border-slate-800 text-slate-300 transition-transform duration-300 transform lg:translate-x-0 lg:static lg:h-screen lg:z-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        
        {/* Top Header Logo */}
        <div className="flex items-center gap-3 px-6 h-20 border-b border-slate-800 shrink-0 bg-slate-950/20">
          <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/25">
            <span className="text-slate-950 font-black text-sm">AM</span>
          </div>
          <div className="flex flex-col">
            <span className="text-white text-sm font-extrabold leading-none tracking-tight">MQAMS Admin</span>
            <span className="text-amber-500 text-[9px] font-extrabold uppercase mt-1 tracking-wider leading-none">Control Board</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-1.5 custom-scrollbar">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path === '/admin/dashboard' && location.pathname === '/admin');
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 group relative ${
                  isActive 
                    ? 'bg-amber-500/10 text-amber-500 shadow-sm border border-amber-500/20' 
                    : 'hover:bg-slate-800/60 hover:text-white border border-transparent'
                }`}
              >
                <Icon className={`text-base shrink-0 ${isActive ? 'text-amber-500' : 'text-slate-400 group-hover:text-white transition-colors'}`} />
                <span>{item.name}</span>
                {isActive && (
                  <div className="absolute right-3 w-1.5 h-1.5 bg-amber-500 rounded-full blur-[1px]"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout Section */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/10 shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2.5 w-full bg-slate-900 border border-slate-800/80 hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-400 py-3 rounded-xl text-sm font-bold text-slate-400 transition-all duration-200 cursor-pointer shadow-inner"
          >
            <FiLogOut className="text-sm shrink-0" />
            <span>Logout Panel</span>
          </button>
        </div>

      </aside>
    </>
  );
};

export default AdminSidebar;
