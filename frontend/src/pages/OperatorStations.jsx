import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { TableSkeleton } from '../components/LoadingSkeleton';
import {
  Building2,
  MapPin,
  Zap,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  X,
  Save,
  Cpu
} from 'lucide-react';

const OperatorStations = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    total_power_kw: 60,
    piles_num: 2,
    charging_gun_num: 4,
    is_operational: true,
    notes: ''
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchStations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/operators/me/stations');
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

  const openEditModal = (station) => {
    setSelectedStation(station);
    setFormData({
      name: station.name,
      location: station.location || '',
      total_power_kw: station.total_power_kw || 60,
      piles_num: station.piles_num || 2,
      charging_gun_num: station.charging_gun_num || 4,
      is_operational: station.is_operational,
      notes: station.notes || ''
    });
    setSuccessMsg('');
    setErrorMsg('');
    setEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedStation) return;

    setSaveLoading(true);
    setErrorMsg('');
    try {
      const res = await api.put(`/operators/me/stations/${selectedStation.id}`, formData);
      setSuccessMsg("Station operational profile updated successfully!");
      setStations(stations.map((s) => (s.id === selectedStation.id ? res.data : s)));
      setTimeout(() => {
        setEditModalOpen(false);
      }, 1200);
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || "Update failed.");
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Assigned Station Fleet</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Hardware management, operational status, power draw specs, and maintenance logs.
          </p>
        </div>
        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 self-start">
          Total Assigned: {stations.length} Hubs
        </span>
      </div>

      {loading ? (
        <TableSkeleton rows={6} />
      ) : stations.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No Stations Assigned</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Your operator account has been approved, but no stations are currently linked to your organization. The platform administrator assigns stations.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stations.map((st) => (
            <div
              key={st.id}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                    {st.station_id}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      st.is_operational
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {st.is_operational ? 'OPERATIONAL' : 'OFFLINE'}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                  {st.name}
                </h3>

                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{st.city || st.state}, {st.state}</span>
                </p>

                {st.notes && (
                  <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-xl mt-2 line-clamp-2">
                    "{st.notes}"
                  </p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl text-center text-xs">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Capacity</span>
                  <span className="font-semibold text-slate-800">{st.total_power_kw || 60} kW</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Guns</span>
                  <span className="font-semibold text-slate-800">{st.charging_gun_num || 2}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Demand</span>
                  <span className={`font-bold ${
                    st.current_demand_level === 'HIGH' ? 'text-rose-600' : 'text-slate-800'
                  }`}>
                    {st.current_demand_level}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => openEditModal(st)}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Manage Specs
                </button>
                <Link
                  to={`/predictions?station_id=${st.id}`}
                  className="p-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200"
                  title="Forecast Station Demand"
                >
                  <Cpu className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Station Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-in fade-in duration-150 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                Update Operational Profile: {selectedStation?.station_id}
              </h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
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

            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Station Public Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Location Details / Address</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Total Power (kW)</label>
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

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Operational State</label>
                <select
                  value={formData.is_operational ? 'true' : 'false'}
                  onChange={(e) => setFormData({ ...formData, is_operational: e.target.value === 'true' })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                >
                  <option value="true">Operational / Online</option>
                  <option value="false">Under Maintenance / Offline</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Maintenance / Operator Notes</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Dispenser 2 serviced on Monday..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center justify-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saveLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default OperatorStations;
