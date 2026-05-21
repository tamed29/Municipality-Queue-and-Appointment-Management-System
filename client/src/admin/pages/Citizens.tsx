import React, { useState } from 'react';
import { useAdmin, CitizenProfile } from '../components/AdminContext';
import CitizenDrawer from '../components/CitizenDrawer';
import { FiSearch, FiSliders, FiUsers, FiLock, FiUnlock, FiEye, FiUserCheck, FiUserX, FiAlertCircle } from 'react-icons/fi';

type SortField = 'fullName' | 'nationalId' | 'age' | 'priorityType' | 'totalAppointments' | 'lastVisitDate' | 'status';
type SortOrder = 'asc' | 'desc';

const Citizens: React.FC = () => {
  const { citizens, suspendCitizen, reinstateCitizen } = useAdmin();

  // Search State
  const [searchTerm, setSearchTerm] = useState('');

  // Sorting State
  const [sortField, setSortField] = useState<SortField>('fullName');
  const [sortOrder, setSortOrder] = useState('asc');

  // Citizen Profile Drawer state
  const [selectedCitizenId, setSelectedCitizenId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Sorting Handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filter & Search Logic
  const filteredCitizens = citizens.filter(cit => {
    const term = searchTerm.toLowerCase();
    return (
      (cit.fullName || '').toLowerCase().includes(term) ||
      (cit.nationalId || '').toLowerCase().includes(term) ||
      (cit.phone || '').toLowerCase().includes(term) ||
      (cit.email || '').toLowerCase().includes(term)
    );
  });

  // Sorted Citizens List
  const sortedCitizens = [...filteredCitizens].sort((a, b) => {
    let aVal = a[sortField] || '';
    let bVal = b[sortField] || '';

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const handleOpenProfile = (id: string) => {
    setSelectedCitizenId(id);
    setDrawerOpen(true);
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

  return (
    <div className="space-y-6 md:space-y-8 font-sans">
      
      {/* Search Filter Header Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm space-y-4">
        
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <FiUsers className="text-amber-500 text-lg" />
            <h3 className="text-slate-900 font-extrabold text-sm">Citizens Database Lookup</h3>
          </div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider tabular-nums">
            {citizens.length} registered
          </span>
        </div>

        {/* Search Input bar */}
        <div className="relative max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search citizens by name, national ID, phone number..."
            className="w-full bg-slate-50 border border-slate-200 hover:border-slate-350 focus:border-amber-500 rounded-2xl py-3 pl-11 pr-4 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all shadow-inner"
          />
          <FiSearch className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400 text-sm" />
        </div>

      </div>

      {/* Main Sortable Citizens Table Grid */}
      <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider py-4.5 px-6">
                <th className="py-4.5 px-6 cursor-pointer hover:text-slate-900 transition-colors" onClick={() => handleSort('fullName')}>
                  Citizen Full Name {sortField === 'fullName' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th className="py-4.5 px-4 cursor-pointer hover:text-slate-900 transition-colors" onClick={() => handleSort('nationalId')}>
                  National ID {sortField === 'nationalId' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th className="py-4.5 px-4 cursor-pointer hover:text-slate-900 transition-colors" onClick={() => handleSort('age')}>
                  Age {sortField === 'age' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th className="py-4.5 px-4 cursor-pointer hover:text-slate-900 transition-colors" onClick={() => handleSort('priorityType')}>
                  Priority Group {sortField === 'priorityType' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th className="py-4.5 px-4 cursor-pointer hover:text-slate-900 transition-colors" onClick={() => handleSort('totalAppointments')}>
                  Bookings {sortField === 'totalAppointments' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th className="py-4.5 px-4 cursor-pointer hover:text-slate-900 transition-colors" onClick={() => handleSort('lastVisitDate')}>
                  Last Visit {sortField === 'lastVisitDate' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th className="py-4.5 px-4 cursor-pointer hover:text-slate-900 transition-colors" onClick={() => handleSort('status')}>
                  Status {sortField === 'status' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th className="py-4.5 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
              {sortedCitizens.length > 0 ? (
                sortedCitizens.map(cit => (
                  <tr key={cit.id} className="hover:bg-slate-50/45 transition-colors">
                    
                    {/* Full Name */}
                    <td className="py-4.5 px-6 font-bold text-slate-900">{cit.fullName}</td>
                    
                    {/* National ID */}
                    <td className="py-4.5 px-4 font-semibold text-slate-500 tabular-nums">{cit.nationalId}</td>
                    
                    {/* Age */}
                    <td className="py-4.5 px-4 font-semibold text-slate-900 tabular-nums">{cit.age}</td>
                    
                    {/* Priority Type Badge */}
                    <td className="py-4.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 text-[10.5px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${getPriorityBadgeColor(cit.priorityType || 'Regular')}`}>
                        {getPriorityIcon(cit.priorityType || 'Regular')} {cit.priorityType || 'Regular'}
                      </span>
                    </td>

                    {/* Bookings Count */}
                    <td className="py-4.5 px-4 font-bold text-slate-800 tabular-nums">{cit.totalAppointments} visit(s)</td>

                    {/* Last Visit Date */}
                    <td className="py-4.5 px-4 font-semibold text-slate-500 tabular-nums">{cit.lastVisitDate}</td>

                    {/* Status Badge */}
                    <td className="py-4.5 px-4">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        cit.status === 'Active'
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse'
                      }`}>
                        {cit.status}
                      </span>
                    </td>

                    {/* Actions Column */}
                    <td className="py-4.5 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Suspend / Reinstate Toggle buttons */}
                        {cit.status === 'Active' ? (
                          <button
                            onClick={() => suspendCitizen(cit.id)}
                            title="Suspend Citizen Account"
                            className="p-2 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-xl hover:bg-rose-500 hover:text-white transition-all cursor-pointer shadow-sm"
                          >
                            <FiUserX />
                          </button>
                        ) : (
                          <button
                            onClick={() => reinstateCitizen(cit.id)}
                            title="Reinstate Citizen Account"
                            className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-xl hover:bg-emerald-500 hover:text-slate-950 transition-all cursor-pointer shadow-sm"
                          >
                            <FiUserCheck />
                          </button>
                        )}

                        {/* View Profile details trigger */}
                        <button
                          onClick={() => handleOpenProfile(cit.id)}
                          title="View Full Profile Drawer"
                          className="p-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all cursor-pointer shadow-sm"
                        >
                          <FiEye />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 bg-slate-50/20">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FiAlertCircle className="text-2xl" />
                      <span className="text-xs font-semibold">No citizens match your search parameters.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Citizen Drawer component overlay */}
      <CitizenDrawer 
        citizenId={selectedCitizenId}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

    </div>
  );
};

export default Citizens;
