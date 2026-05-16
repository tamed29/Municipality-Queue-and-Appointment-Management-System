import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import StatusBadge from '../../components/StatusBadge';
import { MdCheck, MdClose } from 'react-icons/md';

const ManageAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/admin/appointments');
      setAppointments(res.data);
    } catch (error) {
      toast.error('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/admin/appointments/${id}/status`, { status });
      toast.success(`Appointment ${status}`);
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-secondary">Manage Appointments</h1>
        <p className="text-muted text-sm mt-1">Review and approve citizen appointment requests.</p>
      </div>

      <div className="bg-card rounded-[var(--radius-card)] shadow-[var(--shadow-card)] overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-surface text-muted text-xs uppercase tracking-wider border-b border-border">
                  <th className="px-6 py-4 font-semibold">Citizen</th>
                  <th className="px-6 py-4 font-semibold">Service</th>
                  <th className="px-6 py-4 font-semibold">Date & Time</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {appointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-secondary">{appt.full_name}</div>
                      <div className="text-xs text-muted">{appt.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-secondary font-bold">{appt.service_name}</div>
                      <div className="text-[10px] text-muted uppercase font-black tracking-widest mt-0.5">{appt.department}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-secondary">
                      <div>{new Date(appt.appointment_date).toLocaleDateString()}</div>
                      <div className="text-xs font-medium text-primary mt-0.5">{appt.time_slot}</div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={appt.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      {appt.status === 'pending' && (
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => updateStatus(appt.id, 'approved')}
                            className="p-1.5 text-success hover:bg-success/10 rounded transition-colors"
                            title="Approve"
                          >
                            <MdCheck size={20} />
                          </button>
                          <button 
                            onClick={() => updateStatus(appt.id, 'cancelled')}
                            className="p-1.5 text-danger hover:bg-danger/10 rounded transition-colors"
                            title="Decline"
                          >
                            <MdClose size={20} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageAppointments;
