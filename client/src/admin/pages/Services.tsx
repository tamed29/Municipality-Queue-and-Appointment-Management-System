import React, { useState } from 'react';
import { useAdmin, ServiceItem, DeptSettings } from '../components/AdminContext';
import { FiClock, FiSettings, FiBriefcase, FiCheck, FiSliders, FiUsers } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const Services: React.FC = () => {
  const { 
    services, 
    deptSettings, 
    updateService, 
    updateDeptSettings 
  } = useAdmin();

  // Mode Tabs state: Services vs Department controls
  const [activeTab, setActiveTab] = useState<'services' | 'departments'>('services');

  // Inline editing state for services
  const [editingServiceName, setEditingServiceName] = useState<string | null>(null);
  const [editWaitTime, setEditWaitTime] = useState(0);
  const [editCapacity, setEditCapacity] = useState(0);

  // Active department details editing
  const [selectedDept, setSelectedDept] = useState('Civil Reg');

  const handleEditServiceClick = (svc: ServiceItem) => {
    setEditingServiceName(svc.name);
    setEditWaitTime(svc.avgWaitTime);
    setEditCapacity(svc.maxCapacity);
  };

  const handleSaveServiceClick = (svcName: string) => {
    updateService(svcName, {
      avgWaitTime: Number(editWaitTime),
      maxCapacity: Number(editCapacity)
    });
    setEditingServiceName(null);
  };

  const handleToggleServiceStatus = (svcName: string, currentStatus: 'Active' | 'Inactive') => {
    const nextStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    updateService(svcName, { status: nextStatus });
  };

  const handleDayCheckboxChange = (dept: string, day: string, checked: boolean) => {
    const settings = deptSettings[dept];
    if (!settings) return;
    
    const daysOpen = checked 
      ? [...settings.daysOpen, day]
      : settings.daysOpen.filter(d => d !== day);
      
    updateDeptSettings(dept, { daysOpen });
  };

  const handleTimeChange = (dept: string, key: 'officeHours' | 'lunchBreak', field: 'start' | 'end', val: string) => {
    const settings = deptSettings[dept];
    if (!settings) return;

    const timeObj = { ...settings[key] };
    timeObj[field] = val;

    updateDeptSettings(dept, { [key]: timeObj });
  };

  const handleStaffCountChange = (dept: string, count: number) => {
    updateDeptSettings(dept, { staffCount: count });
  };

  const departmentsList = ['Civil Reg', 'Residence', 'Business', 'Land', 'Tax', 'Construction', 'Public'];
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6 md:space-y-8 font-sans">
      
      {/* Top Section View Tabs */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm space-y-4 shrink-0">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
          <div>
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Operational Settings</span>
            <h3 className="text-slate-900 font-extrabold text-base mt-0.5">Services & Department Rules</h3>
          </div>
          
          {/* Sub Navigation Tabs */}
          <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1.5 shadow-inner">
            <button
              onClick={() => setActiveTab('services')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'services'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Services Catalog
            </button>
            <button
              onClick={() => setActiveTab('departments')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'departments'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Department Rules
            </button>
          </div>
        </div>

      </div>

      {/* TAB 1: Services Catalog list */}
      {activeTab === 'services' && (
        <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider py-4 px-6">
                  <th className="py-4 px-6">Service Name</th>
                  <th className="py-4 px-4">Department</th>
                  <th className="py-4 px-4">Avg Wait Time</th>
                  <th className="py-4 px-4">Daily capacity</th>
                  <th className="py-4 px-4">Today's Load</th>
                  <th className="py-4 px-4">State</th>
                  <th className="py-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                {services.map(svc => {
                  const isEditing = editingServiceName === svc.name;
                  const percentBooked = Math.min(100, Math.round((svc.currentlyBooked / (svc.maxCapacity || 1)) * 100));

                  return (
                    <tr key={svc.name} className="hover:bg-slate-50/45 transition-colors">
                      
                      {/* Name */}
                      <td className="py-4.5 px-6 font-bold text-slate-900">{svc.name}</td>
                      
                      {/* Dept */}
                      <td className="py-4.5 px-4 text-slate-400 text-xs font-bold uppercase tracking-wider">{svc.department}</td>
                      
                      {/* Avg wait time input */}
                      <td className="py-4.5 px-4 tabular-nums">
                        {isEditing ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              value={editWaitTime}
                              onChange={(e) => setEditWaitTime(Number(e.target.value))}
                              className="w-16 bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-semibold focus:outline-none focus:border-amber-500"
                            />
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Min</span>
                          </div>
                        ) : (
                          <span className="text-slate-800 font-semibold">{svc.avgWaitTime} mins</span>
                        )}
                      </td>

                      {/* Daily capacity input */}
                      <td className="py-4.5 px-4 tabular-nums">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editCapacity}
                            onChange={(e) => setEditCapacity(Number(e.target.value))}
                            className="w-20 bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-semibold focus:outline-none focus:border-amber-500"
                          />
                        ) : (
                          <span className="text-slate-800 font-semibold">{svc.maxCapacity} slots</span>
                        )}
                      </td>

                      {/* Capacity progress bar */}
                      <td className="py-4.5 px-4 min-w-[160px]">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex justify-between text-[11px] font-bold uppercase text-slate-450 tabular-nums">
                            <span>{svc.currentlyBooked} Booked</span>
                            <span>{percentBooked}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                            <div 
                              style={{ width: `${percentBooked}%` }}
                              className={`h-full rounded-full transition-all duration-500 ${
                                percentBooked > 85 ? 'bg-rose-500' : percentBooked > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-4.5 px-4">
                        <button
                          onClick={() => handleToggleServiceStatus(svc.name, svc.status)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border transition-all cursor-pointer ${
                            svc.status === 'Active'
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                              : 'bg-slate-100 text-slate-400 border-slate-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${svc.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                          {svc.status}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4.5 pr-6 text-right">
                        {isEditing ? (
                          <button
                            onClick={() => handleSaveServiceClick(svc.name)}
                            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1.5 rounded-xl font-extrabold text-[10px] uppercase tracking-wider transition-all cursor-pointer shadow-sm flex items-center gap-1.5 ml-auto"
                          >
                            <FiCheck className="text-xs shrink-0" /> Save
                          </button>
                        ) : (
                          <button
                            onClick={() => handleEditServiceClick(svc)}
                            className="border border-slate-350 hover:border-slate-450 hover:text-slate-900 text-slate-600 bg-white px-3 py-1.5 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer shadow-sm ml-auto block"
                          >
                            Edit
                          </button>
                        )}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Department-level hours settings */}
      {activeTab === 'departments' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left panel list of departments */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm flex flex-col gap-2 shrink-0">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block border-b border-slate-100 pb-2">
              Select department
            </span>
            {departmentsList.map(dept => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                  selectedDept === dept
                    ? 'bg-amber-500/10 text-amber-600 border-l-4 border-l-amber-500 pl-3'
                    : 'hover:bg-slate-50 text-slate-650'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          {/* Right panel detailed forms settings */}
          <div className="lg:col-span-3 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-6">
            
            <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Department Configuration</span>
                <h3 className="text-slate-900 font-extrabold text-base mt-0.5">{selectedDept} Settings</h3>
              </div>
              <span className="text-2xl">⚙️</span>
            </div>

            {/* Grid forms settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Office Hours */}
              <div className="space-y-2 p-4 bg-slate-50 border border-slate-200/60 rounded-3xl">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider block border-l-3 border-amber-500 pl-2">
                  Office Hours
                </h4>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Open Time</label>
                    <input
                      type="time"
                      value={deptSettings[selectedDept]?.officeHours.start || '08:30'}
                      onChange={(e) => handleTimeChange(selectedDept, 'officeHours', 'start', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Close Time</label>
                    <input
                      type="time"
                      value={deptSettings[selectedDept]?.officeHours.end || '17:30'}
                      onChange={(e) => handleTimeChange(selectedDept, 'officeHours', 'end', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Lunch Break Period */}
              <div className="space-y-2 p-4 bg-slate-50 border border-slate-200/60 rounded-3xl">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider block border-l-3 border-blue-500 pl-2">
                  Lunch Break
                </h4>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Break Start</label>
                    <input
                      type="time"
                      value={deptSettings[selectedDept]?.lunchBreak.start || '12:30'}
                      onChange={(e) => handleTimeChange(selectedDept, 'lunchBreak', 'start', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Break End</label>
                    <input
                      type="time"
                      value={deptSettings[selectedDept]?.lunchBreak.end || '13:30'}
                      onChange={(e) => handleTimeChange(selectedDept, 'lunchBreak', 'end', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Staff Count on Duty */}
              <div className="space-y-3.5 p-4 bg-slate-50 border border-slate-200/60 rounded-3xl">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider block border-l-3 border-emerald-500 pl-2">
                  Desk Staff Count
                </h4>
                <div className="flex items-center gap-4 pt-2">
                  <select
                    value={deptSettings[selectedDept]?.staffCount || 3}
                    onChange={(e) => handleStaffCountChange(selectedDept, Number(e.target.value))}
                    className="bg-white border border-slate-200 rounded-xl py-2 px-4 text-xs font-semibold text-slate-750 focus:outline-none cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                      <option key={n} value={n}>{n} Staff Active</option>
                    ))}
                  </select>
                  <span className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                    Determines queue speed capacity processing algorithms.
                  </span>
                </div>
              </div>

              {/* Weekly Open Days Checkbox catalog */}
              <div className="space-y-3.5 p-4 bg-slate-50 border border-slate-200/60 rounded-3xl md:col-span-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider block border-l-3 border-purple-500 pl-2">
                  Operational Days (Days Open)
                </h4>
                <div className="flex flex-wrap gap-4 pt-2">
                  {weekDays.map(day => {
                    const isOpen = deptSettings[selectedDept]?.daysOpen.includes(day);
                    return (
                      <label 
                        key={day}
                        className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          checked={isOpen}
                          onChange={(e) => handleDayCheckboxChange(selectedDept, day, e.target.checked)}
                          className="w-4 h-4 text-amber-500 border-slate-300 rounded focus:ring-amber-500 accent-amber-500 shrink-0"
                        />
                        <span>{day}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default Services;
