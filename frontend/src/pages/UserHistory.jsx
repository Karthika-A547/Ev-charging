import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { TableSkeleton } from '../components/LoadingSkeleton';
import { History, Clock, Activity, ShieldCheck, Search, Filter } from 'lucide-react';

const UserHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await api.get('/users/me/history?limit=100');
        setHistory(res.data);
      } catch (err) {
        console.error("Failed to load user history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filteredHistory = filterAction
    ? history.filter((h) => h.action.toLowerCase().includes(filterAction.toLowerCase()))
    : history;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Activity Audit Log</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Private security log of your logins, station searches, favorites, and AI predictions.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl bg-white border border-slate-200 text-slate-700 focus:outline-none focus:border-brand-500"
          >
            <option value="">All Actions</option>
            <option value="LOGIN">Logins</option>
            <option value="PREDICT">Predictions</option>
            <option value="FAVORITE">Favorites</option>
          </select>
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={6} />
      ) : filteredHistory.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-2">
          <History className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No recorded activities found</h3>
          <p className="text-xs text-slate-400">Actions taken while using the application appear here automatically.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Action</th>
                  <th className="px-6 py-3.5">Details</th>
                  <th className="px-6 py-3.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 font-mono text-[11px]">
                        <Activity className="w-3 h-3 text-brand-600" />
                        {item.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-md truncate text-slate-700">
                      {item.details || 'Standard user action executed.'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {new Date(item.created_at).toLocaleString()}
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

export default UserHistory;
