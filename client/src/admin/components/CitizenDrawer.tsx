import React, { useState, useEffect } from 'react';
import { useAdmin } from './AdminContext';
import { FiX, FiCheckSquare, FiAlertCircle, FiPhone, FiMail, FiCalendar, FiClock, FiFileText, FiTag } from 'react-icons/fi';

interface CitizenDrawerProps {
  citizenId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const CitizenDrawer: React.FC<CitizenDrawerProps> = ({ citizenId, isOpen, onClose }) => {
  const { citizens, appointments } = useAdmin();
  const [localNotes, setLocalNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Find target citizen profile
  const citizen = citizens.find(c => c.id === citizenId);

  // Sync notes from context to local state
  useEffect(() => {
    if (citizen) {
      setLocalNotes(citizen.notes || '');
    }
  }, [citizen]);

  if (!isOpen || !citizen) return null;

  // Documents list checklist logic
  const defaultChecklist = [
    'Original National Identity Card',
    'Kebele Residency ID Book / Proof of Address',
    'Certified Medical Health Form (if Priority-qualified)',
    'Original Land Deed / Transfer Agreement (if Land application)',
    'Business Trade License Draft (if Commercial registration)',
    'Notarized Marriage Contract copy'
  ];

  // Save notes locally and trigger toast/state update
  const handleSaveNotes = () => {
    setSaving(true);
    // Simulate save delay
    setTimeout(() => {
      citizen.notes = localNotes; // Update in-memory reference directly inside context state
      setSaving(false);
    }, 400);
  };

  const getPriorityBadgeColor = (type: string) => {
    switch (type) {
      case 'Elderly': return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
      case 'Disabled': return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
      case 'Pregnant': return 'bg-purple-500/10 text-purple-500 border border-purple-500/20';
      default: return 'bg-slate-100 text-slate-500 border border-slate-200';
    }
  };

  const getPriorityIcon = (type: string) => {
    switch (type) {
      case 'Elderly': return '👴';
      case 'Disabled': return '♿';
      case 'Pregnant': return '🤰';
      default: return '⚪';
    }
  };

  return (
    <>
      {/* Sliding Drawer Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 transition-all duration-300 animate-in fade-in"
      />

      {/* Drawer Body Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-2xl flex flex-col h-full border-l border-slate-200 animate-in slide-in-from-right duration-300 font-sans">
        
        {/* Top Header Controls */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200/80 bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm font-bold uppercase tracking-wider">Citizen Profile</span>
            <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full ${
              citizen.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
            }`}>
              {citizen.status}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 rounded-xl transition-all cursor-pointer"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        {/* Content Body Section */}
        <div className="flex-1 overflow-y-auto p-6 space-y-7 custom-scrollbar">
          
          {/* Section 1: Demographics Card */}
          <div className="flex items-start gap-4 p-5 bg-slate-50 border border-slate-200/60 rounded-3xl">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center font-extrabold text-white text-base shadow-sm shrink-0 uppercase">
              {citizen.fullName.split(' ').map(n => n[0]).join('').substring(0,2)}
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <h3 className="text-base font-extrabold text-slate-900 truncate leading-none mt-0.5">
                {citizen.fullName}
              </h3>
              <span className="text-slate-500 text-xs font-semibold tabular-nums mt-0.5">
                National ID: <strong className="text-slate-700">{citizen.nationalId}</strong> (Age: {citizen.age})
              </span>
              
              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${getPriorityBadgeColor(citizen.priorityType)}`}>
                  <span>{getPriorityIcon(citizen.priorityType)}</span>
                  <span>{citizen.priorityType} Queue</span>
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Contact Details */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider block border-l-3 border-amber-500 pl-2">
              Contact Channels
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="flex items-center gap-2.5 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] text-slate-700">
                <FiPhone className="text-amber-500 shrink-0" />
                <span className="font-semibold tabular-nums">{citizen.phone}</span>
              </div>
              <div className="flex items-center gap-2.5 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] text-slate-700 min-w-0">
                <FiMail className="text-blue-500 shrink-0" />
                <span className="font-semibold truncate">{citizen.email}</span>
              </div>
            </div>
          </div>

          {/* Section 3: "What to Bring" Documents Checklist */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider block border-l-3 border-amber-500 pl-2">
              "What to Bring" Checklist
            </h4>
            <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-4.5 space-y-3">
              {defaultChecklist.map((doc, idx) => {
                const hasDoc = citizen.documents.some(d => doc.toLowerCase().includes(d.toLowerCase()) || d.toLowerCase().includes(doc.toLowerCase()));
                return (
                  <label 
                    key={idx} 
                    className="flex items-start gap-3 text-[12.5px] font-semibold text-slate-700 leading-normal select-none cursor-pointer"
                  >
                    <input 
                      type="checkbox" 
                      defaultChecked={hasDoc} 
                      className="w-4 h-4 text-amber-500 border-slate-300 rounded focus:ring-amber-500 accent-amber-500 mt-0.5 shrink-0" 
                    />
                    <span className={hasDoc ? 'text-slate-400 line-through' : ''}>
                      {doc}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section 4: Administrative Notes (Editable) */}
          <div className="space-y-3.5">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider block border-l-3 border-amber-500 pl-2">
                Administrative Notes
              </h4>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Internal Staff Notes</span>
            </div>
            <div className="space-y-2">
              <textarea
                value={localNotes}
                onChange={(e) => setLocalNotes(e.target.value)}
                placeholder="Write specific notes about this citizen (medical requirements, special assistance notes, verification history...)"
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-semibold shadow-inner"
              />
              <button
                type="button"
                onClick={handleSaveNotes}
                disabled={saving}
                className="bg-amber-500 text-slate-950 font-extrabold text-[11px] uppercase tracking-wider px-4 py-2 rounded-xl hover:bg-amber-400 transition-all shadow-sm cursor-pointer ml-auto block"
              >
                {saving ? 'Saving...' : 'Save Notepad'}
              </button>
            </div>
          </div>

          {/* Section 5: Visit and Appointment History Timeline */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider block border-l-3 border-amber-500 pl-2">
              Appointment History
            </h4>
            
            {citizen.appointmentHistory && citizen.appointmentHistory.length > 0 ? (
              <div className="relative pl-6 border-l border-slate-200 space-y-6">
                {citizen.appointmentHistory.map((hist, idx) => {
                  const statusColors = {
                    Pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
                    Approved: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
                    Rejected: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
                    Completed: 'bg-slate-100 text-slate-500 border-slate-200',
                    'No-show': 'bg-orange-500/10 text-orange-600 border-orange-500/20'
                  };

                  return (
                    <div key={idx} className="relative group">
                      
                      {/* Timeline Dot Indicator */}
                      <span className="absolute -left-[31px] top-1.5 w-4 h-4 bg-white border-2 border-amber-500 rounded-full flex items-center justify-center shrink-0 z-10 shadow-sm" />

                      {/* Timeline Details */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <strong className="text-[13px] font-extrabold text-slate-800">
                            {hist.serviceName}
                          </strong>
                          <span className={`text-[9px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full border ${statusColors[hist.status]}`}>
                            {hist.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                          <span className="flex items-center gap-1"><FiCalendar /> {hist.date}</span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full" />
                          <span className="flex items-center gap-1"><FiTag /> {hist.department}</span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full" />
                          <span className="tabular-nums">Ticket: {hist.ticketNumber}</span>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 text-center text-slate-400 flex flex-col items-center gap-2">
                <FiAlertCircle className="text-xl" />
                <span className="text-xs font-semibold">No historical bookings logged.</span>
              </div>
            )}

          </div>

        </div>

        {/* Bottom Drawer Footer */}
        <div className="px-6 py-4.5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between shrink-0">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Record ID: {citizen.id}</span>
          <button 
            onClick={onClose}
            className="border border-slate-300 hover:border-slate-400 text-slate-700 bg-white font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shadow-sm"
          >
            Close Profile
          </button>
        </div>

      </div>
    </>
  );
};

export default CitizenDrawer;
