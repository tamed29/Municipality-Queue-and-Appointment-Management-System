import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import StatCard from '../../components/StatCard';
import { MdPeople, MdEventNote, MdAccessTime, MdCheckCircle, MdShowChart } from 'react-icons/md';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    appointmentsToday: 0,
    activeQueue: 0,
    avgWaitTime: 0,
    completedToday: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        setStats(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const textWrapStyle = {
    maxWidth: '560px',
    width: '100%',
    whiteSpace: 'normal',
    wordBreak: 'normal',
    overflowWrap: 'normal'
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div></div>;
  }

  return (
    <div className="min-w-0">
      <div className="mb-8 min-w-0">
        <h1 className="text-2xl font-bold text-secondary break-normal">Dashboard Overview</h1>
        <p className="text-muted text-sm mt-1 block" style={textWrapStyle}>Key metrics and status of the municipality systems.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        <StatCard title="Total Users" value={stats.totalUsers} icon={<MdPeople size={24} />} color="primary" />
        <StatCard title="Today's Appts" value={stats.appointmentsToday} icon={<MdEventNote size={24} />} color="accent" />
        <StatCard title="Active Queue" value={stats.activeQueue} icon={<MdAccessTime size={24} />} color="warning" />
        <StatCard title="Completed Today" value={stats.completedToday} icon={<MdCheckCircle size={24} />} color="success" />
        <StatCard title="Avg Wait (min)" value={stats.avgWaitTime} icon={<MdShowChart size={24} />} color="danger" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-card rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-6">
          <h2 className="text-lg font-bold text-secondary mb-4">Weekly Appointments Trend</h2>
          <div className="h-64 flex items-end justify-between gap-2 border-b border-l border-border pl-2 pb-2">
            {/* Mock Chart */}
            {[45, 60, 30, 75, 90, 50, 65].map((val, i) => (
              <div key={i} className="w-full bg-primary/20 hover:bg-primary/40 rounded-t transition-colors relative group" style={{ height: `${val}%` }}>
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-secondary text-white text-xs py-1 px-2 rounded transition-opacity">
                  {val}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </div>

        <div className="bg-card rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-6">
          <h2 className="text-lg font-bold text-secondary mb-4">Live System Status</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-surface rounded">
              <span className="text-sm font-medium text-secondary">Database Connection</span>
              <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
            </div>
            <div className="flex justify-between items-center p-3 bg-surface rounded">
              <span className="text-sm font-medium text-secondary">Queue Server</span>
              <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
            </div>
            <div className="flex justify-between items-center p-3 bg-surface rounded">
              <span className="text-sm font-medium text-secondary">Email Notifications</span>
              <span className="w-2 h-2 rounded-full bg-success"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
