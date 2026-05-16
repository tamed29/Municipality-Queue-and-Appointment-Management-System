import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import QueueBadge from '../../components/QueueBadge';
import { MdSkipNext, MdCheckCircle, MdRecordVoiceOver } from 'react-icons/md';

const QueueControl = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    try {
      const res = await api.get('/admin/queue');
      setQueue(res.data);
    } catch (error) {
      toast.error('Failed to fetch queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000); // Live poll
    return () => clearInterval(interval);
  }, []);

  const handleCallNext = async () => {
    try {
      await api.post('/admin/queue/next');
      toast.success('Next person called');
      fetchQueue();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to call next');
    }
  };

  const handleSkip = async (id) => {
    try {
      await api.post('/admin/queue/skip', { id });
      toast.success('Person skipped');
      fetchQueue();
    } catch (error) {
      toast.error('Failed to skip');
    }
  };

  const currentServing = queue.filter(q => q.status === 'serving');
  const waitingList = queue.filter(q => q.status === 'waiting');

  const textWrapStyle = {
    maxWidth: '560px',
    width: '100%',
    whiteSpace: 'normal',
    wordBreak: 'normal',
    overflowWrap: 'normal'
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 min-w-0">
      {/* Left Panel - Waiting List */}
      <div className="flex-1 bg-card rounded-[var(--radius-card)] shadow-[var(--shadow-card)] flex flex-col h-[calc(100vh-140px)] min-w-0">
        <div className="p-6 border-b border-border flex justify-between items-center min-w-0">
          <h2 className="text-xl font-bold text-secondary break-normal">Waiting List</h2>
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold shrink-0">{waitingList.length} Waiting</span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-w-0">
          {waitingList.map((item, idx) => (
            <div key={item.id} className="flex items-center justify-between p-4 bg-surface rounded-[var(--radius-card)] border border-border">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 flex items-center justify-center font-bold text-lg rounded bg-white shadow-sm border border-border">
                  {item.queue_number}
                </div>
                <div>
                  <p className="font-bold text-secondary text-sm">{item.full_name}</p>
                  <p className="text-xs text-muted truncate max-w-[150px]">{item.service_name}</p>
                </div>
              </div>
              <QueueBadge type={item.queue_type} />
            </div>
          ))}
          
          {waitingList.length === 0 && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-muted">
              <MdRecordVoiceOver size={48} className="mb-4 opacity-30" />
              <p>Queue is empty</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Current Serving & Controls */}
      <div className="lg:w-96 flex flex-col gap-6">
        <div className="bg-card rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-6 text-center">
          <h2 className="text-lg font-bold text-secondary mb-6 border-b pb-4">Now Serving</h2>
          
          {currentServing.length > 0 ? (
            <div className="space-y-6">
              <div className="text-[72px] font-black leading-none text-success">
                {currentServing[0].queue_number}
              </div>
              <div>
                <p className="font-bold text-xl text-secondary">{currentServing[0].full_name}</p>
                <p className="text-muted text-sm">{currentServing[0].service_name}</p>
              </div>
              <QueueBadge type={currentServing[0].queue_type} />
              
              <div className="grid grid-cols-2 gap-3 pt-4">
                <button 
                  onClick={() => handleSkip(currentServing[0].id)}
                  className="py-3 px-4 border border-border text-secondary font-medium rounded-[var(--radius-btn)] hover:bg-surface transition-colors flex items-center justify-center"
                >
                  <MdSkipNext className="mr-2" size={20} /> Skip
                </button>
                <button 
                  onClick={handleCallNext} // Simplification: assume marking done and calling next is one action here, or maybe separate
                  className="py-3 px-4 bg-success text-white font-bold rounded-[var(--radius-btn)] hover:bg-success/90 transition-colors flex items-center justify-center"
                >
                  <MdCheckCircle className="mr-2" size={20} /> Done
                </button>
              </div>
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-muted">
              <div className="w-24 h-24 rounded-full bg-surface flex items-center justify-center mb-4">
                <span className="text-4xl">--</span>
              </div>
              <p>No one is currently being served</p>
            </div>
          )}
        </div>

        <button 
          onClick={handleCallNext}
          disabled={waitingList.length === 0}
          className={`w-full py-4 text-white font-bold rounded-[var(--radius-btn)] shadow-lg transition-colors flex items-center justify-center text-lg ${
            waitingList.length > 0 ? 'bg-primary hover:bg-primary/90' : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          <MdRecordVoiceOver className="mr-2" size={24} /> Call Next Person
        </button>
      </div>
    </div>
  );
};

export default QueueControl;
