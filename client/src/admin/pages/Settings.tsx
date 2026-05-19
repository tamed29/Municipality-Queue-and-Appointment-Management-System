import React, { useState } from 'react';
import { useAdmin } from '../components/AdminContext';
import { FiSave, FiAlertOctagon, FiCalendar, FiPlus, FiTrash2, FiMessageSquare, FiKey, FiLock } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const Settings: React.FC = () => {
  const {
    announcementBanner,
    holidays,
    maxAppointmentsPerSlot,
    slotDuration,
    smsNotifications,
    maintenanceMode,
    updateAnnouncement,
    addHoliday,
    removeHoliday,
    updateGlobalSettings
  } = useAdmin();

  // Change Password States
  const [currPassword, setCurrPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Announcement State
  const [announcementText, setAnnouncementText] = useState(announcementBanner);

  // New Holiday Date State
  const [holidayDate, setHolidayDate] = useState('');

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currPassword || !newPassword || !confirmPassword) {
      toast.error('All password fields are required!');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match!');
      return;
    }
    toast.success('Admin password updated successfully!');
    setCurrPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleAnnouncementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateAnnouncement(announcementText);
  };

  const handleAddHolidaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!holidayDate) return;
    addHoliday(holidayDate);
    setHolidayDate('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 font-sans">
      
      {/* COLUMN 1: System settings and Announcements */}
      <div className="space-y-6 md:space-y-8">
        
        {/* Core global configuration limits */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-sans">System Controls</span>
              <h3 className="text-slate-900 font-extrabold text-base mt-0.5">Booking Configurations</h3>
            </div>
            <span className="text-xl">⚙️</span>
          </div>

          <div className="space-y-5">
            
            {/* Max Appointments per Slot */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 border border-slate-200/60 rounded-3xl">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800">Max Appointments per Slot</span>
                <span className="text-[11px] text-slate-400 font-semibold mt-0.5">Limit processing capacities per timing index.</span>
              </div>
              <input
                type="number"
                value={maxAppointmentsPerSlot}
                onChange={(e) => updateGlobalSettings({ maxAppointments: Number(e.target.value) })}
                className="w-20 bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-800 text-center focus:outline-none"
              />
            </div>

            {/* Timing Slot Duration */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 border border-slate-200/60 rounded-3xl">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800">Appointment Duration</span>
                <span className="text-[11px] text-slate-400 font-semibold mt-0.5">Define intervals for municipal service bookings.</span>
              </div>
              <select
                value={slotDuration}
                onChange={(e) => updateGlobalSettings({ slotDuration: Number(e.target.value) })}
                className="bg-white border border-slate-200 rounded-xl py-2 px-4 text-xs font-bold text-slate-750 focus:outline-none cursor-pointer"
              >
                {[15, 20, 30, 60].map(dur => (
                  <option key={dur} value={dur}>{dur} Minutes</option>
                ))}
              </select>
            </div>

            {/* SMS Notifications Toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/60 rounded-3xl">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800">SMS Notification Dispatch</span>
                <span className="text-[11px] text-slate-400 font-semibold mt-0.5">Send text reminders to citizens before arrivals.</span>
              </div>
              <button
                onClick={() => updateGlobalSettings({ smsNotifications: !smsNotifications })}
                className={`w-12 h-6.5 rounded-full p-1 transition-colors duration-250 cursor-pointer ${
                  smsNotifications ? 'bg-amber-500' : 'bg-slate-300'
                }`}
              >
                <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform duration-250 ${
                  smsNotifications ? 'translate-x-5.5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* System maintenance mode (Big scary toggle) */}
            <div className="flex items-center justify-between p-4 bg-rose-500/[0.03] border border-rose-500/15 rounded-3xl">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-rose-700 inline-flex items-center gap-1">
                  <FiAlertOctagon /> System Maintenance Mode
                </span>
                <span className="text-[11px] text-rose-550/80 font-semibold mt-0.5">Disable online bookings completely for system updates.</span>
              </div>
              <button
                onClick={() => updateGlobalSettings({ maintenanceMode: !maintenanceMode })}
                className={`w-12 h-6.5 rounded-full p-1 transition-colors duration-250 cursor-pointer ${
                  maintenanceMode ? 'bg-rose-500' : 'bg-slate-350'
                }`}
              >
                <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform duration-250 ${
                  maintenanceMode ? 'translate-x-5.5' : 'translate-x-0'
                }`} />
              </button>
            </div>

          </div>
        </div>

        {/* Change password card */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Security Settings</span>
              <h3 className="text-slate-900 font-extrabold text-base mt-0.5">Change Admin Password</h3>
            </div>
            <span className="text-xl">🔒</span>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Current Password</label>
              <input
                type="password"
                required
                value={currPassword}
                onChange={(e) => setCurrPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 px-4 text-xs font-semibold focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 px-4 text-xs font-semibold focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 px-4 text-xs font-semibold focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-amber-500 text-slate-950 px-5 py-2.5 rounded-xl font-extrabold text-[11px] uppercase tracking-wider hover:bg-amber-400 transition-all shadow-md cursor-pointer ml-auto block"
            >
              Update Password
            </button>
          </form>
        </div>

      </div>

      {/* COLUMN 2: System Announcement and Holiday dates catalog */}
      <div className="space-y-6 md:space-y-8">
        
        {/* System Announcements Banner card */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Public Broadcasts</span>
              <h3 className="text-slate-900 font-extrabold text-base mt-0.5">Announcement Banner</h3>
            </div>
            <span className="text-xl">📢</span>
          </div>

          <form onSubmit={handleAnnouncementSubmit} className="space-y-4">
            <div className="space-y-2">
              <span className="text-[11px] text-slate-400 font-semibold leading-relaxed block">
                This notice is displayed immediately on the public-facing citizen homepage to notify visitors of urgent updates, operational schedules, or priority lane policies.
              </span>
              <textarea
                required
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                placeholder="Enter alert notice description..."
                rows={4}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-semibold shadow-inner"
              />
            </div>
            <button
              type="submit"
              className="bg-amber-500 text-slate-950 px-5 py-2.5 rounded-xl font-extrabold text-[11px] uppercase tracking-wider hover:bg-amber-400 transition-all shadow-md cursor-pointer ml-auto block flex items-center gap-1.5"
            >
              <FiSave className="text-sm shrink-0" /> Publish Alert Banner
            </button>
          </form>
        </div>

        {/* Office Holidays Management */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Calendar Exceptions</span>
              <h3 className="text-slate-900 font-extrabold text-base mt-0.5">Holiday Date management</h3>
            </div>
            <span className="text-xl">🌴</span>
          </div>

          {/* Add Holiday date picker form */}
          <form onSubmit={handleAddHolidaySubmit} className="flex gap-2 items-end">
            <div className="flex-1 space-y-1.5">
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Select Exception Date</label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={holidayDate}
                  onChange={(e) => setHolidayDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2 px-4 text-xs font-semibold text-slate-750 focus:outline-none cursor-pointer"
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-slate-900 hover:bg-slate-950 text-white p-3 rounded-2xl transition-all cursor-pointer shadow-sm shrink-0"
            >
              <FiPlus />
            </button>
          </form>

          {/* List exception dates */}
          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar pt-2">
            {holidays.length > 0 ? (
              holidays.map(date => (
                <div 
                  key={date}
                  className="px-4 py-3 bg-slate-50 border border-slate-150 rounded-2xl flex items-center justify-between text-xs text-slate-700 font-semibold"
                >
                  <span className="inline-flex items-center gap-2 tabular-nums">
                    <FiCalendar className="text-amber-500 shrink-0" /> {date}
                  </span>
                  <button
                    onClick={() => removeHoliday(date)}
                    title="Remove date"
                    className="p-1.5 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs font-semibold">
                No custom office holidays configured yet.
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

export default Settings;
