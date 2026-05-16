import React, { useContext } from 'react';
import { MdMenu, MdNotifications } from 'react-icons/md';
import { AuthContext } from '../store/AuthContext';

const Navbar = ({ onMenuClick }) => {
  const { user } = useContext(AuthContext);

  return (
    <header className="h-16 bg-card/80 backdrop-blur-md sticky top-0 border-b border-border flex items-center justify-between px-4 md:px-8 z-10">
      <div className="flex items-center">
        <button 
          onClick={onMenuClick}
          className="md:hidden text-secondary hover:text-primary transition-colors p-2 -ml-2 rounded-full hover:bg-surface"
        >
          <MdMenu size={24} />
        </button>
        <div className="ml-2 md:ml-0">
          <h2 className="text-sm font-bold text-secondary md:hidden">MQAMS</h2>
          <p className="hidden md:block text-xs font-medium text-muted uppercase tracking-wider">Municipality Portal</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2 md:space-x-4">

        <button className="relative p-2 text-secondary hover:text-primary transition-colors rounded-full hover:bg-surface">
          <MdNotifications size={22} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full border-2 border-card"></span>
        </button>
        
        <div className="flex items-center pl-2">
          <div className="flex flex-col items-end mr-3 hidden sm:flex">
            <span className="text-xs font-bold text-secondary leading-none">{user?.full_name}</span>
            <span className="text-[10px] text-muted font-bold uppercase tracking-tighter mt-1">{user?.role} Account</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-primary/20">
            {user?.full_name?.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
