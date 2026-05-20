import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../store/AuthContext';
import { getStoredNotifications, saveStoredNotifications, subscribeToStore, getMyNotifications, markNotificationRead } from '../../store/appointmentStore';
import { FiBell, FiCheck, FiCheckSquare, FiCalendar, FiFileText, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const Notifications = () => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) return;
    const updateNotifications = () => {
      setNotifications(getMyNotifications(user.id));
    };
    updateNotifications();
    return subscribeToStore(updateNotifications);
  }, [user]);

  const handleMarkAsRead = (id) => {
    markNotificationRead(id);
  };

  const handleMarkAllAsRead = () => {
    const myNotifs = getMyNotifications(user?.id);
    myNotifs.forEach(n => {
      if (!n.isRead && n.status !== 'read') {
        markNotificationRead(n.id);
      }
    });
    toast.success('All notifications marked as read');
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'booking_confirmed':
        return <FiFileText className="text-amber-500" size={20} />;
      case 'appointment_approved':
        return <FiCheck className="text-emerald-500" size={20} />;
      case 'appointment_rejected':
        return <FiAlertCircle className="text-red-500" size={20} />;
      case 'queue_called':
        return <FiBell className="text-blue-500 animate-bounce" size={20} />;
      case 'appointment_rescheduled':
        return <FiCalendar className="text-purple-500" size={20} />;
      default:
        return <FiBell className="text-slate-500" size={20} />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full min-h-screen pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FiBell className="text-slate-800" /> Notifications
          </h1>
          <p className="text-slate-500 font-medium mt-1">Stay updated with status calls and administration feedback.</p>
        </div>

        {notifications.some(n => n.status === 'unread' || (!n.isRead && n.status !== 'read')) && (
          <button 
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider border border-slate-200 px-4 py-2.5 rounded-xl transition-all shadow-sm shrink-0"
          >
            <FiCheckSquare size={14} /> Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length > 0 ? (
          notifications.map(notif => {
            const isUnread = notif.status === 'unread' || (!notif.isRead && notif.status !== 'read');
            return (
              <div 
                key={notif.id}
                onClick={() => isUnread && handleMarkAsRead(notif.id)}
                className={`p-5 rounded-2xl border transition-all duration-200 flex items-start gap-4 cursor-pointer hover:shadow-sm ${
                  isUnread 
                    ? 'bg-white border-l-[5px] border-amber-500 border-y-slate-200 border-r-slate-200 shadow-[0_2px_8px_-3px_rgba(245,158,11,0.15)]' 
                    : 'bg-slate-50 border-l-[5px] border-slate-200 border-y-slate-100 border-r-slate-100 opacity-80'
                }`}
              >
                {/* Icon wrapper */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isUnread ? 'bg-amber-500/10' : 'bg-slate-200/50'
                }`}>
                  {getNotifIcon(notif.type)}
                </div>

                {/* Text Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className={`text-sm font-bold truncate ${isUnread ? 'text-slate-900 font-black' : 'text-slate-700'}`}>
                      {notif.title}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-bold shrink-0">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className={`text-xs mt-1 leading-relaxed ${isUnread ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>
                    {notif.message}
                  </p>
                  
                  {isUnread && (
                    <span className="inline-block text-[9px] font-black uppercase tracking-widest text-amber-600 mt-2 hover:underline">
                      • Click to mark as read
                    </span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          /* Empty State */
          <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center shadow-sm flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
              <FiBell size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 block w-full">No notifications yet</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-sm block w-full">
              You will be notified here as soon as your appointment status changes or the operator calls your queue.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Notifications;
