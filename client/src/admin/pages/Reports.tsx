import React, { useState } from 'react';
import { useAdmin } from '../components/AdminContext';
import { FiDownload, FiPrinter, FiCalendar, FiTrendingUp, FiClock, FiFileText, FiPercent, FiAward } from 'react-icons/fi';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { toast } from 'react-hot-toast';

const Reports: React.FC = () => {
  const { appointments } = useAdmin();

  // Date Range Picker States
  const [startDate, setStartDate] = useState('2026-05-01');
  const [endDate, setEndDate] = useState('2026-05-19');

  // Peak Hours Analysis Data today (hourly load summary)
  const peakHoursData = [
    { hour: '08:30 AM', count: 12, priority: 3 },
    { hour: '09:30 AM', count: 28, priority: 11 },
    { hour: '10:30 AM', count: 35, priority: 14 },
    { hour: '11:30 AM', count: 22, priority: 8 },
    { hour: '01:30 PM', count: 18, priority: 5 },
    { hour: '02:30 PM', count: 24, priority: 7 },
    { hour: '03:30 PM', count: 15, priority: 4 },
    { hour: '04:30 PM', count: 8, priority: 1 }
  ];

  // Monthly trends (mock statistics)
  const monthlyTrendsData = [
    { month: 'Jan', total: 420, priority: 110, served: 380 },
    { month: 'Feb', total: 510, priority: 140, served: 460 },
    { month: 'Mar', total: 640, priority: 180, served: 590 },
    { month: 'Apr', total: 580, priority: 155, served: 520 },
    { month: 'May', total: 720, priority: 210, served: 660 }
  ];

  const handleMockExport = (reportType: string, format: 'PDF' | 'CSV' | 'Print') => {
    toast.success(`Compiling ${reportType} metrics...`);
    setTimeout(() => {
      if (format === 'Print') {
        window.print();
        return;
      }
      const dataStr = "data:text/csv;charset=utf-8," 
        + ["Report Type,Format,Generated Date"].join(",") + "\n"
        + [reportType, format, new Date().toISOString()].join(",");
        
      const encodedUri = encodeURI(dataStr);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `mqams_${reportType.replace(/ /g, '_').toLowerCase()}.${format.toLowerCase()}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`${reportType} exported successfully as ${format}!`);
    }, 600);
  };

  const reportCards = [
    {
      id: 'daily',
      title: 'Daily Appointment Summary',
      desc: 'Aggregated total bookings, cancellations, completions, and counter processing metrics today.',
      icon: FiFileText,
      color: 'indigo'
    },
    {
      id: 'perf',
      title: 'Department Performance',
      desc: 'Average serving velocity, total tickets processed, active counters load, and desk processing rates.',
      icon: FiTrendingUp,
      color: 'emerald'
    },
    {
      id: 'prior',
      title: 'Priority Citizens Served',
      desc: 'Volume of seniors, disabled, and pregnant citizens processed in priority fast lanes.',
      icon: FiAward,
      color: 'amber'
    },
    {
      id: 'noshow',
      title: 'No-show Rate Catalog',
      desc: 'Frequency index of citizen absent slots mapped across individual counters and services.',
      icon: FiPercent,
      color: 'rose'
    }
  ];

  return (
    <div className="space-y-6 md:space-y-8 font-sans">
      
      {/* Date Range Picker Panel Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
        
        <div>
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Analytical Scope</span>
          <h3 className="text-slate-900 font-extrabold text-base mt-0.5 font-sans">Reports Console</h3>
        </div>

        {/* Date inputs */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl py-2 px-3 text-xs font-semibold text-slate-700">
            <FiCalendar className="text-amber-500" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent border-0 focus:outline-none focus:ring-0 text-slate-800 cursor-pointer"
            />
          </div>
          <span className="text-slate-400 text-xs font-bold">to</span>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl py-2 px-3 text-xs font-semibold text-slate-700">
            <FiCalendar className="text-amber-500" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent border-0 focus:outline-none focus:ring-0 text-slate-800 cursor-pointer"
            />
          </div>
        </div>

      </div>

      {/* Recharts Workload Graphs center */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Graph 1: Peak Hours Analysis BarChart */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Operational Workload</span>
              <h4 className="text-slate-900 font-extrabold text-sm mt-0.5">Peak Hours Analysis</h4>
            </div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Appointments by Hour</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={peakHoursData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  labelStyle={{ fontWeight: '850', color: '#0f172a', fontSize: '11px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '10px' }} />
                <Bar dataKey="count" name="Total Bookings" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="priority" name="Priority Lane" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graph 2: Monthly workload trends LineChart */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Historical Volume</span>
              <h4 className="text-slate-900 font-extrabold text-sm mt-0.5">Monthly Booking Trends</h4>
            </div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Volume Dynamics</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthlyTrendsData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  labelStyle={{ fontWeight: '850', color: '#0f172a', fontSize: '11px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="total" name="Total Registered" stroke="#6366f1" strokeWidth={2.5} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="served" name="Served Citizens" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Grid of Report actions card indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportCards.map(rep => {
          const Icon = rep.icon;
          const bgColors = {
            indigo: 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20',
            emerald: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
            amber: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
            rose: 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
          };
          
          return (
            <div 
              key={rep.id} 
              className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm flex flex-col justify-between gap-5 group hover:border-slate-350 hover:shadow-md transition-all duration-300"
            >
              
              {/* Header description */}
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform ${bgColors[rep.color as keyof typeof bgColors]}`}>
                  <Icon className="text-xl" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-extrabold text-slate-900">{rep.title}</h4>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed">{rep.desc}</p>
                </div>
              </div>

              {/* Action Buttons footer */}
              <div className="flex items-center gap-2 border-t border-slate-100 pt-4 flex-wrap">
                <button
                  onClick={() => handleMockExport(rep.title, 'PDF')}
                  className="bg-slate-900 border border-slate-800 text-amber-505 hover:bg-slate-950 text-amber-500 py-2 px-3.5 rounded-xl font-bold text-[10.5px] uppercase tracking-wider transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <FiDownload className="text-xs" /> Export PDF
                </button>
                <button
                  onClick={() => handleMockExport(rep.title, 'CSV')}
                  className="bg-white border border-slate-250 hover:border-slate-350 text-slate-700 py-2 px-3.5 rounded-xl font-bold text-[10.5px] uppercase tracking-wider transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <FiDownload className="text-xs" /> Export CSV
                </button>
                <button
                  onClick={() => handleMockExport(rep.title, 'Print')}
                  className="bg-white border border-slate-250 hover:border-slate-350 text-slate-700 py-2 px-3.5 rounded-xl font-bold text-[10.5px] uppercase tracking-wider transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <FiPrinter className="text-xs" /> Print
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};

export default Reports;
