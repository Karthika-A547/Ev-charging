import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { TableSkeleton } from '../components/LoadingSkeleton';
import { Activity, Clock, ShieldCheck, User } from 'lucide-react';

const AdminActivity = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/activity?limit=100')
      .then((res) => setLogs(res.data))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Security & Audit Trail</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Immutable platform audit stream capturing administrator interventions, operator modifications, and user transactions.
        </p>
      </div>

      {loading ? (
        <TableSkeleton rows={8} />
      ) : logs.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-2">
          <Activity className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No Audit Logs Available</h3>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Actor</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Action Event</th>
                  <th className="px-6 py-3.5">Event Details</th>
                  <th className="px-6 py-3.5 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">{item.actor}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        item.role === 'admin'
                          ? 'bg-purple-100 text-purple-700'
                          : item.role === 'operator'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {item.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono font-semibold text-slate-800">{item.action}</td>
                    <td className="px-6 py-4 max-w-sm truncate text-slate-600">{item.details}</td>
                    <td className="px-6 py-4 text-right font-mono text-[11px] text-slate-400">
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

export default AdminActivity;
