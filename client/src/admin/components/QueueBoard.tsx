import React, { useState } from 'react';
import { useAdmin } from './AdminContext';
import { FiVolume2, FiCheck, FiFastForward, FiChevronUp, FiXCircle, FiPlay, FiPause, FiPlus } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

interface QueueBoardProps {
  deptName: string;
}

const QueueBoard: React.FC<QueueBoardProps> = ({ deptName }) => {
  const { 
    queues, 
    deptSettings, 
    callNextQueue, 
    callAgain, 
    markServed, 
    moveQueueItemUp, 
    markQueueItemNoShow,
    toggleQueuePause,
    addWalkIn
  } = useAdmin();

  // Walk-in Dialog State
  const [walkInOpen, setWalkInOpen] = useState(false);
  const [walkInName, setWalkInName] = useState('');
  const [walkInId, setWalkInId] = useState('');
  const [walkInService, setWalkInService] = useState('');
  const [walkInPriority, setWalkInPriority] = useState<'Elderly' | 'Disabled' | 'Pregnant' | 'Regular'>('Regular');

  const activeQueue = queues[deptName];
  const settings = deptSettings[deptName];

  if (!activeQueue || !settings) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400">
        <span className="text-sm font-semibold">Initializing Department Queue Board...</span>
      </div>
    );
  }

  const handleOpenWalkIn = () => {
    setWalkInName('');
    setWalkInId('');
    // Pick the first active service for this department as default
    setWalkInService('ID card issuance');
    setWalkInPriority('Regular');
    setWalkInOpen(true);
  };

  const handleSaveWalkIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInName.trim() || !walkInService) {
      toast.error('Citizen name and service are required!');
      return;
    }
    addWalkIn(deptName, walkInName, walkInId || `AM-${Math.floor(10000+Math.random()*90000)}`, walkInService, walkInPriority);
    setWalkInOpen(false);
  };

  const getPriorityBadgeColor = (type: string) => {
    switch (type) {
      case 'Elderly': return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
      case 'Disabled': return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
      case 'Pregnant': return 'bg-purple-500/10 text-purple-500 border border-purple-500/20';
      default: return 'bg-slate-100 text-slate-500 border border-slate-200';
    }
  };

  const getPriorityIcon = (type: string) => {
    switch (type) {
      case 'Elderly': return '👵';
      case 'Disabled': return '♿';
      case 'Pregnant': return '🤰';
      default: return '⚪';
    }
  };

  const mockServicesByDept: Record<string, string[]> = {
    'Civil Reg': ['ID card issuance', 'ID card renewal', 'ID replacement', 'Birth certificate', 'Marriage certificate', 'Death certificate'],
    'Residence': ['Residence certificate', 'Change of address', 'Family registration', 'Household update'],
    'Business': ['New business license', 'License renewal', 'License cancellation', 'Trade registration'],
    'Land': ['Land ownership certificate', 'Land transfer', 'Building permit', 'Property registration'],
    'Tax': ['Tax payment', 'Tax clearance certificate', 'Business tax registration', 'Penalty payment'],
    'Construction': ['Construction permit', 'Building plan approval', 'Renovation permit', 'Infrastructure request'],
    'Public': ['Public complaint', 'Utility connection', 'Street light request', 'Community center booking']
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans relative">
      
      {/* Queue Paused Glassmorphic Overlay */}
      {settings.isPaused && (
        <div className="absolute inset-0 bg-slate-100/60 backdrop-blur-xs z-20 rounded-3xl flex items-center justify-center border border-slate-200 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-350 p-8 rounded-3xl shadow-xl text-center max-w-sm flex flex-col items-center gap-4">
            <div className="w-14 h-14 bg-amber-500/15 border border-amber-500/30 text-amber-500 rounded-full flex items-center justify-center shrink-0">
              <FiPause className="text-2xl" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 leading-none">Queue Operations Suspended</h3>
            <p className="text-slate-500 text-sm font-semibold leading-relaxed">
              This department counter is currently paused for a lunch break or maintenance event. Click below to resume calling.
            </p>
            <button
              onClick={() => toggleQueuePause(deptName)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-6 py-3 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <FiPlay className="text-sm shrink-0" /> Resume Queue
            </button>
          </div>
        </div>
      )}

      {/* COLUMN 1: Currently Serving Station */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[360px]">
        
        <div>
          <div className="flex justify-between items-center mb-6">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Serving Counter</span>
            <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] uppercase font-bold rounded-full">
              Counter Active
            </span>
          </div>

          {activeQueue.currentlyServing ? (
            <div className="text-center space-y-4 py-4 animate-in zoom-in-95 duration-200">
              {/* Giant Ticket Tag */}
              <div className="inline-flex flex-col items-center p-6 bg-[#0f172a] text-white border border-slate-800 rounded-3xl shadow-inner min-w-[200px] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-bl-full -mr-8 -mt-8 pointer-events-none"></div>
                <strong className="text-4xl font-extrabold tracking-tight tabular-nums text-amber-500">
                  {activeQueue.currentlyServing.ticketNumber}
                </strong>
                <span className="text-[11px] text-slate-400 font-bold uppercase mt-2 tracking-wider">
                  Ticket Code
                </span>
              </div>

              {/* Citizen Details */}
              <div className="space-y-1">
                <h4 className="text-lg font-extrabold text-slate-900 leading-tight">
                  {activeQueue.currentlyServing.citizenName}
                </h4>
                <p className="text-slate-500 text-xs font-semibold">
                  Service: <strong className="text-slate-700">{activeQueue.currentlyServing.serviceName}</strong>
                </p>
                
                {/* Priority Label */}
                {activeQueue.currentlyServing.priorityType !== 'Regular' && (
                  <div className="pt-2 flex justify-center">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${getPriorityBadgeColor(activeQueue.currentlyServing.priorityType)}`}>
                      {getPriorityIcon(activeQueue.currentlyServing.priorityType)} {activeQueue.currentlyServing.priorityType} Priority
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 space-y-2.5">
              <span className="text-3xl block">📢</span>
              <span className="text-xs font-semibold block">Counter is vacant. Call next in queue!</span>
            </div>
          )}
        </div>

        {/* Counter Action buttons */}
        <div className="space-y-3.5 pt-6 border-t border-slate-100">
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => callAgain(deptName)}
              disabled={!activeQueue.currentlyServing}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-amber-500 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-slate-950 transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none"
            >
              <FiVolume2 className="text-sm shrink-0" /> Call Again
            </button>
            <button
              onClick={() => markServed(deptName)}
              disabled={!activeQueue.currentlyServing}
              className="bg-emerald-500 text-slate-950 py-3 rounded-2xl font-extrabold text-xs uppercase tracking-wider hover:bg-emerald-400 transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none"
            >
              <FiCheck className="text-sm shrink-0" /> Mark Served
            </button>
          </div>

          <button
            onClick={() => callNextQueue(deptName)}
            className="w-full bg-amber-500 text-slate-950 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-amber-400 hover:-translate-y-0.5 transition-all shadow-md shadow-amber-500/10 cursor-pointer flex items-center justify-center gap-2"
          >
            <FiFastForward className="text-sm shrink-0" /> Call Next Queue
          </button>

        </div>

      </div>

      {/* COLUMN 2: Priority Queue (Ordered list) */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm flex flex-col">
        
        <div className="flex justify-between items-center mb-5 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-slate-900 font-extrabold text-sm">Priority Queue</span>
            <span className="w-5 h-5 bg-rose-500/10 text-rose-500 font-extrabold text-xs rounded-full border border-rose-500/20 flex items-center justify-center">
              {activeQueue.priorityQueue.length}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Fast Lane</span>
        </div>

        {/* Priority list cards */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[360px] min-h-[220px] custom-scrollbar">
          {activeQueue.priorityQueue.length > 0 ? (
            activeQueue.priorityQueue.map((item, idx) => (
              <div 
                key={item.ticketNumber} 
                className="p-4 bg-slate-50 border-l-4 border-l-amber-500 border-y border-r border-slate-200 rounded-r-2xl rounded-l-md flex items-center justify-between gap-3 shadow-inner hover:-translate-y-0.5 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 bg-amber-500/15 border border-amber-500/20 text-amber-500 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm tabular-nums">
                    {item.ticketNumber}
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <h5 className="text-[13px] font-extrabold text-slate-800 truncate leading-tight">
                      {item.citizenName}
                    </h5>
                    <span className="text-[10px] text-slate-500 truncate font-semibold">
                      {item.serviceName}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase mt-1 w-max px-2 py-0.5 rounded-full ${getPriorityBadgeColor(item.priorityType)}`}>
                      {getPriorityIcon(item.priorityType)} {item.priorityType}
                    </span>
                  </div>
                </div>

                {/* Queue Control Buttons */}
                <div className="flex items-center gap-1.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => moveQueueItemUp(deptName, item.ticketNumber, true)}
                    title="Move Ticket Up"
                    className="p-2 bg-white border border-slate-200 hover:border-slate-350 text-slate-600 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer shadow-sm"
                  >
                    <FiChevronUp />
                  </button>
                  <button
                    onClick={() => markQueueItemNoShow(deptName, item.ticketNumber, true)}
                    title="Mark No Show"
                    className="p-2 bg-white border border-slate-200 hover:border-red-500/20 text-slate-600 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-all cursor-pointer shadow-sm"
                  >
                    <FiXCircle />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-12 space-y-2">
              <span className="text-xl">✅</span>
              <span className="text-xs font-semibold">No priority tickets in this counter.</span>
            </div>
          )}
        </div>

      </div>

      {/* COLUMN 3: Regular Queue (Ordered list) */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm flex flex-col">
        
        <div className="flex justify-between items-center mb-5 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-slate-900 font-extrabold text-sm">Regular Queue</span>
            <span className="w-5 h-5 bg-blue-500/10 text-blue-500 font-extrabold text-xs rounded-full border border-blue-500/20 flex items-center justify-center">
              {activeQueue.regularQueue.length}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Standard Lane</span>
        </div>

        {/* Regular list cards */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[360px] min-h-[220px] custom-scrollbar">
          {activeQueue.regularQueue.length > 0 ? (
            activeQueue.regularQueue.map((item, idx) => (
              <div 
                key={item.ticketNumber} 
                className="p-4 bg-slate-50 border-l-4 border-l-blue-500 border-y border-r border-slate-200 rounded-r-2xl rounded-l-md flex items-center justify-between gap-3 shadow-inner hover:-translate-y-0.5 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 bg-blue-500/15 border border-blue-500/20 text-blue-500 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm tabular-nums">
                    {item.ticketNumber}
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <h5 className="text-[13px] font-extrabold text-slate-800 truncate leading-tight">
                      {item.citizenName}
                    </h5>
                    <span className="text-[10px] text-slate-500 truncate font-semibold">
                      {item.serviceName}
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase mt-1 tabular-nums">
                      ⏰ Booking: {item.time}
                    </span>
                  </div>
                </div>

                {/* Queue Control Buttons */}
                <div className="flex items-center gap-1.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => moveQueueItemUp(deptName, item.ticketNumber, false)}
                    title="Move Ticket Up"
                    className="p-2 bg-white border border-slate-200 hover:border-slate-350 text-slate-600 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer shadow-sm"
                  >
                    <FiChevronUp />
                  </button>
                  <button
                    onClick={() => markQueueItemNoShow(deptName, item.ticketNumber, false)}
                    title="Mark No Show"
                    className="p-2 bg-white border border-slate-200 hover:border-red-500/20 text-slate-600 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-all cursor-pointer shadow-sm"
                  >
                    <FiXCircle />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-12 space-y-2">
              <span className="text-xl">✅</span>
              <span className="text-xs font-semibold">No regular tickets in this counter.</span>
            </div>
          )}
        </div>

      </div>

      {/* Bottom Counter Control Panel: Overrides & Actions */}
      <div className="lg:col-span-3 mt-4 shrink-0 flex flex-wrap gap-4 items-center justify-between bg-slate-50 border border-slate-200 rounded-3xl p-5 shadow-inner">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping shrink-0" />
          <span className="text-slate-600 text-xs font-bold uppercase tracking-wider">
            Operator Settings for {deptName} Counter
          </span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => toggleQueuePause(deptName)}
            className={`px-4.5 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm flex items-center gap-1.5 ${
              settings.isPaused
                ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            {settings.isPaused ? (
              <>
                <FiPlay className="text-sm shrink-0" /> Activate Queue
              </>
            ) : (
              <>
                <FiPause className="text-sm shrink-0" /> Pause Queue
              </>
            )}
          </button>
          <button
            onClick={handleOpenWalkIn}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4.5 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
          >
            <FiPlus className="text-sm shrink-0" /> Add Walk-in
          </button>
        </div>
      </div>

      {/* WALK-IN CREATION OVERLAY */}
      {walkInOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Add Walk-in Citizen</span>
                <h3 className="text-base font-extrabold text-slate-900 mt-1">Manual Counter Ticket</h3>
              </div>
              <button 
                onClick={() => setWalkInOpen(false)}
                className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                <FiXCircle />
              </button>
            </div>

            <form onSubmit={handleSaveWalkIn} className="space-y-4">
              
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Citizen Full Name</label>
                <input
                  type="text"
                  required
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                  placeholder="e.g. Abebech Gobena"
                  className="w-full bg-slate-50 border border-slate-200 hover:border-slate-350 focus:border-amber-500 rounded-2xl py-3 px-4 text-sm text-slate-800 placeholder-slate-450 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all font-semibold shadow-inner"
                />
              </div>

              {/* National ID (optional) */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">National ID Number</label>
                <input
                  type="text"
                  value={walkInId}
                  onChange={(e) => setWalkInId(e.target.value)}
                  placeholder="e.g. AM-90182-33"
                  className="w-full bg-slate-50 border border-slate-200 hover:border-slate-350 focus:border-amber-500 rounded-2xl py-3 px-4 text-sm text-slate-800 placeholder-slate-450 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all font-semibold shadow-inner"
                />
              </div>

              {/* Service Requested */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Selected Service</label>
                <select
                  value={walkInService}
                  onChange={(e) => setWalkInService(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 hover:border-slate-350 focus:border-amber-500 rounded-2xl py-3 px-4 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all font-semibold cursor-pointer shadow-inner"
                >
                  {mockServicesByDept[deptName].map(svc => (
                    <option key={svc} value={svc}>{svc}</option>
                  ))}
                </select>
              </div>

              {/* Priority Category */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Priority Classification</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'Regular', label: '⚪ Regular' },
                    { value: 'Elderly', label: '👴 Elderly (60+)' },
                    { value: 'Disabled', label: '♿ Disability' },
                    { value: 'Pregnant', label: '🤰 Pregnant' }
                  ].map(cat => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setWalkInPriority(cat.value as any)}
                      className={`py-3 px-4 border rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-sm ${
                        walkInPriority === cat.value
                          ? 'bg-amber-500/10 border-amber-500 text-amber-600'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex gap-3.5 pt-4">
                <button
                  type="button"
                  onClick={() => setWalkInOpen(false)}
                  className="flex-1 border border-slate-300 hover:border-slate-400 text-slate-700 bg-white font-bold text-xs py-3 rounded-xl transition-all cursor-pointer shadow-sm uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-amber-500 text-slate-950 font-extrabold text-xs py-3 rounded-xl hover:bg-amber-400 transition-all shadow-md cursor-pointer uppercase tracking-wider"
                >
                  Create Ticket
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default QueueBoard;
