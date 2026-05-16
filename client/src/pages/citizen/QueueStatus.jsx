import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import QueueBadge from '../../components/QueueBadge';
import { MdGroups, MdOutlineAccessTimeFilled, MdRefresh } from 'react-icons/md';

const QueueStatus = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [joining, setJoining] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await api.get('/queue/my-status');
      setStatus(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await api.get('/services');
      setServices(res.data);
      if (res.data.length > 0) setSelectedService(res.data[0].id);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchServices();
    
    const interval = setInterval(fetchStatus, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const handleJoinQueue = async () => {
    setJoining(true);
    try {
      await api.post('/queue/checkin', { service_id: selectedService });
      await fetchStatus();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to join queue');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64 w-full"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div></div>;
  }

  return (
    <div className="max-w-3xl mx-auto w-full min-w-0">
      <h1 className="text-2xl font-bold text-secondary mb-6 block w-full text-center sm:text-left">Queue Status</h1>

      {!status ? (
        <div className="bg-card rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-8 text-center border border-border w-full min-w-0">
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6 shrink-0">
            <MdGroups size={40} />
          </div>
          <h2 className="text-xl font-bold text-secondary mb-2 block w-full">You are not in a queue</h2>
          <p className="text-muted mb-8 mx-auto block w-full">Select a service below to join the virtual queue and save your spot before arriving at the center.</p>
          
          <div className="max-w-md mx-auto space-y-4 w-full">
            <div className="text-left w-full">
              <label className="block text-sm font-bold text-secondary mb-3 w-full text-center">Select Service to Join</label>
              <div className="flex overflow-x-auto pb-4 gap-3 scrollbar-hide snap-x scroll-pl-4">
                {services.map(s => (
                  <div 
                    key={s.id}
                    onClick={() => setSelectedService(s.id)}
                    className={`min-w-[140px] p-4 border rounded-[var(--radius-card)] cursor-pointer transition-all snap-start flex flex-col items-center ${
                      selectedService === s.id 
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                        : 'border-border bg-white hover:border-primary/50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 shrink-0 ${
                      selectedService === s.id ? 'bg-primary text-white' : 'bg-surface text-primary'
                    }`}>
                      <MdGroups size={20} />
                    </div>
                    <span className="text-xs font-bold text-secondary block w-full text-center truncate">{s.name}</span>
                    <span className="text-[10px] text-muted block w-full text-center truncate">{s.department}</span>
                  </div>
                ))}
              </div>
            </div>
            <button 
              onClick={handleJoinQueue}
              disabled={joining || services.length === 0}
              className="w-full py-4 bg-primary text-white font-bold rounded-[var(--radius-btn)] hover:bg-primary/90 transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2"
            >
              {joining ? 'Joining...' : 'Join Virtual Queue'}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-8 text-center border-t-8 border-primary relative overflow-hidden w-full min-w-0">
          {status.status === 'serving' && (
            <div className="absolute top-0 left-0 w-full bg-success text-white py-2 text-sm font-bold uppercase tracking-widest animate-pulse">
              It is your turn! Please proceed to counter.
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start mb-6 mt-4 gap-4 w-full">
            <div className="text-center sm:text-left min-w-0">
              <p className="text-sm text-muted font-medium uppercase tracking-wider mb-1 block w-full">Service</p>
              <h3 className="font-bold text-secondary text-lg block w-full">{status.service_name}</h3>
            </div>
            <QueueBadge type={status.queue_type} />
          </div>
          
          <div className="py-10 border-y border-border my-6 w-full">
            <p className="text-sm font-medium text-muted uppercase tracking-widest mb-2 block w-full">Your Ticket Number</p>
            <div className={`text-[80px] leading-none font-black ${status.status === 'serving' ? 'text-success' : 'text-primary'} block w-full`}>
              {status.queue_number}
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left w-full">
            <div className="bg-surface p-4 rounded-[var(--radius-card)] flex items-center w-full">
              <div className="w-10 h-10 rounded-full bg-warning/10 text-warning flex items-center justify-center mr-3 shrink-0">
                <MdGroups size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted font-medium mb-1 block w-full whitespace-nowrap">People Ahead</p>
                <p className="font-bold text-secondary text-xl block w-full">{status.position - 1}</p>
              </div>
            </div>
            <div className="bg-surface p-4 rounded-[var(--radius-card)] flex items-center w-full">
              <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center mr-3 shrink-0">
                <MdOutlineAccessTimeFilled size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted font-medium mb-1 block w-full whitespace-nowrap">Est. Wait Time</p>
                <p className="font-bold text-secondary text-xl block w-full">~{status.estimated_wait_time} min</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-sm text-muted flex items-center justify-center w-full">
            <MdRefresh className="mr-1 animate-spin" /> <span className="block w-full">Auto-updating every 10 seconds</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default QueueStatus;
