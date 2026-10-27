import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  MapPin,
  Cpu,
  History,
  Heart,
  User,
  Bell,
  BarChart3,
  Users,
  ShieldCheck,
  Database,
  Layers,
  Activity,
  FileCheck2
} from 'lucide-react';

const Sidebar = ({ isOpen, closeSidebar }) => {
  const { role } = useAuth();

  const userNav = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Station Map & Search', path: '/stations', icon: MapPin },
    { name: 'AI Demand Prediction', path: '/predictions', icon: Cpu },
    { name: 'Saved Favorites', path: '/favorites', icon: Heart },
    { name: 'My Activity History', path: '/history', icon: History },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'My Profile', path: '/profile', icon: User },
  ];

  const operatorNav = [
    { name: 'Operator Dashboard', path: '/operator/dashboard', icon: LayoutDashboard },
    { name: 'Assigned Stations', path: '/operator/stations', icon: MapPin },
    { name: 'AI Demand Forecast', path: '/predictions', icon: Cpu },
    { name: 'Station Analytics', path: '/operator/analytics', icon: BarChart3 },
    { name: 'Operator History', path: '/operator/history', icon: History },
    { name: 'All Stations Directory', path: '/stations', icon: Layers },
    { name: 'Operator Profile', path: '/profile', icon: User },
  ];

  const adminNav = [
    { name: 'Executive Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Operator Requests', path: '/admin/operators/requests', icon: FileCheck2 },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Operator Management', path: '/admin/operators', icon: ShieldCheck },
    { name: 'Station Management', path: '/admin/stations', icon: MapPin },
    { name: 'Dataset Management', path: '/admin/datasets', icon: Database },
    { name: 'ML Model & Retrain', path: '/admin/model', icon: Cpu },
    { name: 'Model History', path: '/admin/model-history', icon: History },
    { name: 'Audit & System Logs', path: '/admin/activity', icon: Activity },
    { name: 'Platform Analytics', path: '/admin/analytics', icon: BarChart3 },
  ];

  const currentNav = role === 'admin' ? adminNav : (role === 'operator' ? operatorNav : userNav);

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between overflow-y-auto`}
      >
        <div className="p-4 space-y-6">
          {/* Role header info badge */}
          <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {role === 'admin' ? 'Admin Portal' : (role === 'operator' ? 'Operator Portal' : 'Driver Portal')}
            </span>
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {currentNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer info in sidebar */}
        <div className="p-4 border-t border-slate-100">
          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 text-emerald-800 text-[11px]">
            <p className="font-bold flex items-center gap-1.5 mb-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Live AI Engine
            </p>
            <p className="text-emerald-700/80 leading-relaxed text-[10px]">
              Random Forest v1.0 active. Real transactions synced.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
