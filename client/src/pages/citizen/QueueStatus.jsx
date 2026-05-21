import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import { 
  FiCreditCard, FiHome, FiBriefcase, FiMap, FiDollarSign, FiTool, FiGlobe, 
  FiUsers, FiClock, FiRefreshCw, FiInfo, FiChevronRight, FiCheckCircle
} from 'react-icons/fi';

const officeIcons = {
  "Civil Registration Office": FiCreditCard,
  "Residence & Population Office": FiHome,
  "Business & Trade Office": FiBriefcase,
  "Land & Property Office": FiMap,
  "Tax & Finance Office": FiDollarSign,
  "Construction & Urban Planning Office": FiTool,
  "Public Services Office": FiGlobe,
};

const QueueStatus = () => {
  const [myStatus, setMyStatus] = useState(null);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffice, setSelectedOffice] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [showAllQueues, setShowAllQueues] = useState(false);

  const fetchData = async () => {
    try {
      // Fetch status separately to handle errors better
      api.get('/queue/my-status').then(res => setMyStatus(res.data)).catch(err => console.error('Status fetch error', err));
      
      // Fetch user appointments to filter queues
      api.get('/appointments/my').then(res => setAppointments(res.data || [])).catch(err => console.error('Appointments fetch error', err));
      
      // Fetch summary
      const summaryRes = await api.get('/queue/summary');
      setSummary(summaryRes.data || []);
    } catch (error) {
      console.error('Failed to fetch queue summary', error);
      toast.error('Failed to load queue stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-bold animate-pulse">Loading live queue status...</p>
      </div>
    );
  }

  // Filter user's active departments (pending, approved, called)
  const activeDepts = new Set(
    appointments
      .filter(app => app.status && ['pending', 'approved', 'called'].includes(app.status.toLowerCase()))
      .map(app => app.department)
  );

  const hasActiveAppointments = activeDepts.size > 0;

  // Filter summary based on active appointments and toggle state
  const displayedSummary = (hasActiveAppointments && !showAllQueues)
    ? summary.filter(office => activeDepts.has(office.department))
    : summary;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Queue Status</h1>
          <p className="text-slate-500 font-medium">Real-time monitoring of all service counters</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          {hasActiveAppointments && (
            <button
              onClick={() => setShowAllQueues(!showAllQueues)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-md ${
                showAllQueues 
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200' 
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 shadow-slate-100'
              }`}
            >
              <FiInfo className="text-sm shrink-0" />
              {showAllQueues ? 'Show Only My Queues' : 'Show All Queues'}
            </button>
          )}
          <div className="flex items-center gap-2 text-slate-500 text-xs font-black bg-slate-100 px-4 py-2 rounded-xl uppercase tracking-wider shadow-sm">
            <FiRefreshCw className="animate-spin-slow text-slate-400 text-sm" /> Live Update
          </div>
        </div>
      </div>

      {/* PERSONAL ACTIVE TICKET SECTION */}
      {myStatus && (
        <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-amber-500 rounded-[2.5rem] p-1 shadow-2xl shadow-amber-200">
            <div className="bg-white rounded-[2.4rem] p-8 md:p-10 flex flex-col md:flex-row items-center gap-10">
              {/* Left: Ticket Large */}
              <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-[2rem] border-2 border-dashed border-amber-300 w-full md:w-auto min-w-[240px]">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Your Ticket</p>
                <h2 className="text-7xl font-black text-slate-900 tracking-tighter">{myStatus.queue_number}</h2>
                <div className="mt-4 flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {myStatus.queue_type} Priority
                </div>
              </div>

              {/* Right: Info */}
              <div className="flex-1 w-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl">
                    <FiCheckCircle />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{myStatus.service_name}</h3>
                    <p className="text-slate-500 font-medium text-sm">{myStatus.department}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3 text-amber-600 mb-1">
                      <FiUsers size={20} />
                      <span className="text-[10px] font-black uppercase tracking-widest">People Ahead</span>
                    </div>
                    <p className="text-2xl font-black text-slate-900">{myStatus.position - 1}</p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3 text-blue-600 mb-1">
                      <FiClock size={20} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Wait Time</span>
                    </div>
                    <p className="text-2xl font-black text-slate-900">~{myStatus.estimated_wait_time}m</p>
                  </div>
                </div>
                
                {myStatus.status === 'serving' && (
                  <div className="mt-6 p-4 bg-emerald-500 text-white rounded-2xl font-black text-center animate-pulse tracking-widest uppercase text-sm">
                    It's your turn! Go to Counter {myStatus.counter_number || '1'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ALL QUEUES SUMMARY GRID */}
      <div className="mb-8">
        <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
          <FiUsers className="text-amber-500" />
          {hasActiveAppointments && !showAllQueues ? 'My Active Department Queues' : 'All Department Queues'}
        </h2>
        {displayedSummary.length === 0 ? (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-12 text-center">
            <FiInfo className="mx-auto text-slate-300 mb-4" size={40} />
            <p className="text-slate-500 font-bold">No active queues found.</p>
            <p className="text-slate-400 text-sm mt-1">Departments will appear here as they are registered.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedSummary.map((office, idx) => {
              const Icon = officeIcons[office.department] || FiUsers;
              return (
                <div 
                  key={idx}
                  onClick={() => setSelectedOffice(selectedOffice === office.department ? null : office.department)}
                  className={`group bg-white rounded-3xl p-6 border-2 transition-all duration-300 cursor-pointer relative overflow-hidden ${
                    selectedOffice === office.department 
                    ? 'border-amber-500 shadow-xl shadow-amber-100 ring-4 ring-amber-50' 
                    : 'border-slate-100 hover:border-amber-200 hover:shadow-lg'
                  }`}
                >
                  {/* Background Decor */}
                  <div className="absolute -right-4 -bottom-4 text-slate-50 opacity-10 group-hover:scale-125 transition-transform duration-500">
                    <Icon size={120} />
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${
                        selectedOffice === office.department ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <Icon />
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-slate-500 rounded-full text-[9px] font-black uppercase tracking-widest">
                        <div className={`w-1.5 h-1.5 rounded-full ${office.current_serving ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                        {office.current_serving ? 'Live' : 'Inactive'}
                      </div>
                    </div>

                    <h3 className="font-bold text-slate-900 mb-1 leading-tight">{office.department}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6">Arba Minch Municipality</p>

                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Now Serving</p>
                        <p className={`text-3xl font-black tracking-tighter ${office.current_serving ? 'text-amber-500' : 'text-slate-300'}`}>
                          {office.current_serving || '---'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">In Queue</p>
                        <p className="text-xl font-black text-slate-900">{office.waiting_count}</p>
                      </div>
                    </div>

                    {/* Expandable Detail */}
                    {selectedOffice === office.department && (
                      <div className="mt-6 pt-6 border-t border-slate-100 animate-in fade-in zoom-in-95 duration-300">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500 font-medium">Estimated wait:</span>
                            <span className="text-slate-900 font-black">{office.waiting_count * 10} mins</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500 font-medium">Counter Status:</span>
                            <span className="text-emerald-600 font-black">Active</span>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            className="w-full mt-4 py-3 bg-slate-900 text-white rounded-xl font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-amber-500 transition-colors"
                          >
                            Join This Queue
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default QueueStatus;
