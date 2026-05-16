import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { AuthContext } from '../../store/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  FiCreditCard, FiHome, FiBriefcase, FiMap, FiDollarSign, FiTool, FiGlobe, 
  FiArrowRight, FiArrowLeft, FiCheckCircle, FiClock, FiSun, FiPrinter, FiPlus, FiClipboard, FiChevronDown, FiChevronUp
} from 'react-icons/fi';
import { serviceRequirements } from '../../data/serviceRequirements';

const WhatToBring = ({ serviceId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const requirements = serviceRequirements[serviceId] || [];

  if (requirements.length === 0) return null;

  return (
    <div className="mt-4">
      <button 
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-1.5 text-slate-400 hover:text-amber-600 transition-colors text-[11px] font-bold uppercase tracking-wider"
      >
        <FiClipboard size={12} />
        📋 {requirements.length} items required
        {isOpen ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
      </button>
      
      {isOpen && (
        <div 
          className="mt-2 p-3 bg-slate-50 border-l-[3px] border-amber-500 rounded-r-xl animate-in slide-in-from-top-2 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2">What to bring:</p>
          <ul className="space-y-1.5">
            {requirements.map((req, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] text-slate-600 leading-tight">
                <FiCheckCircle className="text-amber-500 mt-0.5 shrink-0" size={12} />
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const officeServices = {
  "Civil Registration Office": [
    { id: "CR01", name: "ID Card Issuance",              duration: "30 min", fee: "Free" },
    { id: "CR02", name: "ID Card Renewal",               duration: "20 min", fee: "Free" },
    { id: "CR03", name: "ID Replacement (Lost/Damaged)", duration: "25 min", fee: "50 ETB" },
    { id: "CR04", name: "Birth Certificate",             duration: "20 min", fee: "Free" },
    { id: "CR05", name: "Marriage Certificate",          duration: "30 min", fee: "Free" },
    { id: "CR06", name: "Death Certificate",             duration: "20 min", fee: "Free" },
  ],
  "Residence & Population Office": [
    { id: "RP01", name: "Residence Certificate",          duration: "15 min", fee: "Free" },
    { id: "RP02", name: "Change of Residence Address",    duration: "20 min", fee: "Free" },
    { id: "RP03", name: "Family Registration",            duration: "25 min", fee: "Free" },
    { id: "RP04", name: "Household Registration Update",  duration: "20 min", fee: "Free" },
  ],
  "Business & Trade Office": [
    { id: "BT01", name: "New Business License",           duration: "45 min", fee: "200 ETB" },
    { id: "BT02", name: "Business License Renewal",       duration: "30 min", fee: "150 ETB" },
    { id: "BT03", name: "Business License Cancellation",  duration: "20 min", fee: "Free" },
    { id: "BT04", name: "Trade Registration",             duration: "40 min", fee: "100 ETB" },
  ],
  "Land & Property Office": [
    { id: "LP01", name: "Land Ownership Certificate",     duration: "60 min", fee: "500 ETB" },
    { id: "LP02", name: "Land Transfer Service",          duration: "60 min", fee: "300 ETB" },
    { id: "LP03", name: "Building Permit Application",    duration: "45 min", fee: "400 ETB" },
    { id: "LP04", name: "Property Registration",          duration: "50 min", fee: "250 ETB" },
    { id: "LP05", name: "Property Tax Service",           duration: "30 min", fee: "Varies" },
  ],
  "Tax & Finance Office": [
    { id: "TF01", name: "Tax Payment",                    duration: "20 min", fee: "Varies" },
    { id: "TF02", name: "Tax Clearance Certificate",      duration: "30 min", fee: "100 ETB" },
    { id: "TF03", name: "Business Tax Registration",      duration: "40 min", fee: "150 ETB" },
    { id: "TF04", name: "Penalty Payment",                duration: "15 min", fee: "Varies" },
  ],
  "Construction & Urban Planning Office": [
    { id: "CU01", name: "Construction Permit",            duration: "60 min", fee: "600 ETB" },
    { id: "CU02", name: "Building Plan Approval",         duration: "60 min", fee: "400 ETB" },
    { id: "CU03", name: "Renovation Permit",              duration: "45 min", fee: "250 ETB" },
    { id: "CU04", name: "Infrastructure Service Request", duration: "30 min", fee: "Free" },
  ],
  "Public Services Office": [
    { id: "PS01", name: "Garbage Collection Request",     duration: "15 min", fee: "Free" },
    { id: "PS02", name: "Street Maintenance Complaint",   duration: "15 min", fee: "Free" },
    { id: "PS03", name: "Water Service Registration",     duration: "30 min", fee: "100 ETB" },
    { id: "PS04", name: "Electricity Service Registration",duration:"30 min", fee: "100 ETB" },
  ],
};

const offices = [
  { id: 1, name: "Civil Registration Office", icon: FiCreditCard, color: "blue", desc: "ID cards, birth, marriage & death certificates" },
  { id: 2, name: "Residence & Population Office", icon: FiHome, color: "emerald", desc: "Residence certificates, family & household registration" },
  { id: 3, name: "Business & Trade Office", icon: FiBriefcase, color: "amber", desc: "Business licenses, trade registration & renewals" },
  { id: 4, name: "Land & Property Office", icon: FiMap, color: "purple", desc: "Land certificates, transfers, building permits" },
  { id: 5, name: "Tax & Finance Office", icon: FiDollarSign, color: "orange", desc: "Tax payments, clearance certificates, penalties" },
  { id: 6, name: "Construction & Urban Planning Office", icon: FiTool, color: "cyan", desc: "Construction permits, building approvals, renovations" },
  { id: 7, name: "Public Services Office", icon: FiGlobe, color: "indigo", desc: "Garbage, street maintenance, water & electricity" },
];

const BookAppointment = () => {
  const { user } = useContext(AuthContext);
  const [currentStep, setCurrentStep] = useState(1);
  const [allServices, setAllServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffice, setSelectedOffice] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSession, setSelectedSession] = useState(null); // 'morning' | 'afternoon'
  const [ticketGenerated, setTicketGenerated] = useState(false);
  const [ticketData, setTicketData] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get('/services');
        setAllServices(res.data);
      } catch (error) {
        toast.error('Failed to load services');
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const filteredServices = allServices.filter(s => s.department === selectedOffice);

  const isPriority = user?.age >= 60;

  const handleNext = () => {
    if (currentStep === 1 && !selectedOffice) return toast.error('Please select an office');
    if (currentStep === 2 && !selectedService) return toast.error('Please select a service');
    if (currentStep === 3 && (!selectedDate || !selectedSession)) return toast.error('Please select date and session');
    
    if (currentStep === 1) setSelectedService(null);
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => setCurrentStep(currentStep - 1);

  const generateTicket = async () => {
    setSubmitting(true);
    try {
      // Find the database ID for the selected service name
      const dbService = allServices.find(s => s.name === selectedService.name);
      
      if (!dbService) {
        toast.error('Service not synced with database. Please re-seed.');
        setSubmitting(false);
        return;
      }

      // Save to backend
      const res = await api.post('/appointments', {
        service_id: dbService.id,
        appointment_date: selectedDate,
        time_slot: selectedSession === 'morning' ? 'Morning' : 'Afternoon'
      });

      const officeCode = {
        "Civil Registration Office": "CR",
        "Residence & Population Office": "RP",
        "Business & Trade Office": "BT",
        "Land & Property Office": "LP",
        "Tax & Finance Office": "TF",
        "Construction & Urban Planning Office": "CU",
        "Public Services Office": "PS",
      }[selectedOffice] || "GS";

      const number = String(Math.floor(Math.random() * 900) + 100);
      const queueNumber = `${officeCode}-${number}`;
      const bookingRef = `AM-${res.data.id || Date.now().toString().slice(-8)}`;
      const issuedAt = new Date().toLocaleString();

      setTicketData({ queueNumber, bookingRef, issuedAt });
      setTicketGenerated(true);
      toast.success('Appointment confirmed!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to confirm appointment');
    } finally {
      setSubmitting(false);
    }
  };

  const resetBooking = () => {
    setCurrentStep(1);
    setSelectedOffice(null);
    setSelectedService(null);
    setSelectedDate('');
    setSelectedSession(null);
    setTicketGenerated(false);
    setTicketData(null);
  };

  const steps = [
    { num: 1, title: 'Office' },
    { num: 2, title: 'Service' },
    { num: 3, title: 'Schedule' },
    { num: 4, title: 'Confirm' }
  ];

  if (ticketGenerated && ticketData) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 print:p-0 print:m-0">
        <div className="text-center mb-8 print:hidden">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full mb-4">
            <FiCheckCircle size={40} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Appointment Confirmed!</h1>
          <p className="text-slate-500 mt-2">Your queue ticket has been generated. Please arrive during your selected session.</p>
        </div>

        {/* PHYSICAL TICKET CARD */}
        <div className="bg-white border-2 border-dashed border-amber-400 rounded-[2rem] p-8 shadow-2xl max-w-[420px] mx-auto relative overflow-hidden print:shadow-none print:border-slate-300">
          {/* Ticket Punch Holes */}
          <div className="absolute top-1/2 -left-4 w-8 h-8 bg-slate-50 rounded-full border-2 border-dashed border-amber-400 -translate-y-1/2 print:hidden"></div>
          <div className="absolute top-1/2 -right-4 w-8 h-8 bg-slate-50 rounded-full border-2 border-dashed border-amber-400 -translate-y-1/2 print:hidden"></div>
          
          <div className="text-center">
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter">MQAMS</h2>
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-1">Arba Minch City Administration</p>
            
            <div className="border-t border-dashed border-slate-200 my-6"></div>
            
            <p className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400">Your Queue Number</p>
            <div className="bg-amber-500 text-white rounded-2xl px-8 py-5 my-4 inline-block shadow-lg shadow-amber-200 print:shadow-none">
              <span className="text-5xl font-black tracking-widest leading-none">{ticketData.queueNumber}</span>
            </div>

            <div className="border-t border-dashed border-slate-200 my-6"></div>

            <div className="grid grid-cols-2 gap-y-4 gap-x-4 text-left">
              <div>
                <p className="text-[9px] uppercase font-bold text-slate-400">Service</p>
                <p className="text-xs font-bold text-slate-800 truncate">{selectedService.name}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold text-slate-400">Date</p>
                <p className="text-xs font-bold text-slate-800">{new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold text-slate-400">Session</p>
                <p className="text-xs font-bold text-slate-800 capitalize">{selectedSession}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold text-slate-400">Window</p>
                <p className="text-xs font-bold text-slate-800">{selectedSession === 'morning' ? '8:00 AM - 12:00 PM' : '2:00 PM - 6:00 PM'}</p>
              </div>
            </div>

            <div className="border-t border-dashed border-slate-200 my-6"></div>

            <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold px-1">
              <span>REF: {ticketData.bookingRef}</span>
              <span>ISSUED: {new Date().toLocaleDateString()}</span>
            </div>

            {/* Barcode Simulation */}
            <div className="mt-6">
              <div 
                className="h-10 w-44 mx-auto opacity-80"
                style={{
                  background: 'repeating-linear-gradient(90deg, #1e293b 0px, #1e293b 2px, transparent 2px, transparent 5px, #1e293b 5px, #1e293b 7px, transparent 7px, transparent 12px)'
                }}
              ></div>
              <p className="text-[9px] font-mono text-slate-400 mt-1 tracking-[0.5em]">{ticketData.queueNumber}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 print:hidden">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-8 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
          >
            <FiPrinter /> Print Ticket
          </button>
          <button 
            onClick={resetBooking}
            className="flex items-center gap-2 px-8 py-3 bg-amber-500 text-slate-900 font-bold rounded-2xl hover:bg-amber-400 transition-all shadow-lg shadow-amber-200"
          >
            <FiPlus /> Book Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden min-h-[700px] flex flex-col">
      {/* HEADER SECTION */}
      <div className="bg-slate-50/50 px-8 py-10 border-b border-slate-100">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Book Appointment</h1>
            <p className="text-slate-500 font-medium mt-1">Arba Minch Municipality Services</p>
          </div>
          
          {/* Progress Indicator */}
          <div className="flex items-center gap-2">
            {steps.map((s, idx) => (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    currentStep === s.num ? 'bg-amber-500 text-white shadow-lg shadow-amber-200 scale-110' : 
                    currentStep > s.num ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {currentStep > s.num ? <FiCheckCircle /> : s.num}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest mt-2 ${currentStep === s.num ? 'text-amber-500' : 'text-slate-400'}`}>
                    {s.title}
                  </span>
                </div>
                {idx < steps.length - 1 && <div className="w-6 h-[2px] bg-slate-200 mt-[-18px]"></div>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENT SECTION */}
      <div className="flex-1 p-8 md:p-10">
        
        {/* STEP 1: OFFICE SELECTION */}
        {currentStep === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
              <h2 className="text-xl font-black text-slate-900">Select an office</h2>
              <p className="text-slate-500 text-sm mt-1">Choose the department you need to visit today.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {offices.map(office => (
                <div 
                  key={office.id}
                  onClick={() => setSelectedOffice(office.name)}
                  className={`group p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer flex items-start gap-4 ${
                    selectedOffice === office.name 
                    ? 'border-amber-500 bg-amber-50 shadow-lg shadow-amber-100' 
                    : 'border-slate-100 hover:border-amber-200 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 transition-colors ${
                    selectedOffice === office.name ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-amber-100 group-hover:text-amber-600'
                  }`}>
                    <office.icon />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-amber-600 transition-colors">{office.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{office.desc}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-3">Arba Minch Administration</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: SERVICE SELECTION */}
        {currentStep === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="mb-8">
              <h2 className="text-xl font-black text-slate-900">Select a service — <span className="text-amber-600">{selectedOffice}</span></h2>
              <p className="text-slate-500 text-sm mt-1">Choose the specific service you are requesting.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {officeServices[selectedOffice]?.map(service => (
                <div 
                  key={service.id}
                  onClick={() => setSelectedService(service)}
                  className={`p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer flex flex-col justify-between h-full ${
                    selectedService?.id === service.id 
                    ? 'border-amber-500 bg-amber-50 shadow-lg shadow-amber-100' 
                    : 'border-slate-100 hover:border-amber-200 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-4">{service.name}</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {service.duration}
                      </span>
                      <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {service.fee}
                      </span>
                    </div>
                    <WhatToBring serviceId={service.id} />
                  </div>
                  {selectedService?.id === service.id && (
                    <div className="flex justify-end mt-4">
                      <FiCheckCircle className="text-amber-600 text-xl" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: SCHEDULE */}
        {currentStep === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="mb-10">
              <h2 className="text-xl font-black text-slate-900">Date & Session</h2>
              <p className="text-slate-500 text-sm mt-1">Pick your preferred day and work window.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
              <div className="lg:col-span-2">
                <label className="block text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Select appointment date</label>
                <input 
                  type="date" 
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 font-bold focus:border-amber-500 focus:ring-0 focus:bg-white outline-none transition-all shadow-sm"
                />
                <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <div className="flex gap-3">
                    <FiClock className="text-blue-600 mt-1 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-blue-900 uppercase tracking-wider">Office Hours</p>
                      <p className="text-xs text-blue-700 mt-1 leading-relaxed font-medium">Mon–Fri: 8:00 AM – 6:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-3">
                <label className="block text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Work Session</label>
                <div className="space-y-4">
                  {/* Morning Card */}
                  <div 
                    onClick={() => setSelectedSession('morning')}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-5 ${
                      selectedSession === 'morning' 
                      ? 'border-amber-500 bg-amber-50 shadow-lg shadow-amber-100' 
                      : 'border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0 ${
                      selectedSession === 'morning' ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-500'
                    }`}>
                      <FiSun />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-900">Morning Session</h3>
                        <span className="bg-blue-50 text-blue-600 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">Recommended</span>
                      </div>
                      <p className="text-xl font-black text-slate-900 mt-0.5">8:00 AM – 12:00 PM</p>
                      <p className="text-xs text-slate-500 mt-1">4-hour window. Arrive within this session.</p>
                    </div>
                  </div>

                  {/* Afternoon Card */}
                  <div 
                    onClick={() => setSelectedSession('afternoon')}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-5 ${
                      selectedSession === 'afternoon' 
                      ? 'border-amber-500 bg-amber-50 shadow-lg shadow-amber-100' 
                      : 'border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0 ${
                      selectedSession === 'afternoon' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400'
                    }`}>
                      <FiClock />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900">Afternoon Session</h3>
                      <p className="text-xl font-black text-slate-900 mt-0.5">2:00 PM – 6:00 PM</p>
                      <p className="text-xs text-slate-500 mt-1">4-hour window. Arrive within this session.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: CONFIRM */}
        {currentStep === 4 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 max-w-2xl mx-auto">
            <div className="mb-8 text-center md:text-left">
              <h2 className="text-2xl font-black text-slate-900">Confirm your appointment</h2>
              <p className="text-slate-500 text-sm mt-1">Please review your booking details before generating your ticket.</p>
            </div>
            
            <div className="bg-slate-50/50 border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="px-8 py-6 border-b border-slate-200 bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center text-xl">
                    <FiCheckCircle />
                  </div>
                  <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">Appointment Summary</h3>
                </div>
              </div>
              <div className="p-8 space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Office</span>
                  <span className="text-sm font-bold text-slate-900">{selectedOffice}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Service</span>
                  <span className="text-sm font-bold text-slate-900">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Fee</span>
                  <span className="text-sm font-black text-amber-600">{selectedService?.fee}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Date</span>
                  <span className="text-sm font-bold text-slate-900">{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Session</span>
                  <span className="text-sm font-bold text-slate-900 capitalize">{selectedSession} ({selectedSession === 'morning' ? '8:00 AM – 12:00 PM' : '2:00 PM – 6:00 PM'})</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Queue type</span>
                  {isPriority ? (
                    <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                      <FiCheckCircle size={10} /> Priority (60+)
                    </span>
                  ) : (
                    <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Standard</span>
                  )}
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Location</p>
                   <p className="text-xs font-medium text-slate-600">Arba Minch City Administration Hall, Arba Minch, South Ethiopia</p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
              <span className="text-xl">⚠️</span>
              <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                Please arrive within your selected session window. Your queue number will be called in order of arrival at the office.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER NAVIGATION */}
      <div className="bg-slate-50 px-8 py-6 border-t border-slate-100 flex items-center justify-between">
        <button 
          onClick={handleBack} 
          disabled={currentStep === 1 || submitting}
          className={`group flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${
            currentStep === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-400 hover:text-slate-900 hover:bg-white'
          }`}
        >
          <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back
        </button>
        
        {currentStep < 4 ? (
          <button 
            onClick={handleNext} 
            className="flex items-center gap-2 px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-amber-500 hover:shadow-xl hover:shadow-amber-200 transition-all active:scale-95 group"
          >
            Next Step <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        ) : (
          <button 
            onClick={generateTicket} 
            disabled={submitting}
            className="flex items-center justify-center gap-2 px-12 py-4 bg-amber-500 text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-amber-400 shadow-xl shadow-amber-200 transition-all active:scale-95 min-w-[240px]"
          >
            {submitting ? (
              <div className="w-5 h-5 border-3 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>Confirm & Get Ticket <FiArrowRight /></>
            )}
          </button>
        )}
      </div>

      {/* PRINT STYLES */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print\\:block, .print\\:block * { visibility: visible; }
          .max-w-2xl { position: absolute; left: 0; top: 0; width: 100%; max-width: 100%; margin: 0; padding: 0; }
          .shadow-2xl, .shadow-xl, .shadow-lg { box-shadow: none !important; }
          .border-amber-400 { border-color: #cbd5e1 !important; }
          .bg-amber-500 { background-color: #000 !important; color: #fff !important; }
        }
      `}</style>
    </div>
  );
};

export default BookAppointment;
