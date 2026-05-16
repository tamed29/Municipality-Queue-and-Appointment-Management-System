import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import StatusBadge from '../../components/StatusBadge';
import { MdDeleteOutline, MdFilterList, MdEventNote } from 'react-icons/md';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/appointments/my');
      setAppointments(res.data);
    } catch (error) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    
    try {
      await api.delete(`/appointments/${id}`);
      toast.success('Appointment cancelled');
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to cancel appointment');
    }
  };

  const filteredAppointments = filter === 'all' 
    ? appointments 
    : appointments.filter(a => a.status === filter);

  return (
    <div className="max-w-6xl mx-auto w-full min-w-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 w-full">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-secondary block w-full">My Appointments</h1>
          <p className="text-muted text-sm mt-1 block w-full">View and manage your scheduled visits.</p>
        </div>
        
        <div className="flex items-center bg-white border border-border rounded-[var(--radius-input)] px-3 py-2 shadow-sm shrink-0">
          <MdFilterList className="text-muted mr-2" size={20} />
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="bg-transparent border-none outline-none text-sm font-medium text-secondary"
          >
            <option value="all">All Appointments</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-card rounded-[var(--radius-card)] shadow-[var(--shadow-card)] overflow-hidden w-full">
        {loading ? (
          <div className="flex justify-center items-center h-64 w-full">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : filteredAppointments.length > 0 ? (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-surface text-muted text-xs uppercase tracking-wider border-b border-border">
                  <th className="px-6 py-4 font-semibold">Service</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Time</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredAppointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-secondary">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3 shrink-0">
                          <MdEventNote size={16} />
                        </div>
                        <span className="block">{appt.service_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-secondary">
                      {new Date(appt.appointment_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-secondary">{appt.time_slot}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={appt.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      {(appt.status === 'pending' || appt.status === 'approved') && (
                        <button 
                          onClick={() => handleCancel(appt.id)}
                          className="text-danger hover:bg-danger/10 p-2 rounded-full transition-colors flex items-center justify-center ml-auto"
                          title="Cancel Appointment"
                        >
                          <MdDeleteOutline size={20} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center flex flex-col items-center w-full">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400 shrink-0">
              <MdEventNote size={40} />
            </div>
            <h3 className="text-lg font-bold text-secondary mb-1 block w-full">No appointments found</h3>
            <p className="text-muted text-sm mb-6 max-w-sm block w-full">You don't have any appointments matching this filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAppointments;
