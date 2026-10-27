import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { TableSkeleton } from '../components/LoadingSkeleton';
import {
  MapPin,
  Plus,
  Search,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  X,
  Save,
  Zap
} from 'lucide-react';

const AdminStations = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    station_id: '',
    name: '',
    cpo_name: '',
    state: '',
    city: '',
    location: '',
    latitude: 19.076,
    longitude: 72.8777,
    total_power_kw: 120,
    piles_num: 4,
    charging_gun_num: 6,
    is_operational: true
  });

  const fetchStations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      params.append('limit', '50');

      const res = await api.get(`/stations?${params.toString()}`);
      setStations(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStations();
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const res = await api.post('/admin/stations', formData);
      setMsg(`Station ${res.data.name} added successfully!`);
      setStations([res.data, ...stations]);
      setAddModalOpen(false);
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || "Failed to create station.");
    }
  };

  const openEdit = (st) => {
    setSelectedStation(st);
    setFormData({
      station_id: st.station_id,
      name: st.name,
      cpo_name: st.cpo_name || '',
      state: st.state || '',
      city: st.city || '',
      location: st.location || '',
      latitude: st.latitude,
      longitude: st.longitude,
      total_power_kw: st.total_power_kw || 60,
      piles_num: st.piles_num || 2,
      charging_gun_num: st.charging_gun_num || 4,
      is_operational: st.is_operational
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStation) return;
    setErrorMsg('');
    try {
      const res = await api.put(`/admin/stations/${selectedStation.id}`, formData);
      setMsg(`Station updated!`);
      setStations(stations.map((s) => (s.id === selectedStation.id ? res.data : s)));
      setEditModalOpen(false);
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || "Update failed.");
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete station "${name}"?`)) return;
    try {
      await api.delete(`/admin/stations/${id}`);
      setMsg(`Station deleted.`);
      setStations(stations.filter((s) => s.id !== id));
    } catch (err) {
      alert("Delete failed.");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Charging Station Governance</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Create, update, and manage nationwide EV charging infrastructure records.
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              station_id: `ST_${Math.floor(100000 + Math.random() * 900000)}`,
              name: '',
              cpo_name: 'Tata Power',
              state: 'Maharashtra',
              city: 'Mumbai',
              location: '',
              latitude: 19.076,
              longitude: 72.8777,
              total_power_kw: 120,
              piles_num: 4,
              charging_gun_num: 6,
              is_operational: true
            });
            setErrorMsg('');
            setAddModalOpen(true);
          }}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Charging Station
        </button>
      </div>

      {msg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search stations by name, ID, city, or CPO..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-purple-500 text-slate-900"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800"
          >
            Search
          </button>
        </form>
      </div>

      {loading ? (
        <TableSkeleton rows={8} />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Station ID</th>
                  <th className="px-6 py-3.5">Name</th>
                  <th className="px-6 py-3.5">Operator</th>
                  <th className="px-6 py-3.5">Location</th>
                  <th className="px-6 py-3.5">Power</th>
                  <th className="px-6 py-3.5">Demand Tier</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stations.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-800">{st.station_id}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900 max-w-xs truncate">{st.name}</td>
                    <td className="px-6 py-4 text-slate-600">{st.cpo_name || 'BEE India'}</td>
                    <td className="px-6 py-4 text-slate-600 truncate">{st.city || st.state}, {st.state}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{st.total_power_kw || 60} kW</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        st.current_demand_level === 'HIGH'
                          ? 'bg-rose-100 text-rose-700'
                          : st.current_demand_level === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {st.current_demand_level}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => openEdit(st)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50"
                        title="Edit Station"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(st.id, st.name)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete Station"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {(addModalOpen || editModalOpen) && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {addModalOpen ? 'Create New Charging Station' : `Edit Station: ${selectedStation?.station_id}`}
              </h3>
              <button
                onClick={() => {
                  setAddModalOpen(false);
                  setEditModalOpen(false);
                }}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={addModalOpen ? handleAddSubmit : handleEditSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Station Code</label>
                  <input
                    type="text"
                    required
                    disabled={editModalOpen}
                    value={formData.station_id}
                    onChange={(e) => setFormData({ ...formData, station_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">CPO / Operator</label>
                  <input
                    type="text"
                    value={formData.cpo_name}
                    onChange={(e) => setFormData({ ...formData, cpo_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Station Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Power (kW)</label>
                  <input
                    type="number"
                    value={formData.total_power_kw}
                    onChange={(e) => setFormData({ ...formData, total_power_kw: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Piles</label>
                  <input
                    type="number"
                    value={formData.piles_num}
                    onChange={(e) => setFormData({ ...formData, piles_num: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Guns</label>
                  <input
                    type="number"
                    value={formData.charging_gun_num}
                    onChange={(e) => setFormData({ ...formData, charging_gun_num: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setAddModalOpen(false);
                    setEditModalOpen(false);
                  }}
                  className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold"
                >
                  {addModalOpen ? 'Create Station' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminStations;
