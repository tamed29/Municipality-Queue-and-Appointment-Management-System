import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ADMIN_CREDENTIALS, ADMIN_SESSION_KEY } from '../constants/adminAuth';
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertTriangle, FiCalendar, FiShield } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

import api from '../api/axios';
import { AuthContext } from '../store/AuthContext';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { identifier: email, password });
      const { token, _id, full_name, ...rest } = res.data;
      
      if (rest.role !== 'admin') {
        throw new Error("Unauthorized: Not an admin account");
      }

      const userData = { id: _id, name: full_name, ...rest };
      login(userData, token);
      
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
      sessionStorage.setItem('mqams_admin_email', email);
      toast.success('System Administrator Authenticated!');
      navigate('/admin/dashboard');
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || 'Invalid admin credentials';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* Background Graphic Effects */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Main Container Card */}
      <div className="w-full max-w-[420px] bg-slate-900/60 border border-slate-800 rounded-3xl backdrop-blur-xl p-8 shadow-2xl relative z-10 transition-all duration-300 hover:border-slate-700/80">
        
        {/* Header - Brand & Badge */}
        <div className="flex flex-col items-center text-center mb-8">
          
          {/* Logo Icon */}
          <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 mb-4 animate-pulse">
            <span className="text-slate-950 font-extrabold text-2xl tracking-tighter">AM</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-extrabold text-white tracking-tight">MQAMS</h1>
          <p className="text-slate-400 text-sm mt-1 font-medium">Administration Portal</p>
          
          {/* Official Badge */}
          <div className="mt-4 inline-flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/30 rounded-full px-3.5 py-1">
            <FiShield className="text-amber-500 text-xs shrink-0" />
            <span className="text-amber-500 text-[10px] uppercase font-bold tracking-widest">Official Staff Only</span>
          </div>

        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-start gap-3 text-red-400 text-sm leading-normal animate-shake">
              <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="font-bold text-xs">!</span>
              </div>
              <p className="font-semibold">{error}</p>
            </div>
          )}

          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-xs text-slate-300 font-bold uppercase tracking-wider block">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
                <span>@</span>
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@gmail.com"
                className="w-full bg-slate-950/60 border border-slate-800 hover:border-slate-700 focus:border-amber-500 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all font-medium"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="text-xs text-slate-300 font-bold uppercase tracking-wider block">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
                <span className="text-sm">🔑</span>
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-950/60 border border-slate-800 hover:border-slate-700 focus:border-amber-500 rounded-2xl py-3.5 pl-11 pr-11 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? (
                  <span className="text-xs font-bold select-none">HIDE</span>
                ) : (
                  <span className="text-xs font-bold select-none">SHOW</span>
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 text-slate-950 py-3.5 rounded-2xl font-extrabold text-sm hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 hover:-translate-y-0.5 transition-all shadow-lg shadow-amber-500/10 cursor-pointer flex justify-center items-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
            ) : (
              'Sign in to Admin Panel'
            )}
          </button>

        </form>

        {/* Footer Warning */}
        <div className="text-center mt-8 pt-6 border-t border-slate-800/80">
          <p className="text-[10px] text-slate-500 leading-relaxed max-w-[280px] mx-auto font-medium">
            Unauthorized access or attempting to compromise this government system is strictly prohibited under legal framework and is subject to criminal prosecution.
          </p>
        </div>

      </div>

    </div>
  );
};

export default AdminLogin;
