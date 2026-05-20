import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdNotifications as IconNotifications, MdMenu as IconMenu } from 'react-icons/md';
import { AuthContext } from '../store/AuthContext';
import { subscribeToStore, getMyUnreadCount } from '../store/appointmentStore';

const Navbar = ({ onMenuClick }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const updateCount = () => {
      setUnreadCount(getMyUnreadCount(user.id));
    };
    updateCount();
    return subscribeToStore(updateCount);
  }, [user]);


  const userName = user?.name || user?.full_name || 'Citizen';

  return (
    <header className="h-16 bg-card/80 backdrop-blur-md sticky top-0 border-b border-border flex items-center justify-between px-4 md:px-8 z-10">
      <div className="flex items-center">
        <button 
          onClick={onMenuClick}
          className="md:hidden text-secondary hover:text-primary transition-colors p-2 -ml-2 rounded-full hover:bg-surface"
        >
          <IconMenu size={24} />
        </button>
        <div className="ml-2 md:ml-0">
          <h2 className="text-sm font-bold text-secondary md:hidden">MQAMS</h2>
          <p className="hidden md:block text-xs font-medium text-muted uppercase tracking-wider">Municipality Portal</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2 md:space-x-4">

        <button 
          onClick={() => navigate('/dashboard/notifications')}
          className="relative p-2 text-secondary hover:text-primary transition-colors rounded-full hover:bg-surface"
          title="Notifications"
        >
          <IconNotifications size={22} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 min-w-4 h-4 bg-danger text-[9px] font-black text-white rounded-full flex items-center justify-center px-1 border border-card shadow-sm animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>
        
        <div className="flex items-center pl-2">
          <div className="flex flex-col items-end mr-3 hidden sm:flex">
            <span className="text-xs font-bold text-secondary leading-none">{userName}</span>
            <span className="text-[10px] text-muted font-bold uppercase tracking-tighter mt-1">Citizen Account</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-primary/20">
            {userName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
