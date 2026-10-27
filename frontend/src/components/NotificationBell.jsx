import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Info, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/users/me/notifications');
      setNotifications(res.data);
      const unread = res.data.filter((n) => !n.is_read).length;
      setUnreadCount(unread);
    } catch (e) {
      // Ignore when not logged in
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 45000); // Polling every 45s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = async () => {
    try {
      await api.put('/users/me/notifications/read-all');
      setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  const markSingleRead = async (id) => {
    try {
      await api.put(`/users/me/notifications/${id}/read`);
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm text-slate-900">Notifications</h4>
              <p className="text-xs text-slate-500">{unreadCount} unread alerts</p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">
                No notifications yet.
              </div>
            ) : (
              notifications.slice(0, 6).map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => !notif.is_read && markSingleRead(notif.id)}
                  className={`p-4 text-xs transition-colors cursor-pointer ${
                    notif.is_read ? 'bg-white hover:bg-slate-50 text-slate-600' : 'bg-brand-50/40 hover:bg-brand-50/70 text-slate-900 font-medium'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">
                      {notif.type === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                      ) : notif.type === 'success' ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Info className="w-4 h-4 text-brand-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-semibold text-slate-900 truncate">{notif.title}</span>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-600 line-clamp-2 leading-relaxed text-[11px]">{notif.message}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs text-brand-600 hover:text-brand-700 font-semibold inline-flex items-center gap-1"
            >
              View all notifications <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
