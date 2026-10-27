import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { TableSkeleton } from '../components/LoadingSkeleton';
import { Users, Search, Filter, Shield, UserCheck, UserX, CheckCircle2 } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (roleFilter) params.append('role', roleFilter);
      params.append('limit', '100');

      const res = await api.get(`/admin/users?${params.toString()}`);
      setUsers(res.data.users);
      setTotal(res.data.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const toggleStatus = async (id, currentStatus, email) => {
    try {
      const res = await api.put(`/admin/users/${id}/toggle-status`);
      setActionMsg(`User ${email} status changed to ${res.data.is_active ? 'Active' : 'Deactivated'}`);
      setUsers(users.map((u) => (u.id === id ? { ...u, is_active: res.data.is_active } : u)));
    } catch (err) {
      setActionMsg(err.response?.data?.detail || "Action failed.");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Platform User Directory</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage drivers, charging station operators, and administrators ({total} total registered accounts).
          </p>
        </div>
      </div>

      {actionMsg && (
        <div className="p-3.5 bg-slate-100 border border-slate-200 text-slate-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search users by name, email, or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-purple-500 text-slate-900"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-700"
            >
              <option value="">All Roles</option>
              <option value="user">Drivers (User)</option>
              <option value="operator">Operators</option>
              <option value="admin">Administrators</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton rows={6} />
      ) : users.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-2">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No users matched search criteria</h3>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">User</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">City</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Joined</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      <div>{u.full_name}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{u.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        u.role === 'admin'
                          ? 'bg-purple-100 text-purple-700'
                          : u.role === 'operator'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{u.city || 'India'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {u.is_active ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-[11px] text-slate-500">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => toggleStatus(u.id, u.is_active, u.email)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                            u.is_active
                              ? 'bg-rose-50 hover:bg-rose-100 text-rose-700'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminUsers;
