import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { TableSkeleton } from '../components/LoadingSkeleton';
import { History, Filter, Activity, Clock } from 'lucide-react';

const OperatorHistory = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (actionFilter) params.append('action', actionFilter);
      params.append('limit', '100');

      const res = await api.get(`/operators/me/history?${params.toString()}`);
      setLogs(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [actionFilter]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Operator Activity Audit Log</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Immutable audit trail of hardware modifications, operational status toggles, and view events.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl bg-white border border-slate-200 text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Actions</option>
            <option value="UPDATE_STATION_PROFILE">Station Profile Updates</option>
            <option value="VIEW_ASSIGNED_STATION">Station Views</option>
          </select>
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={6} />
      ) : logs.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-2">
          <History className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No activity logs recorded</h3>
          <p className="text-xs text-slate-400">Station updates and management actions appear here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Action Code</th>
                  <th className="px-6 py-3.5">Operation Details</th>
                  <th className="px-6 py-3.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 font-mono text-[11px]">
                        <Activity className="w-3 h-3 text-blue-600" />
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-md truncate text-slate-700">
                      {log.details || 'Standard operational task executed.'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {new Date(log.created_at).toLocaleString()}
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

export default OperatorHistory;
