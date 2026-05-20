import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../store/AuthContext';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import { MdArrowBack } from 'react-icons/md';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate lookup delay
    setTimeout(() => {
      try {
        const registered = JSON.parse(localStorage.getItem('mqams_registered_users') || '[]');
        const found = registered.find(
          u => (u.email === identifier || u.phone === identifier) && u.password === password
        );
        
        if (found) {
          const { password, ...userData } = found;
          login(userData);
          toast.success('Logged in successfully');
          navigate('/dashboard');
        } else {
          // Check hardcoded credentials for Admin if they login here too
          if (identifier === 'admin@gmail.com' && password === 'admin') {
            sessionStorage.setItem('mqams_admin_session', 'true');
            sessionStorage.setItem('mqams_admin_email', identifier);
            toast.success('System Administrator Authenticated!');
            navigate('/admin/dashboard');
          } else {
            toast.error('Invalid credentials');
          }
        }
      } catch (err) {
        toast.error('Failed to log in');
      } finally {
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-[400px] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-8 relative">
        <button 
          onClick={() => navigate('/')}
          className="absolute top-8 left-8 text-muted hover:text-primary transition-colors flex items-center gap-1 group"
        >
          <MdArrowBack className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-wider">Back</span>
        </button>
        <div className="text-center mb-8 pt-4">
          <h1 className="text-2xl font-bold text-secondary mb-2">Welcome Back</h1>
          <p className="text-muted text-sm">Sign in to access MQAMS</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Email or Phone</label>
            <input 
              type="text" 
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-[var(--radius-input)] focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Enter your email or phone"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-secondary">Password</label>
              <Link to="#" className="text-xs text-primary hover:underline">Forgot password?</Link>
            </div>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-[var(--radius-input)] focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Enter your password"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-2 px-4 bg-primary text-white font-medium rounded-[var(--radius-btn)] hover:bg-primary/90 transition-colors flex justify-center items-center mt-6"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : 'Sign In'}
          </button>
        </form>
        
        <p className="text-center text-sm text-muted mt-6">
          Don't have an account? <Link to="/register" className="text-primary font-medium hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
