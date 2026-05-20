import React, { createContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const localUser = localStorage.getItem('mqams_current_user');
    if (localUser) {
      try {
        setUser(JSON.parse(localUser));
      } catch (e) {
        localStorage.removeItem('mqams_current_user');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    if (token) {
      localStorage.setItem('token', token);
    }
    localStorage.setItem('mqams_current_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('mqams_current_user');
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const registerLocal = (formData) => {
    const ageNum = parseInt(formData.age, 10);
    
    // Auto-detect priority type based on age/inputs
    let priorityType = 'regular';
    if (ageNum >= 60) {
      priorityType = 'elderly';
    } else if (formData.isPregnant || formData.priorityType === 'pregnant') {
      priorityType = 'pregnant';
    } else if (formData.isDisabled || formData.priorityType === 'disabled') {
      priorityType = 'disabled';
    }

    const newUser = {
      id: `citizen_${Date.now()}`,
      name: formData.full_name,
      nationalId: formData.national_id,
      phone: formData.phone,
      email: formData.email,
      age: ageNum,
      priorityType,
      subCity: formData.subCity || 'Secha Sub-City'
    };

    // Store in registered users catalog
    try {
      const registered = JSON.parse(localStorage.getItem('mqams_registered_users') || '[]');
      registered.push({ ...newUser, password: formData.password });
      localStorage.setItem('mqams_registered_users', JSON.stringify(registered));
    } catch (e) {
      localStorage.setItem('mqams_registered_users', JSON.stringify([{ ...newUser, password: formData.password }]));
    }

    login(newUser);
    return newUser;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, registerLocal, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

