import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';

const ManageServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: '', description: '', duration_minutes: 30 });

  const fetchServices = async () => {
    try {
      const res = await api.get('/services');
      setServices(res.data);
    } catch (error) {
      toast.error('Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleOpenModal = (service = null) => {
    if (service) {
      setFormData(service);
    } else {
      setFormData({ id: null, name: '', description: '', duration_minutes: 30 });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await api.put(`/admin/services/${formData.id}`, formData);
        toast.success('Service updated');
      } else {
        await api.post('/admin/services', formData);
        toast.success('Service created');
      }
      setShowModal(false);
      fetchServices();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this service?')) return;
    try {
      await api.delete(`/admin/services/${id}`);
      toast.success('Service deactivated');
      fetchServices();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const textWrapStyle = {
    maxWidth: '560px',
    width: '100%',
    whiteSpace: 'normal',
    wordBreak: 'normal',
    overflowWrap: 'normal'
  };

  return (
    <div className="min-w-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 min-w-0">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-secondary break-normal">Manage Services</h1>
          <p className="text-muted text-sm mt-1 block" style={textWrapStyle}>Add, edit, or remove municipal services.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-primary text-white px-4 py-2 rounded-[var(--radius-btn)] font-medium flex items-center hover:bg-primary/90 transition-colors shadow-sm shrink-0"
        >
          <MdAdd size={20} className="mr-1" /> Add New Service
        </button>
      </div>

      <div className="flex overflow-x-auto pb-6 gap-6 md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-visible w-full scrollbar-hide snap-x scroll-pl-4">
        {loading ? (
          <div className="col-span-full flex justify-center items-center h-64 w-full">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : services.map(service => (
          <div key={service.id} className="bg-card border border-border rounded-[var(--radius-card)] p-6 shadow-[var(--shadow-card)] flex flex-col min-w-[300px] md:min-w-0 md:w-full snap-start">
            <h3 className="font-bold text-lg text-secondary mb-2 block w-full truncate">{service.name}</h3>
            <p className="text-sm text-muted mb-4 flex-1 block w-full">{service.description}</p>
            
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-border w-full">
              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded shrink-0">
                {service.duration_minutes} min
              </span>
              <div className="flex space-x-2 shrink-0">
                <button 
                  onClick={() => handleOpenModal(service)}
                  className="p-1.5 text-secondary hover:bg-surface rounded transition-colors"
                  title="Edit"
                >
                  <MdEdit size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(service.id)}
                  className="p-1.5 text-danger hover:bg-danger/10 rounded transition-colors"
                  title="Delete"
                >
                  <MdDelete size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-secondary/50 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-md rounded-[var(--radius-card)] shadow-[var(--shadow-modal)] p-6">
            <h2 className="text-xl font-bold text-secondary mb-4">{formData.id ? 'Edit Service' : 'Add New Service'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Service Name</label>
                  <input 
                    type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-border rounded-[var(--radius-input)] focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Description</label>
                  <textarea 
                    required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows="3"
                    className="w-full px-3 py-2 border border-border rounded-[var(--radius-input)] focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Duration (minutes)</label>
                  <input 
                    type="number" required min="5" value={formData.duration_minutes} onChange={(e) => setFormData({...formData, duration_minutes: e.target.value})}
                    className="w-full px-3 py-2 border border-border rounded-[var(--radius-input)] focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-6 space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-secondary hover:bg-surface rounded-[var(--radius-btn)] transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-[var(--radius-btn)] hover:bg-primary/90 transition-colors">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageServices;
