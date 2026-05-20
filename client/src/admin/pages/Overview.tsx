import React, { useState } from 'react';
import { useAdmin } from '../components/AdminContext';
import StatsCard from '../components/StatsCard';
import CitizenDrawer from '../components/CitizenDrawer';
import { 
  FiCalendar, 
  FiClock, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiFileText, 
  FiFastForward, 
  FiTrendingUp,
  FiCheck,
  FiX,
  FiEye
} from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';
import { toast } from 'react-hot-toast';

const Overview: React.FC = () => {
  const { 
    appointments, 
    approveAllPending, 
    callNextQueue, 
    approveAppointment, 
    rejectAppointment 
  } = useAdmin();

  // Citizen Profile Drawer State
  const [selectedCitizenId, setSelectedCitizenId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Dynamic statistics calculations for today (dynamic with static fallback)
  const todayStr = new Date().toISOString().split('T')[0];
  const todayApps = appointments.filter(app => app.date === todayStr || app.date === '2026-05-19');

  const totalToday = todayApps.length;
  // Global pending count so that future appointments booked by citizens correctly increment it
  const pendingCount = appointments.filter(app => app.status === 'Pending').length;
  // Today's active/waiting bookings (both Approved and Called/serving status)
  const approvedCount = todayApps.filter(app => app.status === 'Approved' || app.status === 'Called').length;
  // Today's completed/done appointments
  const completedCount = todayApps.filter(app => app.status === 'Completed').length;
  const priorityCount = todayApps.filter(app => app.priorityStatus === 'Priority').length;

  // Dynamic sub-city workload counts based on place of residence
  const subCityCounts = todayApps.reduce((acc, app) => {
    const sc = app.subCity || 'Secha Sub-City';
    acc[sc] = (acc[sc] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const subCities = ["Secha Sub-City", "Sikela Sub-City", "Nech Sar Sub-City", "Kulfo Sub-City", "Abaya Sub-City"];
  const subCityData = subCities.map(sc => {
    const count = subCityCounts[sc] || 0;
    const percentage = totalToday > 0 ? (count / totalToday) * 100 : 0;
    return { name: sc, count, percentage };
  }).sort((a, b) => b.count - a.count);

  const highestSubCity = subCityData[0];
  const needsMoreCounters = highestSubCity && highestSubCity.count > 0;

  // Chart data formatting: appointments per department today
  const departmentCounts = todayApps.reduce((acc, app) => {
    acc[app.department] = (acc[app.department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = [
    { name: 'Civil Reg', count: departmentCounts['Civil Reg'] || 0, fill: '#3b82f6' },
    { name: 'Residence', count: departmentCounts['Residence'] || 0, fill: '#10b981' },
    { name: 'Business', count: departmentCounts['Business'] || 0, fill: '#f59e0b' },
    { name: 'Land', count: departmentCounts['Land'] || 0, fill: '#8b5cf6' },
    { name: 'Tax', count: departmentCounts['Tax'] || 0, fill: '#f97316' },
    { name: 'Construction', count: departmentCounts['Construction'] || 0, fill: '#06b6d4' },
    { name: 'Public', count: departmentCounts['Public'] || 0, fill: '#ec4899' }
  ];

  // Hourly breakdown of today's bookings: 08:00 to 18:00 in 2-hour increments
  const hourlyData = [
    { time: '08:00', count: 0 },
    { time: '10:00', count: 0 },
    { time: '12:00', count: 0 },
    { time: '14:00', count: 0 },
    { time: '16:00', count: 0 },
    { time: '18:00', count: 0 },
  ];

  todayApps.forEach(app => {
    let hour = 10; // default middle morning
    if (app.createdAt) {
      hour = new Date(app.createdAt).getHours();
    } else if (app.timeSlot) {
      const timeStr = app.timeSlot.toLowerCase();
      const match = timeStr.match(/(\d+):/);
      if (match) {
        let h = parseInt(match[1]);
        if (timeStr.includes('pm') && h < 12) h += 12;
        if (timeStr.includes('am') && h === 12) h = 0;
        hour = h;
      }
    }
    
    if (hour >= 8 && hour < 10) hourlyData[0].count++;
    else if (hour >= 10 && hour < 12) hourlyData[1].count++;
    else if (hour >= 12 && hour < 14) hourlyData[2].count++;
    else if (hour >= 14 && hour < 16) hourlyData[3].count++;
    else if (hour >= 16 && hour < 18) hourlyData[4].count++;
    else if (hour >= 18) hourlyData[5].count++;
  });

  // Recent Appointments Table (Last 10)
  const recentAppointments = [...appointments]
    .sort((a, b) => b.id.localeCompare(a.id)) // show newly created / walkthrough items first
    .slice(0, 10);

  const handleGenerateReport = () => {
    toast.success('Compiling daily operational metrics...');
    setTimeout(() => {
      const reportHeaders = ["Department", "Appointments Today", "Load Percentage"];
      const reportRows = chartData.map(d => [d.name, d.count, `${((d.count / (totalToday || 1)) * 100).toFixed(0)}%`]);
      
      const csvContent = "data:text/csv;charset=utf-8," 
        + reportHeaders.join(",") + "\n"
        + reportRows.map(e => e.join(",")).join("\n");
        
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `mqams_daily_summary_${todayStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Daily CSV summary report generated!');
    }, 600);
  };

  const handleCallNextOverview = () => {
    // Call next in Civil Reg as default shortcut
    callNextQueue('Civil Reg');
  };

  const handleViewCitizen = (id: string) => {
    setSelectedCitizenId(id);
    setDrawerOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-amber-500/10 text-amber-600 border border-amber-500/20';
      case 'Approved': return 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20';
      case 'Rejected': return 'bg-rose-500/10 text-rose-600 border border-rose-500/20';
      case 'Completed': return 'bg-slate-100 text-slate-500 border border-slate-200';
      default: return 'bg-orange-500/10 text-orange-600 border border-orange-500/20';
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 font-sans">
      
      {/* 5 Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
        <StatsCard 
          title="Total Today" 
          value={totalToday} 
          description="Appointments Today" 
          icon={FiCalendar} 
          colorClass="indigo" 
        />
        <StatsCard 
          title="Pending" 
          value={pendingCount} 
          description="Awaiting Approval" 
          icon={FiAlertCircle} 
          colorClass="amber" 
        />
        <StatsCard 
          title="Approved" 
          value={approvedCount} 
          description="Confirmed / Active" 
          icon={FiClock} 
          colorClass="blue" 
        />
        <StatsCard 
          title="Completed" 
          value={completedCount} 
          description="Completed Today" 
          icon={FiCheckCircle} 
          colorClass="emerald" 
        />
        <StatsCard 
          title="Priority" 
          value={priorityCount} 
          description="Priority Queue Line" 
          icon={FiTrendingUp} 
          colorClass="rose" 
        />
      </div>

      {/* Quick Action Center and Workload Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Department Load Workload Bar Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Daily Workload</span>
              <h3 className="text-slate-900 font-extrabold text-base mt-0.5">Appointments per Department</h3>
            </div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Today</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: '800', color: '#0f172a', fontSize: '12px' }}
                  itemStyle={{ fontWeight: '600', color: '#f59e0b', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={32}>
                  {chartData.map((entry, index) => (
                    <Bar key={`cell-${index}`} dataKey="count" fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Quick Action Controls Card */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between text-slate-300">
          <div>
            <div className="mb-6">
              <span className="text-amber-500 text-[10px] font-bold uppercase tracking-widest block">Operator Console</span>
              <h3 className="text-white font-extrabold text-base mt-0.5">Quick Action Panel</h3>
            </div>
            <p className="text-slate-400 text-xs font-semibold leading-relaxed mb-6">
              Trigger instant department calls, bulk authorizations, or generate structural CSV summaries in a single tap.
            </p>
          </div>

          <div className="space-y-3.5">
            <button
              onClick={approveAllPending}
              className="w-full bg-emerald-500 text-slate-950 py-3.5 rounded-2xl font-extrabold text-xs uppercase tracking-wider hover:bg-emerald-400 hover:-translate-y-0.5 transition-all shadow-md shadow-emerald-500/10 cursor-pointer flex items-center justify-center gap-2"
            >
              <FiCheckCircle className="text-sm shrink-0" /> Approve All Pending
            </button>
            <button
              onClick={handleGenerateReport}
              className="w-full bg-slate-850 hover:bg-slate-800 border border-slate-800 text-white py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <FiFileText className="text-sm shrink-0" /> Generate Daily Report
            </button>
            <button
              onClick={handleCallNextOverview}
              className="w-full bg-amber-500 text-slate-950 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-amber-400 hover:-translate-y-0.5 transition-all shadow-md shadow-amber-500/10 cursor-pointer flex items-center justify-center gap-2"
            >
              <FiFastForward className="text-sm shrink-0" /> Call Next Queue (Civil Reg)
            </button>
          </div>
        </div>

      </div>

      {/* Today's Booking Timeline LineChart */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm flex flex-col w-full">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
            <div>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Real-time Timeline</span>
              <h3 className="text-slate-900 font-extrabold text-base mt-0.5">Today's Booking Timeline (Hourly)</h3>
            </div>
          </div>
          <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider bg-amber-50 px-2 py-1 rounded-md animate-pulse">
            ● LIVE OPERATIONAL STREAM
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <LineChart data={hourlyData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                labelStyle={{ fontWeight: '850', color: '#0f172a', fontSize: '12px' }}
                itemStyle={{ fontWeight: '650', color: '#3b82f6', fontSize: '12px' }}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#3b82f6" 
                strokeWidth={3} 
                dot={{ r: 5, stroke: '#3b82f6', strokeWidth: 2, fill: '#fff' }}
                activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 2, fill: '#3b82f6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sub-City Location Workload Distribution & Counter Expansion Advisory */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Sub-City Load bars */}
        <div className="md:col-span-2 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
          <div>
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Demographics Breakdown</span>
            <h3 className="text-slate-900 font-extrabold text-base mt-0.5">Appointments by Place of Residence (Sub-City)</h3>
          </div>

          <div className="space-y-4 pt-2">
            {subCityData.map((sc) => (
              <div key={sc.name} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-850">{sc.name}</span>
                  <span className="text-slate-500 font-bold">{sc.count} bookings ({sc.percentage.toFixed(0)}%)</span>
                </div>
                <div className="w-full bg-slate-105 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${sc.percentage || 1}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Counter Expansion Advice widget based on "place" load */}
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">📍</span>
              <span className="text-amber-600 text-xs font-bold uppercase tracking-wider">Location Resource Planner</span>
            </div>

            {needsMoreCounters ? (
              <div className="space-y-3">
                <h4 className="text-slate-900 font-black text-sm uppercase tracking-wide">
                  Expansion Advisory: {highestSubCity.name}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                  Due to high booking density ({highestSubCity.count} appointments today), we suggest **increasing active counters** or deploying personnel to the {highestSubCity.name} neighborhood center immediately.
                </p>
                <div className="inline-flex items-center gap-2 bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-xl shadow-md shadow-amber-500/10">
                  ⚠️ Action Suggested: Add +1 Counter
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <h4 className="text-slate-900 font-black text-sm uppercase tracking-wide">
                  Optimal Counter Coverage
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  All municipal counters are currently operating under balanced loads. No expansion is currently needed across any sub-city locations.
                </p>
                <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-xl border border-emerald-500/20">
                  ✅ Counter Load Stable
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
            <span>Dynamic updates active</span>
            <span className="text-amber-500">Arba Minch MQAMS</span>
          </div>
        </div>

      </div>

      {/* Recent Appointments Table (Last 10 bookings) */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-5">
        
        <div className="flex justify-between items-center">
          <div>
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Real-time Stream</span>
            <h3 className="text-slate-900 font-extrabold text-base mt-0.5">Recent Booking Activities</h3>
          </div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Last 10 Records</span>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider pb-3">
                <th className="pb-3 pr-4">Ticket#</th>
                <th className="pb-3 px-4">Citizen Name</th>
                <th className="pb-3 px-4">Service</th>
                <th className="pb-3 px-4">Department</th>
                <th className="pb-3 px-4">Time Slot</th>
                <th className="pb-3 px-4">Status</th>
                <th className="pb-3 pl-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-600">
              {recentAppointments.map(app => (
                <tr key={app.id} className="hover:bg-slate-50/45 transition-colors">
                  <td className="py-3.5 pr-4 font-bold text-slate-900 tabular-nums">{app.id}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{app.citizenName}</td>
                  <td className="py-3.5 px-4 text-[13.5px]">{app.serviceName}</td>
                  <td className="py-3.5 px-4 text-slate-400 text-xs font-bold uppercase tracking-wider">{app.department}</td>
                  <td className="py-3.5 px-4 tabular-nums text-[13px]">{app.timeSlot}</td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStatusBadge(app.status)}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="py-3.5 pl-4 text-right">
                    <div className="flex justify-end gap-1.5">
                      {app.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => approveAppointment(app.id)}
                            title="Approve"
                            className="p-1.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-lg hover:bg-emerald-500 hover:text-slate-950 transition-all cursor-pointer"
                          >
                            <FiCheck />
                          </button>
                          <button
                            onClick={() => rejectAppointment(app.id)}
                            title="Reject"
                            className="p-1.5 bg-rose-500/10 text-rose-600 border border-rose-500/20 rounded-lg hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
                          >
                            <FiX />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleViewCitizen(app.citizenId)}
                        title="View Citizen Profile"
                        className="p-1.5 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all cursor-pointer"
                      >
                        <FiEye />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* Citizen profile drawer overlay */}
      <CitizenDrawer 
        citizenId={selectedCitizenId}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

    </div>
  );
};

export default Overview;
