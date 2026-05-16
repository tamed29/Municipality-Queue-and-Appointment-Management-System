import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { AuthContext } from '../../store/AuthContext';
import { 
  MdEventAvailable, 
  MdQueue, 
  MdCheckCircle, 
  MdArrowForward,
  MdHistory
} from 'react-icons/md';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [queueStatus, setQueueStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [apptsRes, queueRes] = await Promise.all([
          api.get('/appointments/my'),
          api.get('/queue/my-status')
        ]);
        setAppointments(apptsRes.data.slice(0, 3));
        setQueueStatus(queueRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
        <h1 className="text-3xl font-bold text-secondary block w-full">Welcome back, {user?.full_name}!</h1>
        <p className="text-muted mt-2 block w-full">Manage your municipal services and appointments efficiently.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
        {/* Quick Actions & Queue Status */}
        <div className="lg:col-span-2 space-y-8 w-full min-w-0">
          
          {/* Active Queue Status */}
          <div className="bg-card rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-6 border-l-4 border-primary w-full min-w-0">
            <div className="flex items-center justify-between mb-6 w-full">
              <h2 className="text-xl font-bold text-secondary flex items-center shrink-0">
                <MdQueue className="mr-2 text-primary" size={24} /> 
                <span className="block">Active Queue</span>
              </h2>
              {queueStatus && (
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider shrink-0">Live</span>
              )}
            </div>

            {queueStatus ? (
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 w-full">
                <div className="text-center w-full sm:w-auto">
                  <div className="text-4xl font-black text-primary block w-full">{queueStatus.queue_number}</div>
                  <div className="text-[10px] text-muted font-bold uppercase tracking-widest mt-1 block w-full">Your Ticket</div>
                </div>
                <div className="flex-1 w-full text-center sm:text-left min-w-0">
                  <p className="text-secondary font-bold text-lg block w-full break-normal">{queueStatus.service_name}</p>
                  <p className="text-muted text-sm mt-1 block w-full">Estimated wait: <span className="text-primary font-bold">{queueStatus.estimated_wait_time} mins</span></p>
                  <Link 
                    to="/queue-status" 
                    className="inline-flex items-center text-primary text-sm font-bold mt-4 hover:underline"
                  >
                    View Full Status <MdArrowForward className="ml-1" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 w-full">
                <p className="text-muted text-sm mb-4 block w-full">You are not currently in any service queue.</p>
                <Link 
                  to="/queue-status" 
                  className="inline-block px-6 py-2 bg-primary text-white font-bold rounded-[var(--radius-btn)] hover:bg-primary/90 transition-colors shadow-md"
                >
                  Join a Queue
                </Link>
              </div>
            )}
          </div>

          {/* Quick Services Grid */}
          <div className="flex overflow-x-auto pb-6 gap-4 md:grid md:grid-cols-2 md:overflow-visible w-full scrollbar-hide snap-x scroll-pl-4">
            <Link to="/book-appointment" className="group bg-white p-6 rounded-[var(--radius-card)] border border-border hover:border-primary hover:shadow-lg transition-all flex items-center min-w-[280px] md:min-w-0 md:w-full snap-start shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mr-4 group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                <MdEventAvailable size={28} />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-secondary block w-full">Book Appointment</h3>
                <p className="text-xs text-muted mt-1 block w-full">Schedule a visit in advance</p>
              </div>
            </Link>
            <Link to="/feedback" className="group bg-white p-6 rounded-[var(--radius-card)] border border-border hover:border-primary hover:shadow-lg transition-all flex items-center min-w-[280px] md:min-w-0 md:w-full snap-start shadow-sm">
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

        {/* Right Sidebar - Recent Appointments */}
        <div className="w-full min-w-0">
          <div className="bg-card rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-6 h-full border border-border w-full flex flex-col">
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
        </div>
      </div>
    </div>
  );
}
