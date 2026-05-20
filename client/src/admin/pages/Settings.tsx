import React, { useState, useEffect } from 'react';
import { useAdmin } from '../components/AdminContext';
import { FiSave, FiAlertOctagon, FiCalendar, FiPlus, FiTrash2, FiMessageSquare, FiKey, FiLock, FiInfo } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { getBlockedDates, addBlockedDate, removeBlockedDate, BlockedDate } from '../../store/blockedDatesStore';

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

  // Blocked Dates State
  const [blockedList, setBlockedList] = useState<BlockedDate[]>(() => getBlockedDates());
  const [selectedBlockDate, setSelectedBlockDate] = useState('');
  const [newType, setNewType] = useState<'holiday' | 'office_closure' | 'meeting' | 'maintenance' | 'training' | 'other'>('holiday');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [affectsAllDepts, setAffectsAllDepts] = useState(true);
  const [affectedDepts, setAffectedDepts] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const handleStorageChange = () => {
      setBlockedList(getBlockedDates());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleAddBlockedDateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBlockDate) {
      toast.error('Date is required!');
      return;
    }
    const todayStr = new Date().toISOString().split('T')[0];
    if (selectedBlockDate < todayStr) {
      toast.error('Cannot block past dates!');
      return;
    }

    const existing = blockedList.find(b => b.date === selectedBlockDate);
    if (existing) {
      toast.error(`Date is already blocked: ${existing.title}`);
      return;
    }

    if (!newTitle.trim()) {
      toast.error('Title/Reason is required!');
      return;
    }

    if (!affectsAllDepts && affectedDepts.length === 0) {
      toast.error('Please select at least one affected department!');
      return;
    }

    const newBlockedItem: BlockedDate = {
      id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      date: selectedBlockDate,
      type: newType,
      title: newTitle.trim(),
      description: newDesc.trim() || undefined,
      affectedDepartments: affectsAllDepts ? ['ALL'] : affectedDepts,
      createdBy: 'admin',
      createdAt: new Date().toISOString()
    };

    addBlockedDate(newBlockedItem);
    setBlockedList(getBlockedDates());
    toast.success(`Date ${selectedBlockDate} blocked successfully!`);

    // Reset Form
    setSelectedBlockDate('');
    setNewTitle('');
    setNewDesc('');
    setNewType('holiday');
    setAffectsAllDepts(true);
    setAffectedDepts([]);
  };

  const handleRemoveBlockedDate = (id: string, dateStr: string) => {
    removeBlockedDate(id);
    setBlockedList(getBlockedDates());
    toast.error(`Removed blocked date: ${dateStr}`);
  };

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

        {/* Office Blocked Dates Management */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Calendar Exceptions</span>
              <h3 className="text-slate-900 font-extrabold text-base mt-0.5">Office Closure & Holiday Management</h3>
            </div>
            <span className="text-xl">📅</span>
          </div>

          <form onSubmit={handleAddBlockedDateSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Closure Date</label>
                <input
                  type="date"
                  required
                  value={selectedBlockDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSelectedBlockDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2 px-4 text-xs font-semibold text-slate-750 focus:outline-none cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Closure Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2 px-4 text-xs font-semibold text-slate-750 focus:outline-none cursor-pointer"
                >
                  <option value="holiday">Public Holiday</option>
                  <option value="office_closure">Office Closure Day</option>
                  <option value="meeting">Internal Meeting</option>
                  <option value="training">Staff Training</option>
                  <option value="maintenance">System Maintenance</option>
                  <option value="other">Other Reason</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Title / Reason</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Ethiopian New Year, Server Maintenance"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 px-4 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white transition-all shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Description (Optional)</label>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Provide additional details for citizens..."
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-semibold shadow-inner"
              />
            </div>

            {/* Affected Departments Section */}
            <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Affected Departments</label>
              
              <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={affectsAllDepts}
                  onChange={(e) => {
                    setAffectsAllDepts(e.target.checked);
                    if (e.target.checked) setAffectedDepts([]);
                  }}
                  className="rounded border-slate-350 text-amber-500 focus:ring-amber-400 cursor-pointer"
                />
                ⚠️ ALL DEPARTMENTS (Full Closure)
              </label>

              {!affectsAllDepts && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200 mt-2 animate-in fade-in duration-200">
                  {[
                    { code: 'CIV', name: 'Civil Reg' },
                    { code: 'RES', name: 'Residence' },
                    { code: 'BUS', name: 'Business' },
                    { code: 'LND', name: 'Land' },
                    { code: 'TAX', name: 'Tax' },
                    { code: 'CON', name: 'Construction' },
                    { code: 'PUB', name: 'Public Services' }
                  ].map(dept => {
                    const checked = affectedDepts.includes(dept.code);
                    return (
                      <label key={dept.code} className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAffectedDepts([...affectedDepts, dept.code]);
                            } else {
                              setAffectedDepts(affectedDepts.filter(c => c !== dept.code));
                            }
                          }}
                          className="rounded border-slate-300 text-amber-500 focus:ring-amber-400 cursor-pointer"
                        />
                        {dept.name}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-950 text-white font-extrabold text-[11px] uppercase tracking-wider py-3 rounded-2xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5 animate-pulse"
            >
              <FiPlus /> Block selected date
            </button>
          </form>

          {/* List exception dates */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Upcoming Blocked Dates</span>
              <button
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="text-[10px] text-slate-500 font-bold uppercase hover:text-amber-600 transition-colors flex items-center gap-1 cursor-pointer bg-slate-50 border border-slate-200 rounded-lg px-2 py-1"
              >
                Sort: {sortOrder === 'asc' ? '📅 Earliest' : '📅 Latest'}
              </button>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar pt-1">
              {blockedList.length > 0 ? (
                [...blockedList]
                  .sort((a, b) => sortOrder === 'asc' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date))
                  .map(item => {
                    const badge = (() => {
                      switch (item.type) {
                        case 'holiday': return { icon: '🔴', text: 'Holiday', style: 'bg-red-50 text-red-650 border border-red-200/50' };
                        case 'office_closure': return { icon: '🔴', text: 'Closure', style: 'bg-red-50 text-red-650 border border-red-200/50' };
                        case 'meeting': return { icon: '🟡', text: 'Meeting', style: 'bg-amber-50 text-amber-650 border border-amber-205' };
                        case 'training': return { icon: '🔵', text: 'Training', style: 'bg-blue-50 text-blue-600 border border-blue-200/50' };
                        case 'maintenance': return { icon: 'purple', text: 'Maint.', style: 'bg-purple-50 text-purple-650 border border-purple-200/50' };
                        default: return { icon: '⚫', text: 'Other', style: 'bg-slate-50 text-slate-650 border border-slate-200' };
                      }
                    })();
                    return (
                      <div 
                        key={item.id}
                        className="p-4 bg-slate-50 hover:bg-slate-100/70 border border-slate-150 rounded-2xl flex items-start justify-between gap-3 text-xs transition-colors"
                      >
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-805 tabular-nums inline-flex items-center gap-1 shrink-0">
                              <FiCalendar className="text-amber-500" /> {item.date}
                            </span>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${badge.style}`}>
                              {badge.icon} {badge.text}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-900 truncate">{item.title}</h4>
                            {item.description && <p className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">{item.description}</p>}
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                            <span className="text-[9px] text-slate-405 font-bold uppercase tracking-wider">Restriction:</span>
                            {item.affectedDepartments.includes('ALL') ? (
                              <span className="text-[9px] bg-red-500/10 text-red-650 border border-red-500/20 font-black px-1.5 py-0.5 rounded uppercase">All Services</span>
                            ) : (
                              item.affectedDepartments.map(code => (
                                <span key={code} className="text-[9px] bg-slate-200/80 text-slate-700 font-bold px-1.5 py-0.5 rounded">{code}</span>
                              ))
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleRemoveBlockedDate(item.id, item.date)}
                          title="Remove blocked date"
                          className="p-1.5 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-xl transition-colors cursor-pointer shrink-0"
                        >
                          <FiTrash2 className="text-sm" />
                        </button>
                      </div>
                    );
                  })
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs font-semibold">
                  No upcoming calendar closures configured yet.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Settings;
