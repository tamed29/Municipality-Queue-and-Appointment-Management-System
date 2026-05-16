import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiClock, FiUsers, FiShield, FiArrowRight, FiCheckCircle, FiBell, FiFileText, FiMenu, FiX } from 'react-icons/fi';

export default function LandingPage() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsVisible(false); // Scrolling down
      } else {
        setIsVisible(true); // Scrolling up
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleScrollTo = (e, id) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const textWrapStyle = {
    maxWidth: '560px',
    width: '100%',
    whiteSpace: 'normal',
    wordBreak: 'normal',
    overflowWrap: 'normal'
  };

  return (
    <div className="font-sans antialiased text-slate-900 bg-slate-50 min-h-screen">
      
      {/* SECTION 1: NAVIGATION BAR */}
      <nav className={`bg-slate-900 fixed top-0 w-full z-50 shadow-sm h-16 border-b border-slate-800 transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
          
          {/* Left - Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
              <span className="text-slate-900 font-bold text-lg">AM</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white text-sm font-semibold leading-tight">Arba Minch City</span>
              <span className="text-slate-400 text-[10px] leading-tight mt-0.5 tracking-wide uppercase font-bold">Portal</span>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-white p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>

          {/* Desktop - Links + Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <a href="#services" onClick={(e) => handleScrollTo(e, 'services')} className="text-slate-400 hover:text-white text-sm px-3 py-1.5 rounded-md hover:bg-slate-800 transition-colors cursor-pointer block whitespace-nowrap">Services</a>
            <a href="#how-it-works" onClick={(e) => handleScrollTo(e, 'how-it-works')} className="text-slate-400 hover:text-white text-sm px-3 py-1.5 rounded-md hover:bg-slate-800 transition-colors cursor-pointer block whitespace-nowrap">How it works</a>
            <a href="#about" onClick={(e) => handleScrollTo(e, 'about')} className="text-slate-400 hover:text-white text-sm px-3 py-1.5 rounded-md hover:bg-slate-800 transition-colors cursor-pointer block whitespace-nowrap">About</a>
            
            <div className="w-px h-5 bg-slate-700 mx-2"></div>
            
            <button 
              onClick={() => navigate('/login')}
              className="border border-slate-600 text-slate-300 hover:border-slate-400 hover:text-white px-5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap shrink-0"
            >
              Sign in
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="bg-amber-500 text-slate-900 px-5 py-2 rounded-lg text-sm font-bold hover:bg-amber-400 transition-all whitespace-nowrap shrink-0 shadow-md shadow-amber-500/10"
            >
              Get started
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="absolute top-16 left-0 w-full bg-slate-900 border-b border-slate-800 p-6 md:hidden flex flex-col gap-6 animate-in slide-in-from-top duration-300">
            <div className="flex flex-col gap-4">
              <a href="#services" onClick={(e) => handleScrollTo(e, 'services')} className="text-slate-300 text-lg font-medium">Services</a>
              <a href="#how-it-works" onClick={(e) => handleScrollTo(e, 'how-it-works')} className="text-slate-300 text-lg font-medium">How it works</a>
              <a href="#about" onClick={(e) => handleScrollTo(e, 'about')} className="text-slate-300 text-lg font-medium">About</a>
            </div>
            <div className="flex flex-col gap-3 pt-4 border-t border-slate-800">
              <button 
                onClick={() => navigate('/login')}
                className="w-full py-3 rounded-xl border border-slate-700 text-white font-medium"
              >
                Sign in
              </button>
              <button 
                onClick={() => navigate('/register')}
                className="w-full py-3 rounded-xl bg-amber-500 text-slate-900 font-bold"
              >
                Get started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* SECTION 2: HERO (Full viewport height minus navbar) */}
      <section className="bg-slate-900 px-6 overflow-hidden relative flex items-center min-h-[calc(100vh-4rem)] py-12 lg:py-0">

        <div className="max-w-6xl mx-auto w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Hero Left Content */}
            <div className="block w-full">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 rounded-full px-4 py-1.5 mb-8">
                <div className="w-2 h-2 bg-amber-400 rounded-full shrink-0"></div>
                <span className="text-amber-400 text-xs font-bold uppercase tracking-widest whitespace-nowrap">Arba Minch Official Portal</span>
              </div>

              {/* Headline */}
              <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight tracking-tight mb-6">
                Skip the queue. <br />
                <span className="text-amber-400 italic font-bold">Book smarter.</span>
              </h1>

              {/* Subheadline */}
              <p className="block text-lg md:text-xl text-slate-400 leading-relaxed mb-10" style={textWrapStyle}>
                Access all Arba Minch municipality services online. Book appointments, get a digital queue number, and arrive only when it's your turn — no waiting, no crowds.
              </p>

              {/* Action buttons (Perfectly sized and aligned) */}
              <div className="flex flex-col sm:flex-row gap-4 mb-16">
                <button 
                  onClick={() => navigate('/register')}
                  className="bg-amber-500 text-slate-900 px-8 py-4 rounded-xl font-bold text-base hover:bg-amber-400 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 w-full sm:w-auto shrink-0 shadow-lg shadow-amber-500/20"
                >
                  <FiCalendar size={18} className="shrink-0" />
                  Book an appointment
                </button>
                <button 
                  onClick={(e) => handleScrollTo(e, 'how-it-works')}
                  className="border border-slate-600 text-slate-300 px-8 py-4 rounded-xl font-semibold text-base hover:border-slate-400 hover:text-white hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 w-full sm:w-auto bg-slate-800/50 shrink-0"
                >
                  Learn how it works
                  <FiArrowRight size={16} className="shrink-0" />
                </button>
              </div>

              {/* Stats row */}
              <div className="border-t border-slate-800/80 pt-8 flex flex-wrap items-center gap-x-10 gap-y-6">
                <div className="flex flex-col">
                  <strong className="text-3xl font-extrabold text-white tracking-tight">30+</strong>
                  <span className="text-[11px] text-slate-400 mt-1 font-bold uppercase tracking-wider block whitespace-nowrap">Services</span>
                </div>
                <div className="w-px h-10 bg-slate-700 hidden sm:block"></div>
                <div className="flex flex-col">
                  <strong className="text-3xl font-extrabold text-white tracking-tight">7</strong>
                  <span className="text-[11px] text-slate-400 mt-1 font-bold uppercase tracking-wider block whitespace-nowrap">Categories</span>
                </div>
                <div className="w-px h-10 bg-slate-700 hidden sm:block"></div>
                <div className="flex flex-col">
                  <strong className="text-3xl font-extrabold text-white tracking-tight">24/7</strong>
                  <span className="text-[11px] text-slate-400 mt-1 font-bold uppercase tracking-wider block whitespace-nowrap">Online</span>
                </div>
                <div className="w-px h-10 bg-slate-700 hidden sm:block"></div>
                <div className="flex flex-col">
                  <strong className="text-3xl font-extrabold text-emerald-400 tracking-tight">P-001</strong>
                  <span className="text-[11px] text-emerald-500/80 mt-1 font-bold uppercase tracking-wider block whitespace-nowrap">Priority</span>
                </div>
              </div>
            </div>

            {/* Hero Right Illustration */}
            <div className="hidden lg:flex justify-end relative">
              <div className="relative w-full max-w-md aspect-square">
                <div className="relative h-full w-full bg-slate-800/50 border border-slate-700/50 rounded-3xl backdrop-blur-sm p-8 shadow-2xl flex flex-col justify-between overflow-hidden">
                  
                  <div className="space-y-5">
                    <div className="flex justify-between items-center mb-8">
                      <div className="w-14 h-14 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                        <FiCalendar size={28} />
                      </div>
                      <div className="px-4 py-1.5 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/30 whitespace-nowrap">
                        System Active
                      </div>
                    </div>
                    
                    <div className="w-3/4 h-5 bg-slate-700/80 rounded-full"></div>
                    <div className="w-1/2 h-5 bg-slate-700/80 rounded-full"></div>
                  </div>

                  <div className="mt-10 space-y-4">
                    <div className="bg-slate-700/50 border border-slate-600/50 rounded-2xl p-5 flex items-center gap-4 shadow-lg shadow-black/10">
                      <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center shrink-0">
                        <span className="font-bold text-lg">A01</span>
                      </div>
                      <div className="flex flex-col gap-2 w-full">
                        <div className="w-24 h-3 bg-slate-500 rounded-full"></div>
                        <div className="w-16 h-2 bg-slate-600 rounded-full"></div>
                      </div>
                    </div>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 flex items-center gap-4 shadow-lg shadow-black/10">
                      <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center shrink-0">
                        <span className="font-bold text-lg">P01</span>
                      </div>
                      <div className="flex flex-col gap-2 w-full">
                        <div className="w-32 h-3 bg-slate-500 rounded-full"></div>
                        <div className="w-20 h-2 bg-emerald-500/50 rounded-full"></div>
                      </div>
                      <div className="ml-auto shrink-0 bg-emerald-500/20 p-1 rounded-full">
                        <FiCheckCircle className="text-emerald-400" size={20} />
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 3: HOW IT WORKS */}
      <section id="how-it-works" className="bg-white py-24 px-6 block w-full">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center md:text-left mb-14 block w-full">
            <div className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-3">How it works</div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">From home to service in 4 simple steps</h2>
            <p className="block text-base text-slate-500 leading-relaxed mx-auto md:mx-0" style={textWrapStyle}>
              No complicated process. Register once, book anytime, and let the system manage your queue.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            {/* Step 1 */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 hover:border-blue-400 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-110"></div>
              <div className="w-12 h-12 bg-slate-900 text-amber-400 rounded-xl flex items-center justify-center text-base font-bold mb-6 relative z-10 shadow-sm shrink-0">01</div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3 relative z-10">Create your account</h3>
              <p className="block text-sm text-slate-500 leading-relaxed relative z-10" style={textWrapStyle}>
                Register with your national ID, phone number, and age. Your profile determines your queue priority automatically.
              </p>
            </div>
            {/* Step 2 */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 hover:border-blue-400 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-110"></div>
              <div className="w-12 h-12 bg-slate-900 text-amber-400 rounded-xl flex items-center justify-center text-base font-bold mb-6 relative z-10 shadow-sm shrink-0">02</div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3 relative z-10">Choose a service</h3>
              <p className="block text-sm text-slate-500 leading-relaxed relative z-10" style={textWrapStyle}>
                Select from 7 categories and 30+ sub-services. Pick your preferred date and an available time slot.
              </p>
            </div>
            {/* Step 3 */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 hover:border-blue-400 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-110"></div>
              <div className="w-12 h-12 bg-slate-900 text-amber-400 rounded-xl flex items-center justify-center text-base font-bold mb-6 relative z-10 shadow-sm shrink-0">03</div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3 relative z-10">Get your confirmation</h3>
              <p className="block text-sm text-slate-500 leading-relaxed relative z-10" style={textWrapStyle}>
                Receive a booking confirmation and queue number on your phone before visiting the office.
              </p>
            </div>
            {/* Step 4 */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 hover:border-blue-400 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-110"></div>
              <div className="w-12 h-12 bg-slate-900 text-amber-400 rounded-xl flex items-center justify-center text-base font-bold mb-6 relative z-10 shadow-sm shrink-0">04</div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3 relative z-10">Arrive and be served</h3>
              <p className="block text-sm text-slate-500 leading-relaxed relative z-10" style={textWrapStyle}>
                Come at your scheduled time. Your queue number is called and you receive service immediately.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 4: SERVICES OVERVIEW */}
      <section id="services" className="bg-slate-50 py-24 px-6 border-y border-slate-200/60 block w-full">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center md:text-left mb-14 block w-full">
            <div className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-3">Available services</div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">All municipality services, one platform</h2>
            <p className="block text-base text-slate-500 leading-relaxed mx-auto md:mx-0" style={textWrapStyle}>
              Access over 30 services categorized into 7 main departments for your convenience.
            </p>
          </div>

          <div className="flex items-stretch overflow-x-auto pb-8 gap-6 md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-visible w-full scrollbar-hide snap-x scroll-pl-6">
            {/* Card 1 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-blue-400 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col min-w-[280px] md:min-w-0 md:w-full snap-start shadow-sm min-h-[380px] md:min-h-0">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 text-2xl bg-blue-50 shadow-sm shrink-0">🪪</div>
              <h3 className="text-base font-semibold text-slate-900 mb-4">Civil registration</h3>
              <div className="space-y-2 flex-1">
                {['ID card issuance', 'ID card renewal', 'ID replacement', 'Birth certificate', 'Marriage certificate', 'Death certificate'].map(item => (
                  <div key={item} className="flex items-center gap-2.5 text-[13px] text-slate-500 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0"></div>
                    {item}
                  </div>
                ))}
              </div>
            </div>
            {/* Card 2 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-blue-400 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col min-w-[280px] md:min-w-0 md:w-full snap-start shadow-sm min-h-[380px] md:min-h-0">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 text-2xl bg-emerald-50 shadow-sm shrink-0">🏘️</div>
              <h3 className="text-base font-semibold text-slate-900 mb-4">Residence & population</h3>
              <div className="space-y-2 flex-1">
                {['Residence certificate', 'Change of address', 'Family registration', 'Household update'].map(item => (
                  <div key={item} className="flex items-center gap-2.5 text-[13px] text-slate-500 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0"></div>
                    {item}
                  </div>
                ))}
              </div>
            </div>
            {/* Card 3 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-blue-400 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col min-w-[280px] md:min-w-0 md:w-full snap-start shadow-sm min-h-[380px] md:min-h-0">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 text-2xl bg-amber-50 shadow-sm shrink-0">🏪</div>
              <h3 className="text-base font-semibold text-slate-900 mb-4">Business & trade</h3>
              <div className="space-y-2 flex-1">
                {['New business license', 'License renewal', 'License cancellation', 'Trade registration'].map(item => (
                  <div key={item} className="flex items-center gap-2.5 text-[13px] text-slate-500 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0"></div>
                    {item}
                  </div>
                ))}
              </div>
            </div>
            {/* Card 4 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-blue-400 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col min-w-[280px] md:min-w-0 md:w-full snap-start shadow-sm min-h-[380px] md:min-h-0">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 text-2xl bg-purple-50 shadow-sm shrink-0">🏗️</div>
              <h3 className="text-base font-semibold text-slate-900 mb-4">Land & property</h3>
              <div className="space-y-2 flex-1">
                {['Land ownership certificate', 'Land transfer', 'Building permit', 'Property registration', 'Property tax'].map(item => (
                  <div key={item} className="flex items-center gap-2.5 text-[13px] text-slate-500 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0"></div>
                    {item}
                  </div>
                ))}
              </div>
            </div>
            {/* Card 5 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-blue-400 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col min-w-[280px] md:min-w-0 md:w-full snap-start shadow-sm min-h-[380px] md:min-h-0">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 text-2xl bg-orange-50 shadow-sm shrink-0">💰</div>
              <h3 className="text-base font-semibold text-slate-900 mb-4">Tax & finance</h3>
              <div className="space-y-2 flex-1">
                {['Tax payment', 'Tax clearance certificate', 'Business tax registration', 'Penalty payment'].map(item => (
                  <div key={item} className="flex items-center gap-2.5 text-[13px] text-slate-500 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0"></div>
                    {item}
                  </div>
                ))}
              </div>
            </div>
            {/* Card 6 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-blue-400 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col min-w-[280px] md:min-w-0 md:w-full snap-start shadow-sm min-h-[380px] md:min-h-0">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 text-2xl bg-cyan-50 shadow-sm shrink-0">🏛️</div>
              <h3 className="text-base font-semibold text-slate-900 mb-4">Construction & planning</h3>
              <div className="space-y-2 flex-1">
                {['Construction permit', 'Building plan approval', 'Renovation permit', 'Infrastructure request'].map(item => (
                  <div key={item} className="flex items-center gap-2.5 text-[13px] text-slate-500 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0"></div>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: PRIORITY SERVICE BANNER */}
      <section className="bg-gradient-to-r from-emerald-50 to-blue-50 py-16 px-6 block w-full">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
          
          <div className="flex-1 text-center md:text-left block w-full">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">Priority service for citizens who need it most</h2>
            <p className="block text-slate-600 text-base leading-relaxed mx-auto md:mx-0" style={textWrapStyle}>
              The system automatically detects eligible citizens based on their registered profile and places them in the priority queue. No extra steps required.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 justify-center md:justify-end shrink-0">
            <div className="bg-white border-l-4 border-l-amber-500 border-y border-r border-slate-200 rounded-r-2xl rounded-l-md px-5 py-3.5 flex items-center gap-3 shadow-sm shrink-0">
              <span className="text-xl shrink-0">👴</span> 
              <span className="text-sm font-semibold text-slate-800 whitespace-nowrap">Elderly (60+)</span>
            </div>
            <div className="bg-white border-l-4 border-l-blue-500 border-y border-r border-slate-200 rounded-r-2xl rounded-l-md px-5 py-3.5 flex items-center gap-3 shadow-sm shrink-0">
              <span className="text-xl shrink-0">♿</span> 
              <span className="text-sm font-semibold text-slate-800 whitespace-nowrap">Disability</span>
            </div>
            <div className="bg-white border-l-4 border-l-purple-500 border-y border-r border-slate-200 rounded-r-2xl rounded-l-md px-5 py-3.5 flex items-center gap-3 shadow-sm shrink-0">
              <span className="text-xl shrink-0">🤰</span> 
              <span className="text-sm font-semibold text-slate-800 whitespace-nowrap">Pregnant</span>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 6: SYSTEM FEATURES */}
      <section id="features" className="bg-white py-24 px-6 border-t border-slate-200/60 block w-full">
        <div className="max-w-6xl mx-auto text-center">
          
          <div className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-3">System features</div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Built for citizens and staff alike</h2>
          <p className="block text-base text-slate-500 leading-relaxed mx-auto mb-16" style={textWrapStyle}>
            MQAMS serves both Arba Minch residents booking services and administration staff managing daily operations.
          </p>

          <div className="flex items-stretch overflow-x-auto pb-8 gap-8 md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-visible w-full scrollbar-hide snap-x scroll-pl-6">
            {/* Feature 1 */}
            <div className="border border-slate-200 rounded-2xl p-8 hover:shadow-lg hover:border-blue-200 transition-all duration-300 text-left bg-slate-50/50 min-w-[280px] md:min-w-0 md:w-full snap-start shadow-sm flex flex-col min-h-[220px] md:min-h-0">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6 shrink-0">
                <FiCalendar className="text-2xl" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-3">Online appointment booking</h3>
              <p className="block text-sm text-slate-500 leading-relaxed flex-1" style={textWrapStyle}>
                Book any of 30+ services from home, 24 hours a day, before your office visit.
              </p>
            </div>
            {/* Feature 2 */}
            <div className="border border-slate-200 rounded-2xl p-8 hover:shadow-lg hover:border-amber-200 transition-all duration-300 text-left bg-slate-50/50 min-w-[280px] md:min-w-0 md:w-full snap-start shadow-sm flex flex-col min-h-[220px] md:min-h-0">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-6 shrink-0">
                <FiClock className="text-2xl" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-3">Digital queue management</h3>
              <p className="block text-sm text-slate-500 leading-relaxed flex-1" style={textWrapStyle}>
                Receive a digital queue number on arrival and track your position in real time.
              </p>
            </div>
            {/* Feature 3 */}
            <div className="border border-slate-200 rounded-2xl p-8 hover:shadow-lg hover:border-emerald-200 transition-all duration-300 text-left bg-slate-50/50 min-w-[280px] md:min-w-0 md:w-full snap-start shadow-sm flex flex-col min-h-[220px] md:min-h-0">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6 shrink-0">
                <FiShield className="text-2xl" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-3">Automatic priority detection</h3>
              <p className="block text-sm text-slate-500 leading-relaxed flex-1" style={textWrapStyle}>
                Elderly, disabled, and pregnant citizens are automatically placed in the priority queue.
              </p>
            </div>
            {/* Feature 4 */}
            <div className="border border-slate-200 rounded-2xl p-8 hover:shadow-lg hover:border-purple-200 transition-all duration-300 text-left bg-slate-50/50 min-w-[280px] md:min-w-0 md:w-full snap-start shadow-sm flex flex-col min-h-[220px] md:min-h-0">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6 shrink-0">
                <FiUsers className="text-2xl" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-3">Admin control dashboard</h3>
              <p className="block text-sm text-slate-500 leading-relaxed flex-1" style={textWrapStyle}>
                Staff can call the next queue number, manage bookings, and view daily service reports.
              </p>
            </div>
            {/* Feature 5 */}
            <div className="border border-slate-200 rounded-2xl p-8 hover:shadow-lg hover:border-cyan-200 transition-all duration-300 text-left bg-slate-50/50 min-w-[280px] md:min-w-0 md:w-full snap-start shadow-sm flex flex-col min-h-[220px] md:min-h-0">
              <div className="w-12 h-12 bg-cyan-100 text-cyan-600 rounded-xl flex items-center justify-center mb-6 shrink-0">
                <FiBell className="text-2xl" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-3">Appointment reminders</h3>
              <p className="block text-sm text-slate-500 leading-relaxed flex-1" style={textWrapStyle}>
                Receive an SMS or in-app reminder before your appointment so you never miss your slot.
              </p>
            </div>
            {/* Feature 6 */}
            <div className="border border-slate-200 rounded-2xl p-8 hover:shadow-lg hover:border-orange-200 transition-all duration-300 text-left bg-slate-50/50 min-w-[280px] md:min-w-0 md:w-full snap-start shadow-sm flex flex-col min-h-[220px] md:min-h-0">
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-6 shrink-0">
                <FiFileText className="text-2xl" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-3">Service history & records</h3>
              <p className="block text-sm text-slate-500 leading-relaxed flex-1" style={textWrapStyle}>
                View all past appointments, completed services, and queue records in your citizen profile.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 7: CALL TO ACTION (Properly sized buttons) */}
      <section className="bg-slate-900 py-24 px-6 block w-full">
        <div className="max-w-5xl mx-auto block w-full">
          <div className="bg-slate-800/80 border border-slate-700/50 rounded-[2rem] p-10 md:p-16 text-center shadow-2xl relative overflow-hidden block w-full">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none rounded-[2rem]"></div>
            
            <div className="relative z-10 block w-full">
              <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 rounded-full px-4 py-1.5 mb-8">
                <div className="w-2 h-2 bg-amber-400 rounded-full shrink-0"></div>
                <span className="text-amber-400 text-xs font-bold uppercase tracking-widest whitespace-nowrap">Official government portal</span>
              </div>

              <h2 className="text-4xl font-extrabold text-white mb-5 tracking-tight">Start using MQAMS today</h2>
              
              <p className="block text-slate-400 text-lg leading-relaxed mx-auto mb-10" style={textWrapStyle}>
                Register once, book anytime. No more standing in line at Arba Minch City Administration Hall.
              </p>

              {/* ACTION BUTTONS (Responsive, side-by-side on desktop) */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-xl mx-auto">
                <button 
                  onClick={() => navigate('/register')}
                  className="bg-amber-500 text-slate-900 px-8 py-4 rounded-xl font-bold text-base hover:bg-amber-400 flex justify-center items-center gap-2 transition-all w-full sm:w-auto shadow-lg shadow-amber-500/20 shrink-0"
                >
                  Create free account
                  <FiArrowRight size={18} className="shrink-0" />
                </button>
                <button 
                  onClick={() => navigate('/login')}
                  className="bg-slate-700/50 border border-slate-600 text-slate-200 px-10 py-4 rounded-xl font-semibold text-base hover:bg-slate-700 hover:text-white transition-all w-full sm:w-auto shrink-0"
                >
                  Sign in
                </button>
              </div>

              <div className="flex items-center justify-center gap-x-8 gap-y-4 mt-10 flex-wrap w-full">
                <div className="flex items-center gap-2 text-slate-400 text-sm font-medium whitespace-nowrap">
                  <FiCheckCircle className="text-emerald-400 shrink-0" size={16} /> Free to register
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-sm font-medium whitespace-nowrap">
                  <FiCheckCircle className="text-emerald-400 shrink-0" size={16} /> Secure & private
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-sm font-medium whitespace-nowrap">
                  <FiCheckCircle className="text-emerald-400 shrink-0" size={16} /> Priority for elderly
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: PROFESSIONAL FOOTER */}
      <footer id="about" className="bg-slate-950 pt-20 pb-8 px-6 border-t border-slate-800 block w-full">
        <div className="max-w-6xl mx-auto block w-full">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            
            {/* Column 1: Brand/About */}
            <div className="md:col-span-2">
              <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-slate-900 font-bold text-sm">AM</span>
                </div>
                Arba Minch Municipality
              </h3>
              <p className="block text-slate-400 text-sm leading-relaxed" style={textWrapStyle}>
                Providing efficient, transparent, and accessible civic services to the residents of Arba Minch City. MQAMS is our official digital appointment and queue management portal designed to save your time.
              </p>
            </div>
            
            {/* Column 2: Quick Links */}
            <div>
              <h3 className="text-white text-sm font-bold mb-5 uppercase tracking-wider">Quick Links</h3>
              <ul className="space-y-3 text-slate-400 text-sm">
                <li><a href="#services" onClick={(e) => handleScrollTo(e, 'services')} className="hover:text-amber-400 transition-colors cursor-pointer">All Services</a></li>
                <li><a href="#how-it-works" onClick={(e) => handleScrollTo(e, 'how-it-works')} className="hover:text-amber-400 transition-colors cursor-pointer">How to Book</a></li>
                <li><a className="hover:text-amber-400 transition-colors cursor-pointer">Priority Policy</a></li>
                <li><a className="hover:text-amber-400 transition-colors cursor-pointer">Support & FAQ</a></li>
              </ul>
            </div>
            
            {/* Column 3: Contact */}
            <div>
              <h3 className="text-white text-sm font-bold mb-5 uppercase tracking-wider">Contact Us</h3>
              <ul className="space-y-3 text-slate-400 text-sm">
                <li className="flex items-center gap-2"><span className="text-lg">📞</span> +251 46 881 2233</li>
                <li className="flex items-center gap-2"><span className="text-lg">✉️</span> support@arbaminch.gov.et</li>
                <li className="flex items-center gap-2"><span className="text-lg">📍</span> Arba Minch, South Ethiopia</li>
                <li className="flex items-center gap-2"><span className="text-lg">🕒</span> Mon-Fri, 8:00 AM - 5:00 PM</li>
              </ul>
            </div>
            
          </div>
          
          <div className="border-t border-slate-800/80 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-slate-500 text-sm">
              © {new Date().getFullYear()} Arba Minch City Administration. All rights reserved.
            </div>
            <div className="flex gap-6">
              <a className="text-slate-500 text-sm hover:text-white transition-colors cursor-pointer">Privacy Policy</a>
              <a className="text-slate-500 text-sm hover:text-white transition-colors cursor-pointer">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
