import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { TableSkeleton } from '../components/LoadingSkeleton';
import { Bell, Check, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/me/notifications');
      setNotifications(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const markAllRead = async () => {
    try {
      await api.put('/users/me/notifications/read-all');
      setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const markSingle = async (id) => {
    try {
      await api.put(`/users/me/notifications/${id}/read`);
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Alerts & Notifications</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time high demand alerts, station assignment notices, and platform updates.
          </p>
        </div>
        {notifications.some((n) => !n.is_read) && (
          <button
            onClick={markAllRead}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Check className="w-3.5 h-3.5" /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : notifications.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-2">
          <Bell className="w-10 h-10 text-slate-200 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No notifications found</h3>
          <p className="text-xs text-slate-400">Important network demand surges and operational updates appear here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.is_read && markSingle(n.id)}
              className={`p-5 transition-colors flex items-start gap-4 cursor-pointer ${
                n.is_read ? 'bg-white hover:bg-slate-50' : 'bg-brand-50/40 hover:bg-brand-50/70 font-medium'
              }`}
            >
              <div className="mt-0.5">
                {n.type === 'warning' ? (
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                ) : n.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <Info className="w-5 h-5 text-brand-500" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{n.title}</h4>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
