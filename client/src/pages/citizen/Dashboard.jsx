import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { AuthContext } from '../../store/AuthContext';
import { 
  MdEventAvailable, 
  MdCheckCircle, 
  MdHistory,
  MdDateRange,
  MdWarning
} from 'react-icons/md';
import { getBlockedDates } from '../../store/blockedDatesStore';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [closures, setClosures] = useState([]);
  const [showAllClosures, setShowAllClosures] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [apptsRes] = await Promise.all([
          api.get('/appointments/my')
        ]);
        setAppointments(apptsRes.data.slice(0, 3));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchClosures = () => {
      const all = getBlockedDates();
      const todayStr = new Date().toISOString().split('T')[0];
      const filtered = all.filter(c => 
        c.date >= todayStr && 
        (c.type === 'holiday' || c.type === 'office_closure')
      ).sort((a, b) => a.date.localeCompare(b.date));
      setClosures(filtered);
    };

    fetchClosures();
    window.addEventListener('storage', fetchClosures);
    return () => window.removeEventListener('storage', fetchClosures);
  }, []);

  const conflictingAppointment = appointments.find(appt => {
    if (!appt.appointment_date) return false;
    const dateOnly = appt.appointment_date.split('T')[0];
    return closures.some(c => c.date === dateOnly);
  });

  const getConflictDetails = () => {
    if (!conflictingAppointment) return null;
    const dateOnly = conflictingAppointment.appointment_date.split('T')[0];
    return closures.find(c => c.date === dateOnly);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto w-full min-w-0">
      {/* Welcome Header */}
      <div className="mb-10 w-full">
        <h1 className="text-3xl font-bold text-secondary block w-full">Welcome back, {user?.full_name || user?.name || 'Citizen'}!</h1>
        <p className="text-muted mt-2 block w-full">Manage your municipal services and appointments efficiently.</p>
      </div>

      {conflictingAppointment && (
        <div className="mb-8 p-5 bg-rose-50 border-l-4 border-rose-500 rounded-r-3xl flex items-start gap-4 shadow-sm animate-bounce font-sans">
          <MdWarning className="text-rose-600 text-3xl shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h3 className="font-extrabold text-sm text-rose-950 uppercase tracking-wider">⚠️ Critical Scheduling Conflict Alert</h3>
            <p className="text-sm text-rose-800 font-semibold mt-1">
              You have an appointment on <span className="font-black underline">{conflictingAppointment.appointment_date.split('T')[0]}</span> for <span className="font-black">{conflictingAppointment.service_name}</span> which coincides with an upcoming office closure:
            </p>
            <p className="text-xs text-rose-750 font-bold mt-1">
              Closure Reason: <span className="font-extrabold text-rose-900">{getConflictDetails()?.title}</span> ({getConflictDetails()?.type.replace('_', ' ').toUpperCase()})
            </p>
            <div className="mt-3 flex items-center gap-3">
              <Link 
                to="/my-appointments" 
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-colors shadow-sm"
              >
                Reschedule Now
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
        {/* Quick Actions */}
        <div className="space-y-8 w-full min-w-0">
          
          {/* Quick Services Grid */}
          <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4 w-full">
            <Link to="/book-appointment" className="group bg-white p-6 rounded-[var(--radius-card)] border border-border hover:border-primary hover:shadow-lg transition-all flex items-center w-full shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mr-4 group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                <MdEventAvailable size={28} />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-secondary block w-full">Book Appointment</h3>
                <p className="text-xs text-muted mt-1 block w-full">Schedule a visit in advance</p>
              </div>
            </Link>
            <Link to="/feedback" className="group bg-white p-6 rounded-[var(--radius-card)] border border-border hover:border-primary hover:shadow-lg transition-all flex items-center w-full shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mr-4 group-hover:bg-accent group-hover:text-white transition-colors shrink-0">
                <MdHistory size={28} />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-secondary block w-full">Submit Feedback</h3>
                <p className="text-xs text-muted mt-1 block w-full">Rate our services</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Right Sidebar - Recent Appointments & Closures */}
        <div className="w-full min-w-0 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-card rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-6 border border-border w-full flex flex-col">
            <h2 className="text-xl font-bold text-secondary mb-6 flex items-center shrink-0">
              <MdEventAvailable className="mr-2 text-primary" size={24} /> 
              <span className="block">Recent Bookings</span>
            </h2>

            <div className="space-y-4 flex-1 w-full overflow-hidden">
              {appointments.length > 0 ? (
                appointments.map(appt => (
                  <div key={appt.id} className="p-4 bg-surface rounded-[var(--radius-card)] border border-border w-full flex flex-col sm:flex-row items-center sm:items-start gap-3">
                    <div className="text-center bg-white p-2 rounded shadow-sm shrink-0 min-w-[60px]">
                      <div className="text-xs font-bold text-primary uppercase">{new Date(appt.appointment_date).toLocaleDateString('en-US', { month: 'short' })}</div>
                      <div className="text-xl font-black text-secondary">{new Date(appt.appointment_date).getDate()}</div>
                    </div>
                    <div className="min-w-0 w-full text-center sm:text-left">
                      <p className="font-bold text-secondary text-sm block w-full truncate">{appt.service_name}</p>
                      <p className="text-xs text-muted block w-full">{appt.time_slot}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 w-full flex flex-col items-center">
                  <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-4 text-muted shrink-0">
                    <MdEventAvailable size={32} />
                  </div>
                  <p className="text-muted text-sm block w-full">No upcoming appointments.</p>
                  <Link to="/book-appointment" className="text-primary text-xs font-bold mt-2 hover:underline block w-full">Book your first one</Link>
                </div>
              )}
            </div>

            <Link 
              to="/my-appointments" 
              className="mt-6 w-full py-3 border border-border text-secondary text-center text-sm font-bold rounded-[var(--radius-btn)] hover:bg-surface transition-colors block shrink-0"
            >
              See All Appointments
            </Link>
          </div>

          {/* Upcoming Closures Card */}
          <div className="bg-card rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-6 border border-border w-full flex flex-col space-y-4">
            <h2 className="text-xl font-bold text-secondary flex items-center shrink-0">
              <MdDateRange className="mr-2 text-primary" size={24} /> 
              <span className="block">Office Closures</span>
            </h2>
            <p className="text-xs text-muted leading-relaxed font-medium">Upcoming holidays and planned closures where queues will be offline:</p>

            <div className="space-y-3">
              {closures.length > 0 ? (
                (showAllClosures ? closures : closures.slice(0, 3)).map(item => (
                  <div key={item.id} className="p-3.5 bg-surface border border-border rounded-[var(--radius-card)] flex items-start justify-between gap-3 text-xs">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-secondary tabular-nums">{item.date}</span>
                        <span className="text-[9px] bg-rose-50 text-rose-600 border border-rose-100 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                          {item.type === 'holiday' ? 'Holiday' : 'Closure'}
                        </span>
                      </div>
                      <h4 className="font-bold text-secondary truncate">{item.title}</h4>
                      {item.description && <p className="text-[10px] text-muted leading-snug mt-0.5">{item.description}</p>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted text-xs font-semibold">
                  No upcoming closures planned.
                </div>
              )}
            </div>

            {closures.length > 3 && (
              <button
                type="button"
                onClick={() => setShowAllClosures(!showAllClosures)}
                className="w-full text-center text-xs font-bold text-primary hover:underline pt-2 cursor-pointer bg-transparent border-0 outline-none"
              >
                {showAllClosures ? 'Show Less ▲' : `View All Closures (${closures.length}) ▼`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
