import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { TableSkeleton } from '../components/LoadingSkeleton';
import { ShieldCheck, Building2, MapPin, Plus, CheckCircle2, AlertTriangle, X } from 'lucide-react';

const AdminOperators = () => {
  const [operators, setOperators] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [selectedStationId, setSelectedStationId] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [opsRes, stRes] = await Promise.all([
        api.get('/admin/operators'),
        api.get('/stations?limit=150')
      ]);
      setOperators(opsRes.data);
      setStations(stRes.data);
      if (stRes.data.length > 0) setSelectedStationId(stRes.data[0].id.toString());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAssignModal = (op) => {
    setSelectedOperator(op);
    setMsg('');
    setErrorMsg('');
    setAssignModalOpen(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOperator || !selectedStationId) return;

    setActionLoading(true);
    setErrorMsg('');
    try {
      const res = await api.post('/admin/operators/assign-station', {
        operator_id: selectedOperator.id,
        station_id: parseInt(selectedStationId)
      });
      setMsg(res.data.message);
      // Update local state
      setOperators(operators.map((o) => (
        o.id === selectedOperator.id ? { ...o, assigned_stations_count: o.assigned_stations_count + 1 } : o
      )));
      setTimeout(() => setAssignModalOpen(false), 1200);
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || "Assignment failed.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Operator Network & Assignments</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Registered charging companies and station delegation control.
          </p>
        </div>
      </div>

      {msg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {loading ? (
        <TableSkeleton rows={5} />
      ) : operators.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-2">
          <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No Operator Accounts Found</h3>
          <p className="text-xs text-slate-400">Approved operator profiles will appear here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Operator</th>
                  <th className="px-6 py-3.5">Organization</th>
                  <th className="px-6 py-3.5">Location</th>
                  <th className="px-6 py-3.5">Assigned Hubs</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {operators.map((op) => (
                  <tr key={op.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      <div>{op.full_name}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{op.email}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-blue-500" />
                        {op.organization_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{op.city || op.state}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-100">
                        {op.assigned_stations_count} Stations
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        op.approval_status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700'
                          : op.approval_status === 'pending'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}>
                        {op.approval_status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {op.approval_status === 'approved' && (
                        <button
                          onClick={() => openAssignModal(op)}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors inline-flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" /> Assign Station
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

      {/* Assign Station Modal */}
      {assignModalOpen && selectedOperator && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Assign Station to Operator</h3>
              <button onClick={() => setAssignModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {msg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{msg}</span>
              </div>
            )}

            <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Target Operator</label>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900">
                  {selectedOperator.full_name} ({selectedOperator.organization_name})
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Charging Station</label>
                <select
                  value={selectedStationId}
                  onChange={(e) => setSelectedStationId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-purple-500"
                >
                  {stations.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.station_id} &ndash; {st.name} ({st.city || st.state})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminOperators;
