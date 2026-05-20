import React, { useState } from 'react';
import { useAdmin } from '../components/AdminContext';
import AppointmentTable from '../components/AppointmentTable';
import CitizenDrawer from '../components/CitizenDrawer';
import { FiSearch, FiSliders, FiFilter, FiCalendar, FiRefreshCw } from 'react-icons/fi';

const Appointments: React.FC = () => {
  const { appointments } = useAdmin();

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedDate, setSelectedDate] = useState(''); // Default to empty string to show all bookings by default

  // Citizen Profile Drawer state
  const [selectedCitizenId, setSelectedCitizenId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Filters logic
  const filteredAppointments = appointments.filter(app => {
    const matchesSearch = 
      (app.citizenName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (app.id || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (app.nationalId || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = selectedDept === 'All' || app.department === selectedDept;
    
    const matchesStatus = selectedStatus === 'All' || app.status === selectedStatus;
    
    const matchesDate = !selectedDate || app.date === selectedDate;

    return matchesSearch && matchesDept && matchesStatus && matchesDate;
  });

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedDept('All');
    setSelectedStatus('All');
    setSelectedDate('');
  };

  const handleViewCitizen = (citizenId: string) => {
    setSelectedCitizenId(citizenId);
    setDrawerOpen(true);
  };

  const departments = ['Civil Reg', 'Residence', 'Business', 'Land', 'Tax', 'Construction', 'Public'];
  const statuses = ['Pending', 'Approved', 'Rejected', 'Completed', 'No-show'];

  return (
    <div className="space-y-6 md:space-y-8 font-sans">
      
      {/* Filters Navigation Panel Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm space-y-4">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <FiFilter className="text-amber-500 text-lg" />
            <h3 className="text-slate-900 font-extrabold text-sm">Database Filter Controls</h3>
          </div>
          
          {/* Reset Filters Shortcut */}
          <button
            onClick={handleResetFilters}
            className="text-[11px] text-slate-500 font-bold uppercase tracking-wider hover:text-amber-500 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <FiRefreshCw className="text-[10px]" /> Reset Filter Criteria
          </button>
        </div>

        {/* Filter Inputs Grid Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Search box input */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Citizen Search</label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name, ticket, ID..."
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-350 focus:border-amber-500 rounded-2xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all shadow-inner"
              />
              <FiSearch className="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400 text-sm" />
            </div>
          </div>

          {/* Department Selection dropdown */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Department Counter</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-350 focus:border-amber-500 rounded-2xl py-2.5 px-4 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all cursor-pointer shadow-inner"
            >
              <option value="All">All 7 Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Booking Date selection */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Schedule Date</label>
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-350 focus:border-amber-500 rounded-2xl py-2.5 px-4 text-xs font-semibold text-slate-750 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all cursor-pointer shadow-inner"
              />
            </div>
          </div>

          {/* Booking Status dropdown */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Booking Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-350 focus:border-amber-500 rounded-2xl py-2.5 px-4 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all cursor-pointer shadow-inner"
            >
              <option value="All">All Statuses</option>
              {statuses.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

        </div>

      </div>

      {/* Main Sortable Appointments Table Grid */}
      <AppointmentTable 
        appointments={filteredAppointments} 
        onViewCitizen={handleViewCitizen} 
      />

      {/* Sliding details drawer component */}
      <CitizenDrawer 
        citizenId={selectedCitizenId}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

    </div>
  );
};

export default Appointments;
