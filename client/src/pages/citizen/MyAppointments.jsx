import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../store/AuthContext';
import { getStoredAppointments, saveStoredAppointments, subscribeToStore, getMyAppointments, syncCitizenAppointments } from '../../store/appointmentStore';
import api from '../../api/axios';
import { serviceRequirements } from '../../data/serviceRequirements';
import { toast } from 'react-hot-toast';
import { 
  FiCalendar, FiClock, FiCheckCircle, FiAlertTriangle, FiBookOpen, 
  FiTrash2, FiFileText, FiChevronDown, FiChevronUp, FiBell 
} from 'react-icons/fi';

// Helper to lookup required documents by service name
const getRequirementsForService = (serviceName) => {
  const officeServices = {
    "Civil Registration Office": [
      { id: "CR01", name: "ID Card Issuance" },
      { id: "CR02", name: "ID Card Renewal" },
      { id: "CR03", name: "ID Replacement (Lost/Damaged)" },
      { id: "CR04", name: "Birth Certificate" },
      { id: "CR05", name: "Marriage Certificate" },
      { id: "CR06", name: "Death Certificate" },
    ],
    "Residence & Population Office": [
      { id: "RP01", name: "Residence Certificate" },
      { id: "RP02", name: "Change of Residence Address" },
      { id: "RP03", name: "Family Registration" },
      { id: "RP04", name: "Household Registration Update" },
    ],
    "Business & Trade Office": [
      { id: "BT01", name: "New Business License" },
      { id: "BT02", name: "Business License Renewal" },
      { id: "BT03", name: "Business License Cancellation" },
      { id: "BT04", name: "Trade Registration" },
    ],
    "Land & Property Office": [
      { id: "LP01", name: "Land Ownership Certificate" },
      { id: "LP02", name: "Land Transfer Service" },
      { id: "LP03", name: "Building Permit Application" },
      { id: "LP04", name: "Property Registration" },
      { id: "LP05", name: "Property Tax Service" },
    ],
    "Tax & Finance Office": [
      { id: "TF01", name: "Tax Payment" },
      { id: "TF02", name: "Tax Clearance Certificate" },
      { id: "TF03", name: "Business Tax Registration" },
      { id: "TF04", name: "Penalty Payment" },
    ],
    "Construction & Urban Planning Office": [
      { id: "CU01", name: "Construction Permit" },
      { id: "CU02", name: "Building Plan Approval" },
      { id: "CU03", name: "Renovation Permit" },
      { id: "CU04", name: "Infrastructure Service Request" },
    ],
    "Public Services Office": [
      { id: "PS01", name: "Garbage Collection Request" },
      { id: "PS02", name: "Street Maintenance Complaint" },
      { id: "PS03", name: "Water Service Registration" },
      { id: "PS04", name: "Electricity Service Registration" },
    ],
  };

  const flat = Object.values(officeServices).flat();
  const match = flat.find(
    s => s.name.toLowerCase() === serviceName.toLowerCase() || 
         serviceName.toLowerCase().includes(s.name.toLowerCase())
  );
  if (match) {
    return serviceRequirements[match.id] || [];
  }
  return [];
};

