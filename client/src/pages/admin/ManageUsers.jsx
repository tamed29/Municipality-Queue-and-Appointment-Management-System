import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import { MdSearch, MdBlock, MdCheckCircleOutline } from 'react-icons/md';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleUserStatus = async (id, currentStatus) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus ? 'block' : 'activate'} this user?`)) return;
    
    try {
      await api.put(`/admin/users/${id}/status`, { is_active: !currentStatus });
      toast.success(`User ${currentStatus ? 'blocked' : 'activated'} successfully`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const filteredUsers = users.filter(u => 
    u.full_name.toLowerCase().includes(search.toLowerCase()) || 
    u.national_id.includes(search) ||
    (u.email && u.email.toLowerCase().includes(search.toLowerCase()))
  );

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
          <h1 className="text-2xl font-bold text-secondary break-normal">Manage Users</h1>
          <p className="text-muted text-sm mt-1 block" style={textWrapStyle}>View and manage citizen accounts.</p>
        </div>
        
        <div className="relative w-full sm:w-64 shrink-0">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={20} />
          <input 
            type="text" 
            placeholder="Search users..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-[var(--radius-input)] focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      <div className="bg-card rounded-[var(--radius-card)] shadow-[var(--shadow-card)] overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-surface text-muted text-xs uppercase tracking-wider border-b border-border">
                  <th className="px-6 py-4 font-semibold">Name</th>
                  <th className="px-6 py-4 font-semibold">National ID</th>
                  <th className="px-6 py-4 font-semibold">Contact</th>
                  <th className="px-6 py-4 font-semibold">Age</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-secondary">{user.full_name}</div>
                      <div className="text-xs text-muted uppercase">{user.role}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-secondary">{user.national_id}</td>
                    <td className="px-6 py-4 text-sm text-secondary">
                      <div>{user.phone}</div>
                      <div className="text-xs text-muted">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center">
                        <span className="text-secondary">{user.age}</span>
                        {user.age >= 60 && (
                          <span className="ml-2 px-1.5 py-0.5 bg-accent/10 text-accent text-[10px] font-bold rounded uppercase">Priority</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-[var(--radius-badge)] text-xs font-medium ${
                        user.is_active ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                      }`}>
                        {user.is_active ? 'Active' : 'Blocked'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user.role !== 'admin' && (
                        <button 
                          onClick={() => toggleUserStatus(user.id, user.is_active)}
                          className={`p-2 rounded-full transition-colors flex items-center justify-center ml-auto ${
                            user.is_active ? 'text-danger hover:bg-danger/10' : 'text-success hover:bg-success/10'
                          }`}
                          title={user.is_active ? "Block User" : "Activate User"}
                        >
                          {user.is_active ? <MdBlock size={20} /> : <MdCheckCircleOutline size={20} />}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div className="p-8 text-center text-muted">No users found matching your search.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;
