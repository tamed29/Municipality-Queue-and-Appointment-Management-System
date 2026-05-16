import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../store/AuthContext';
import { 
  MdDashboard, MdEventNote, MdAccessTime, MdFeedback, 
  MdPeople, MdRoomService, MdLogout 
} from 'react-icons/md';

const Sidebar = ({ role, isOpen, onClose }) => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  const citizenLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <MdDashboard size={20} /> },
    { name: 'Book Appointment', path: '/book-appointment', icon: <MdEventNote size={20} /> },
    { name: 'My Appointments', path: '/my-appointments', icon: <MdEventNote size={20} /> },
    { name: 'Queue Status', path: '/queue-status', icon: <MdAccessTime size={20} /> },
    { name: 'Feedback', path: '/feedback', icon: <MdFeedback size={20} /> },
  ];

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <MdDashboard size={20} /> },
    { name: 'Manage Users', path: '/admin/users', icon: <MdPeople size={20} /> },
    { name: 'Manage Services', path: '/admin/services', icon: <MdRoomService size={20} /> },
    { name: 'Queue Control', path: '/admin/queue', icon: <MdAccessTime size={20} /> },
    { name: 'Appointments', path: '/admin/appointments', icon: <MdEventNote size={20} /> },
  ];

  const links = role === 'admin' ? adminLinks : citizenLinks;
  const sidebarColor = role === 'admin' ? 'bg-secondary border-r-4 border-danger' : 'bg-secondary';

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-secondary/50 backdrop-blur-sm z-20 md:hidden"
          onClick={onClose}
        ></div>
      )}

      <div className={`fixed inset-y-0 left-0 z-30 w-64 ${sidebarColor} text-white transition-transform duration-300 transform md:relative md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } flex flex-col shadow-2xl md:shadow-none`}>
      <div className="flex items-center justify-center h-16 border-b border-gray-700">
        <h1 className="text-xl font-bold tracking-tight">
          <span className="text-primary">M</span>QAMS
        </h1>
      </div>
      
      <div className="flex flex-col flex-1 overflow-y-auto mt-4 px-3 space-y-1">
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center px-3 py-2 rounded-[var(--radius-btn)] transition-colors ${
                isActive 
                  ? 'bg-primary text-white font-medium' 
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="mr-3">{link.icon}</span>
              <span className="text-[14px]">{link.name}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-sm">
            {user?.full_name?.charAt(0).toUpperCase()}
          </div>
          <div className="ml-3 truncate">
            <p className="text-sm font-medium truncate">{user?.full_name}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-300 rounded-[var(--radius-btn)] hover:bg-white/10 hover:text-white transition-colors"
        >
          <MdLogout size={18} className="mr-3" />
          Logout
        </button>
      </div>
    </div>
  </>
);
};

export default Sidebar;
