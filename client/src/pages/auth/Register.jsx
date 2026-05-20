import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../store/AuthContext';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import { MdInfo, MdArrowBack } from 'react-icons/md';

const Register = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    national_id: '',
    phone: '',
    email: '',
    age: '',
    subCity: 'Secha Sub-City',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  
  const { login, registerLocal } = useContext(AuthContext);
  const navigate = useNavigate();

  const isElderly = parseInt(formData.age) >= 60;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords don't match");
    }
    
    setLoading(true);
    try {
      const payload = {
        full_name: formData.full_name,
        national_id: formData.national_id,
        phone: formData.phone,
        email: formData.email,
        age: parseInt(formData.age),
        password: formData.password
      };
      const res = await api.post('/auth/register', payload);
      const { token, ...userData } = res.data;
      login(userData, token);
      toast.success('Registration successful');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 py-8">
      <div className="bg-card w-full max-w-[440px] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-8 relative">
        <button 
          onClick={() => navigate('/')}
          className="absolute top-8 left-8 text-muted hover:text-primary transition-colors flex items-center gap-1 group"
        >
          <MdArrowBack className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-wider">Back</span>
        </button>
        <div className="text-center mb-6 pt-4">
          <h1 className="text-2xl font-bold text-secondary mb-2">Create Account</h1>
          <p className="text-muted text-sm">Register for MQAMS services</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Full Name</label>
            <input 
              type="text" name="full_name" required value={formData.full_name} onChange={handleChange}
              className="w-full px-4 py-2 border border-border rounded-[var(--radius-input)] focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">National ID</label>
              <input 
                type="text" name="national_id" required value={formData.national_id} onChange={handleChange}
                className="w-full px-4 py-2 border border-border rounded-[var(--radius-input)] focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Age</label>
              <input 
                type="number" name="age" required min="1" value={formData.age} onChange={handleChange}
                className="w-full px-4 py-2 border border-border rounded-[var(--radius-input)] focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
          
          {isElderly && (
            <div className="bg-primary/10 text-primary p-3 rounded-[var(--radius-input)] flex items-start text-sm">
              <MdInfo className="mt-0.5 mr-2 flex-shrink-0" size={18} />
              <p>As you are 60+, you will receive priority service automatically.</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Sub-City / Place of Residence</label>
            <select 
              name="subCity" required value={formData.subCity || 'Secha Sub-City'} onChange={handleChange}
              className="w-full px-4 py-2 border border-border rounded-[var(--radius-input)] bg-white text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="Secha Sub-City">Secha Sub-City</option>
              <option value="Sikela Sub-City">Sikela Sub-City</option>
              <option value="Nech Sar Sub-City">Nech Sar Sub-City</option>
              <option value="Kulfo Sub-City">Kulfo Sub-City</option>
              <option value="Abaya Sub-City">Abaya Sub-City</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Phone Number</label>
            <input 
              type="tel" name="phone" required value={formData.phone} onChange={handleChange}
              className="w-full px-4 py-2 border border-border rounded-[var(--radius-input)] focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Email</label>
            <input 
              type="email" name="email" required value={formData.email} onChange={handleChange}
              className="w-full px-4 py-2 border border-border rounded-[var(--radius-input)] focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Password</label>
            <input 
              type="password" name="password" required value={formData.password} onChange={handleChange}
              className="w-full px-4 py-2 border border-border rounded-[var(--radius-input)] focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Confirm Password</label>
            <input 
              type="password" name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange}
              className="w-full px-4 py-2 border border-border rounded-[var(--radius-input)] focus:outline-none focus:ring-2 focus:ring-primary/50"
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
            ) : 'Register'}
          </button>
        </form>
        
        <p className="text-center text-sm text-muted mt-6">
          Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
