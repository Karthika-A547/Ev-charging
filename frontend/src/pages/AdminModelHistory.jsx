import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { TableSkeleton } from '../components/LoadingSkeleton';
import { History, ArrowLeft, Cpu, CheckCircle2 } from 'lucide-react';

const AdminModelHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/model/history')
      .then((res) => setHistory(res.data))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/admin/model"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to ML Model Dashboard
          </Link>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Model Training History</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Audit history of Random Forest model versions, training sample sizes, and evaluated performance metrics.
          </p>
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : history.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-2">
          <History className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No Training Records Logged</h3>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Model Version</th>
                  <th className="px-6 py-3.5">Algorithm</th>
                  <th className="px-6 py-3.5">Records Processed</th>
                  <th className="px-6 py-3.5">MAE (Error)</th>
                  <th className="px-6 py-3.5">R² Score</th>
                  <th className="px-6 py-3.5">Trained By</th>
                  <th className="px-6 py-3.5 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">{h.model_name}</td>
                    <td className="px-6 py-4 text-slate-700">{h.algorithm}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{h.record_count.toLocaleString()}</td>
                    <td className="px-6 py-4 font-mono font-bold text-brand-600">{h.mae}</td>
                    <td className="px-6 py-4 font-mono font-bold text-purple-600">{h.r2}</td>
                    <td className="px-6 py-4 text-slate-700">{h.trained_by}</td>
                    <td className="px-6 py-4 text-right font-mono text-[11px] text-slate-400">
                      {new Date(h.created_at).toLocaleString()}
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

export default AdminModelHistory;
