import React, { useState } from 'react';
import { useAdmin, Appointment } from './AdminContext';
import { FiCheck, FiX, FiCalendar, FiEye, FiDownload, FiChevronUp, FiChevronDown, FiPlusCircle, FiAlertCircle } from 'react-icons/fi';
import ReactDatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { toast } from 'react-hot-toast';
import { getBlockedDateInfo } from '../../store/blockedDatesStore';

interface AppointmentTableProps {
  appointments: Appointment[];
  onViewCitizen: (id: string) => void;
}

type SortField = 'id' | 'citizenName' | 'department' | 'date' | 'timeSlot' | 'priorityStatus' | 'status';
type SortOrder = 'asc' | 'desc';

const AppointmentTable: React.FC<AppointmentTableProps> = ({ appointments, onViewCitizen }) => {
  const { 
    approveAppointment, 
    rejectAppointment, 
    rescheduleAppointment 
  } = useAdmin();

  // Sorting State
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Checkbox Multiselect state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Reschedule Modal State
  const [rescheduleItem, setRescheduleItem] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState<Date>(new Date());
  const [newTime, setNewTime] = useState('09:00 AM');
  const [rescheduleNote, setRescheduleNote] = useState('');

  // Sorting Logic
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedAppointments = [...appointments].sort((a, b) => {
    let aVal = a[sortField] || '';
    let bVal = b[sortField] || '';

    if (sortField === 'priorityStatus') {
      aVal = a.priorityStatus === 'Priority' ? '1' : '0';
      bVal = b.priorityStatus === 'Priority' ? '1' : '0';
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Multiselect Logic
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(sortedAppointments.map(app => app.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  // Bulk Actions
  const handleBulkApprove = () => {
    if (selectedIds.length === 0) return;
    selectedIds.forEach(id => approveAppointment(id));
    toast.success(`Approved ${selectedIds.length} selected appointments!`);
    setSelectedIds([]);
  };

  const handleBulkReject = () => {
    if (selectedIds.length === 0) return;
    selectedIds.forEach(id => rejectAppointment(id));
    toast.error(`Rejected ${selectedIds.length} selected appointments.`);
    setSelectedIds([]);
  };

  const handleBulkExport = () => {
    if (selectedIds.length === 0) return;
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Ticket,Citizen Name,Department,Service,Date,Time,Status,Priority"].join(",") + "\n"
      + sortedAppointments
          .filter(app => selectedIds.includes(app.id))
          .map(app => [app.id, app.citizenName, app.department, app.serviceName, app.date, app.timeSlot, app.status, app.priorityStatus].join(","))
          .join("\n");
          
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `mqams_selected_appointments_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${selectedIds.length} appointments to CSV!`);
    setSelectedIds([]);
  };

  // Reschedule Form trigger
  const triggerReschedule = (app: Appointment) => {
    setRescheduleItem(app);
    setNewDate(new Date(app.date));
    setNewTime(app.timeSlot);
    setRescheduleNote(app.notes || '');
  };

  const handleSaveReschedule = () => {
    if (!rescheduleItem) return;
    const dateString = newDate.toISOString().split('T')[0];
    rescheduleAppointment(rescheduleItem.id, dateString, newTime, rescheduleNote);
    setRescheduleItem(null);
  };

  const getDeptCode = (dept: string) => {
    switch (dept) {
      case 'Civil Reg': return 'CIV';
      case 'Residence': return 'RES';
      case 'Business': return 'BUS';
      case 'Land': return 'LND';
      case 'Tax': return 'TAX';
      case 'Construction': return 'CON';
      case 'Public': return 'PUB';
      default: return 'ALL';
    }
  };

  // Masking National ID helper
  const maskNationalId = (id: string) => {
    if (!id) return '****';
    const cleanId = id.replace(/-/g, '');
    const lastFour = cleanId.slice(-4);
    return `****${lastFour}`;
  };

  // Badges color mapping
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-500/10 text-amber-600 border border-amber-500/20';
      case 'Approved':
        return 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20';
      case 'Rejected':
        return 'bg-rose-500/10 text-rose-600 border border-rose-500/20';
      case 'Completed':
        return 'bg-slate-100 text-slate-500 border border-slate-200';
      case 'No-show':
        return 'bg-orange-500/10 text-orange-600 border border-orange-500/20';
      default:
        return 'bg-slate-100 text-slate-600 border border-slate-200';
    }
  };

  // Sort indicators rendering
  const renderSortArrow = (field: SortField) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? <FiChevronUp className="inline ml-1" /> : <FiChevronDown className="inline ml-1" />;
  };

  return (
    <div className="flex flex-col gap-4 font-sans">
      
      {/* Bulk Action Controls Banner */}
      {selectedIds.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 p-4.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top duration-300 shadow-lg relative z-25">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
              {selectedIds.length}
            </span>
            <span className="text-slate-300 text-sm font-bold">Appointments Selected</span>
          </div>
          <div className="flex flex-wrap gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={handleBulkApprove}
              className="bg-emerald-500 text-slate-950 px-4 py-2 rounded-xl font-extrabold text-xs uppercase tracking-wider hover:bg-emerald-400 transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              <FiCheck className="text-sm shrink-0" /> Approve Selected
            </button>
            <button
              onClick={handleBulkReject}
              className="bg-rose-500 text-slate-100 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-rose-400 transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              <FiX className="text-sm shrink-0" /> Reject Selected
            </button>
            <button
              onClick={handleBulkExport}
              className="bg-slate-800 border border-slate-700 text-slate-300 hover:text-white px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-750 transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              <FiDownload className="text-sm shrink-0" /> Export CSV
            </button>
          </div>
        </div>
      )}

      {/* Main Table Grid */}
      <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            
            {/* Table Header Row */}
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                
                {/* Checkbox select-all column */}
                <th className="py-4.5 pl-6 pr-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === sortedAppointments.length && sortedAppointments.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-amber-500 border-slate-300 rounded focus:ring-amber-500 accent-amber-500 cursor-pointer"
                  />
                </th>

                <th className="py-4.5 px-4 cursor-pointer hover:text-slate-900 transition-colors" onClick={() => handleSort('id')}>
                  Ticket# {renderSortArrow('id')}
                </th>
                <th className="py-4.5 px-4 cursor-pointer hover:text-slate-900 transition-colors" onClick={() => handleSort('citizenName')}>
                  Citizen Name {renderSortArrow('citizenName')}
                </th>
                <th className="py-4.5 px-4">National ID</th>
                <th className="py-4.5 px-4 cursor-pointer hover:text-slate-900 transition-colors" onClick={() => handleSort('department')}>
                  Department & Service {renderSortArrow('department')}
                </th>
                <th className="py-4.5 px-4 cursor-pointer hover:text-slate-900 transition-colors" onClick={() => handleSort('date')}>
                  Date & Time Slot {renderSortArrow('date')}
                </th>
                <th className="py-4.5 px-4 cursor-pointer hover:text-slate-900 transition-colors" onClick={() => handleSort('priorityStatus')}>
                  Type {renderSortArrow('priorityStatus')}
                </th>
                <th className="py-4.5 px-4 cursor-pointer hover:text-slate-900 transition-colors" onClick={() => handleSort('status')}>
                  Status {renderSortArrow('status')}
                </th>
                <th className="py-4.5 pr-6 pl-4 text-right">Actions</th>

              </tr>
            </thead>

            {/* Table Body Content */}
            <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
              {sortedAppointments.length > 0 ? (
                sortedAppointments.map(app => {
                  const isChecked = selectedIds.includes(app.id);
                  return (
                    <tr 
                      key={app.id}
                      className={`hover:bg-slate-50/60 transition-colors ${isChecked ? 'bg-amber-500/[0.015]' : ''}`}
                    >
                      {/* Checkbox column */}
                      <td className="py-4 pl-6 pr-4">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleSelectOne(app.id, e.target.checked)}
                          className="w-4 h-4 text-amber-500 border-slate-300 rounded focus:ring-amber-500 accent-amber-500 cursor-pointer"
                        />
                      </td>

                      {/* Ticket ID */}
                      <td className="py-4 px-4 font-bold text-slate-900 tabular-nums">
                        {app.id}
                      </td>

                      {/* Citizen Name */}
                      <td className="py-4 px-4 font-semibold text-slate-800">
                        {app.citizenName}
                      </td>

                      {/* Masked National ID */}
                      <td className="py-4 px-4 font-semibold text-slate-500 tabular-nums">
                        {maskNationalId(app.nationalId)}
                      </td>

                      {/* Department & Service */}
                      <td className="py-4 px-4 max-w-[200px]">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-slate-900 font-semibold text-[13.5px] truncate">{app.serviceName}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{app.department}</span>
                        </div>
                      </td>

                      {/* Requested Date & Time */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-slate-900 text-[13px] font-semibold tabular-nums">{app.date}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" /> {app.timeSlot}
                          </span>
                        </div>
                      </td>

                      {/* Priority Tag */}
                      <td className="py-4 px-4">
                        {app.priorityStatus === 'Priority' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                            🔴 Priority
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
                            ⚪ Regular
                          </span>
                        )}
                      </td>

                      {/* Status Badges */}
                      <td className="py-4 px-4">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getStatusBadge(app.status)}`}>
                          {app.status}
                        </span>
                      </td>

                      {/* Interactive Actions column */}
                      <td className="py-4 pr-6 pl-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          
                          {/* Approve/Reject displayed only for Pending */}
                          {app.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => approveAppointment(app.id)}
                                title="Approve Booking"
                                className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-xl hover:bg-emerald-500 hover:text-slate-950 transition-all cursor-pointer shadow-sm"
                              >
                                <FiCheck />
                              </button>
                              <button
                                onClick={() => rejectAppointment(app.id)}
                                title="Reject Booking"
                                className="p-2 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-xl hover:bg-rose-500 hover:text-slate-100 transition-all cursor-pointer shadow-sm"
                              >
                                <FiX />
                              </button>
                            </>
                          )}

                          {/* Reschedule Button */}
                          {app.status !== 'Completed' && app.status !== 'Rejected' && (
                            <button
                              onClick={() => triggerReschedule(app)}
                              title="Reschedule Date"
                              className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-600 rounded-xl hover:bg-blue-500 hover:text-white transition-all cursor-pointer shadow-sm"
                            >
                              <span className="text-[11px] font-extrabold uppercase leading-none px-0.5">RESCH</span>
                            </button>
                          )}

                          {/* View Citizen Profile */}
                          <button
                            onClick={() => onViewCitizen(app.citizenId)}
                            title="View Citizen Details"
                            className="p-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-950 hover:text-white hover:border-slate-950 transition-all cursor-pointer shadow-sm"
                          >
                            <FiEye />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 bg-slate-50/20">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FiAlertCircle className="text-2xl" />
                      <span className="text-xs font-semibold">No appointments found matching this layout.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>
      </div>

      {/* Reschedule Modal Overlay */}
      {rescheduleItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200 font-sans">
            
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Appointment Rescheduling</span>
                <h3 className="text-base font-extrabold text-slate-900 mt-1">Ticket ID: {rescheduleItem.id}</h3>
              </div>
              <button 
                onClick={() => setRescheduleItem(null)}
                className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                <FiX />
              </button>
            </div>

            <div className="space-y-4">
              
              {/* Date selection picker */}
              <div className="space-y-2 flex flex-col">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Select New Date</label>
                <div className="relative">
                  <ReactDatePicker
                    selected={newDate}
                    onChange={(date: Date | null) => date && setNewDate(date)}
                    dateFormat="yyyy-MM-dd"
                    minDate={new Date()}
                    className="w-full bg-slate-50 border border-slate-200 hover:border-slate-350 focus:border-amber-500 rounded-2xl py-3 px-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all font-semibold cursor-pointer shadow-inner"
                  />
                  <FiCalendar className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {(() => {
                const formattedNewDate = newDate ? newDate.toISOString().split('T')[0] : '';
                const deptCode = getDeptCode(rescheduleItem.department);
                const blockedInfo = getBlockedDateInfo(formattedNewDate, deptCode);
                return blockedInfo ? (
                  <div className="p-4 bg-amber-500/10 border-l-4 border-amber-500 rounded-r-2xl flex gap-3 text-xs text-amber-950 font-medium font-sans">
                    <FiAlertCircle className="text-amber-600 text-lg shrink-0 mt-0.5" />
                    <div>
                      <p className="font-extrabold uppercase tracking-wide text-amber-700">⚠️ Rescheduling Warning</p>
                      <p className="mt-1 leading-relaxed">
                        This date (<span className="font-bold">{formattedNewDate}</span>) is marked as closed for <span className="font-bold">{rescheduleItem.department}</span>.
                      </p>
                      <p className="mt-0.5 text-amber-800 font-semibold">
                        Reason: <span className="font-extrabold text-amber-900">{blockedInfo.title}</span> ({blockedInfo.type.replace('_', ' ').toUpperCase()})
                      </p>
                      <p className="mt-1.5 text-[10px] text-amber-700 font-bold italic animate-pulse">
                        ⚠️ Saving will bypass this block. Are you sure you want to proceed?
                      </p>
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Time slot picker */}
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Select Time Slot</label>
                <select
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 hover:border-slate-350 focus:border-amber-500 rounded-2xl py-3 px-4 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all font-semibold cursor-pointer shadow-inner"
                >
                  {['08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM'].map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>

              {/* Note / Comments */}
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Rescheduling Note</label>
                <textarea
                  value={rescheduleNote}
                  onChange={(e) => setRescheduleNote(e.target.value)}
                  placeholder="Enter reason for rescheduling (e.g. office holiday adjustment, citizen request...)"
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-semibold shadow-inner"
                />
              </div>

            </div>

            <div className="flex gap-3.5 pt-2">
              <button 
                type="button"
                onClick={() => setRescheduleItem(null)}
                className="flex-1 border border-slate-300 hover:border-slate-400 text-slate-700 bg-white font-bold text-xs py-3 rounded-xl transition-all cursor-pointer shadow-sm uppercase tracking-wider"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleSaveReschedule}
                className="flex-1 bg-amber-500 text-slate-950 font-extrabold text-xs py-3 rounded-xl hover:bg-amber-400 transition-all shadow-md cursor-pointer uppercase tracking-wider"
              >
                Save Changes
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AppointmentTable;