const MyAppointments = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [expandedApp, setExpandedApp] = useState(null);

  useEffect(() => {
    if (!user) return;
    
    // Sync from database immediately
    syncCitizenAppointments(user.id);

    const updateAppointments = () => {
      setAppointments(getMyAppointments(user.id));
    };
    updateAppointments();

    // Poll database for updates every 3 seconds
    const interval = setInterval(() => {
      syncCitizenAppointments(user.id);
    }, 3000);

    const unsubscribe = subscribeToStore(updateAppointments);

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [user]);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    
    const allApps = getStoredAppointments();
    const appToCancel = allApps.find(app => app.id === id);
    if (appToCancel) {
      const targetId = appToCancel.dbId || id;
      try {
        await api.delete(`/appointments/${targetId}`);
      } catch (err) {
        console.error("Failed to cancel appointment on backend:", err);
      }
    }

    const updated = allApps.map(app => {
      if (app.id === id) {
        return { 
          ...app, 
          status: 'rejected', 
          adminNote: 'Cancelled by citizen',
          updatedAt: new Date().toISOString()
        };
      }
      return app;
    });

    saveStoredAppointments(updated);
    toast.success('Appointment cancelled successfully');
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'approved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'called':
        return 'bg-blue-100 text-blue-800 border-blue-200 animate-pulse font-extrabold';
      case 'completed':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'no-show':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const filteredAppointments = (filter === 'all'
    ? appointments
    : appointments.filter(a => a.status === filter)
  ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Check if any active appointment is 'called' to display the urgent header alert
  const calledAppointment = appointments.find(a => a.status === 'called');

  return (
    <div className="max-w-5xl mx-auto w-full min-h-screen pb-20">
      
      {/* STEP 3 URGENT CALLED ALERT BANNER */}
      {calledAppointment && (
        <div className="bg-blue-600 text-white rounded-2xl p-5 mb-8 shadow-xl border border-blue-400 animate-pulse flex flex-col md:flex-row items-center gap-4 justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔔</span>
            <div>
              <h3 className="font-black text-lg tracking-tight uppercase">You are being called now!</h3>
              <p className="text-sm font-medium opacity-90 mt-0.5">
                Queue <strong className="underline text-yellow-300 text-lg">{calledAppointment.queueNumber}</strong> — Please proceed to the <strong className="text-white">{calledAppointment.department}</strong> counter immediately.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setExpandedApp(calledAppointment.id)}
            className="bg-white text-blue-700 hover:bg-slate-100 font-black text-xs uppercase tracking-widest px-5 py-2.5 rounded-xl transition-all shadow-md shrink-0"
          >
            Show Ticket
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Appointments</h1>
          <p className="text-slate-500 font-medium mt-1">Review, manage, and track your active municipal bookings.</p>
        </div>
        
        {/* Filter Dropdown */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-sm shrink-0">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Filter:</span>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-sm font-bold text-slate-800 focus:outline-none bg-transparent border-none cursor-pointer"
          >
            <option value="all">All bookings</option>
            <option value="pending">Pending Approval</option>
            <option value="approved">Confirmed</option>
            <option value="called">Called Now</option>
            <option value="completed">Completed</option>
            <option value="no-show">No-Show</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Main List */}
      <div className="space-y-4">
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map(appt => {
            const isExpanded = expandedApp === appt.id;
            const requirementsList = getRequirementsForService(appt.service);

            return (
              <div 
                key={appt.id}
                className={`bg-white border rounded-3xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md ${
                  appt.status === 'called' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-100'
                }`}
              >
                {/* Header Card Row */}
                <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center text-xl shrink-0 font-bold">
                      🎫
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-slate-400 font-mono">{appt.id}</span>
                        {appt.queueNumber && (
                          <span className="bg-slate-900 text-white text-xs font-black px-2.5 py-0.5 rounded-lg tracking-wider">
                            Queue: {appt.queueNumber}
                          </span>
                        )}
                        {appt.priorityType !== 'regular' && (
                          <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                            ⚡ Priority
                          </span>
                        )}
                      </div>
                      <h2 className="text-lg font-bold text-slate-800 mt-1">{appt.service}</h2>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">{appt.department}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto md:justify-end">
                    <div className="text-left md:text-right shrink-0">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                        <FiCalendar className="text-slate-400" />
                        <span>{new Date(appt.requestedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mt-1 justify-start md:justify-end">
                        <FiClock className="text-slate-400" />
                        <span>{appt.requestedTimeSlot}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 ml-auto md:ml-0">
                      <span className={`text-[11px] font-black px-3.5 py-1.5 rounded-full border uppercase tracking-widest ${getStatusStyle(appt.status)}`}>
                        {appt.status}
                      </span>
                      
                      <button 
                        onClick={() => setExpandedApp(isExpanded ? null : appt.id)}
                        className="p-2 hover:bg-slate-50 rounded-xl transition-all border border-slate-100"
                      >
                        {isExpanded ? <FiChevronUp className="text-slate-500" /> : <FiChevronDown className="text-slate-500" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details Pane */}
                {isExpanded && (
                  <div className="bg-slate-50/50 border-t border-slate-100 p-6 md:p-8 space-y-6">
                    
                    {/* STEP 3 Status Details Banner boxes */}
                    {appt.status === 'called' && (
                      <div className="bg-blue-50 border-l-[4px] border-blue-500 text-blue-900 p-4 rounded-r-2xl">
                        <p className="text-xs font-black uppercase tracking-wider">🔔 Called To Counter</p>
                        <p className="text-xs mt-1 font-medium">Please proceed to the {appt.department} immediately. Hand your ticket {appt.id} to the operator.</p>
                      </div>
                    )}

                    {appt.status === 'approved' && (
                      <div className="bg-emerald-50 border-l-[4px] border-emerald-500 text-emerald-900 p-4 rounded-r-2xl">
                        <p className="text-xs font-black uppercase tracking-wider">✅ Confirmed</p>
                        <p className="text-xs mt-1 font-medium">Your appointment is confirmed. Please bring all required documents listed below. Arrive 10 minutes early.</p>
                      </div>
                    )}

                    {appt.status === 'rejected' && (
                      <div className="bg-red-50 border-l-[4px] border-red-500 text-red-950 p-4 rounded-r-2xl">
                        <p className="text-xs font-black uppercase tracking-wider">❌ Not Approved</p>
                        <p className="text-xs mt-1 font-medium">Your appointment was not approved.</p>
                        {appt.adminNote && (
                          <div className="mt-2 p-2 bg-red-100/50 rounded-xl text-xs font-bold text-red-900">
                            Reason: {appt.adminNote}
                          </div>
                        )}
                        <div className="mt-4">
                          <Link 
                            to="/book-appointment"
                            className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-xl transition-all shadow-sm"
                          >
                            <FiBookOpen size={12} /> Book Again
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* What to Bring Checklist */}
                    {requirementsList.length > 0 && (
                      <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <FiFileText className="text-amber-500" />
                          <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">What to Bring Checklist</h3>
                        </div>
                        <ul className="space-y-2">
                          {requirementsList.map((req, idx) => (
                            <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 font-medium">
                              <span className="text-emerald-500 mt-0.5">✓</span>
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* History Timestamps & Internal Admin Notes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-500">
                      <div>
                        <p className="uppercase text-[9px] tracking-widest text-slate-400">Timeline</p>
                        <p className="mt-1">Booked: {new Date(appt.createdAt).toLocaleString()}</p>
                        <p className="mt-0.5">Last update: {new Date(appt.updatedAt).toLocaleString()}</p>
                      </div>
                      
                      {appt.status !== 'rejected' && appt.adminNote && (
                        <div>
                          <p className="uppercase text-[9px] tracking-widest text-slate-400">Administrative Notes</p>
                          <p className="mt-1 text-slate-700 bg-white border border-slate-100 rounded-xl p-3 shadow-inner italic font-medium">
                            "{appt.adminNote}"
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Cancel button if pending/approved */}
                    {(appt.status === 'pending' || appt.status === 'approved') && (
                      <div className="flex justify-end pt-4 border-t border-slate-200/60">
                        <button
                          onClick={() => handleCancel(appt.id)}
                          className="flex items-center gap-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm shrink-0"
                        >
                          <FiTrash2 /> Cancel Appointment
                        </button>
                      </div>
                    )}

                  </div>
                )}
              </div>
            );
          })
        ) : (
          /* STEP 10 Empty State Message */
          <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center shadow-sm flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
              🎫
            </div>
            <h3 className="text-xl font-bold text-slate-800 block w-full">You have no appointments yet</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-sm block w-full">
              Book your first appointment to get started. Appointments submitted by citizens will appear here.
            </p>
            <button 
              onClick={() => navigate('/book-appointment')}
              className="mt-6 flex items-center gap-2 bg-amber-500 text-slate-900 hover:bg-amber-400 font-black text-xs uppercase tracking-widest px-8 py-4 rounded-2xl transition-all shadow-lg shadow-amber-200"
            >
              Book an Appointment
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default MyAppointments;
