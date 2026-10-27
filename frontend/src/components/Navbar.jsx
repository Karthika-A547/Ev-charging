import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import { Zap, Search, User, LogOut, Menu, X, Shield, Activity, Layers } from 'lucide-react';

const Navbar = ({ toggleSidebar, isSidebarOpen }) => {
  const { user, role, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/stations?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Left: Brand & Mobile Sidebar Toggle */}
          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden"
                aria-label="Toggle Navigation"
              >
                {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}

            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center text-white shadow-sm shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-slate-900 group-hover:text-brand-600 transition-colors">
                  SmartCharge <span className="text-brand-500">AI</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium -mt-1 hidden sm:inline">
                  EV Demand Intelligence
                </span>
              </div>
            </Link>
          </div>

          {/* Middle: Global Search */}
          <div className="flex-1 max-w-md hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search station, city, or CPO (e.g. Tata Power, Mumbai)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-100/80 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-800 placeholder-slate-400"
              />
            </form>
          </div>

          {/* Right: Actions & User Avatar Menu */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <NotificationBell />

                {/* Role indicator pill */}
                <span
                  className={`hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                    role === 'admin'
                      ? 'bg-purple-100 text-purple-700 border border-purple-200'
                      : role === 'operator'
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {role}
                </span>

                {/* Profile menu dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                      {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="text-xs font-semibold text-slate-700 hidden lg:inline max-w-[120px] truncate">
                      {user?.full_name || 'My Account'}
                    </span>
                  </button>

                  {userMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2"
                      onMouseLeave={() => setUserMenuOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900 truncate">{user?.full_name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                      </div>

                      <div className="py-1">
                        <Link
                          to={role === 'admin' ? '/admin/dashboard' : (role === 'operator' ? '/operator/dashboard' : '/dashboard')}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-brand-600"
                        >
                          <Activity className="w-3.5 h-3.5" /> Dashboard
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-brand-600"
                        >
                          <User className="w-3.5 h-3.5" /> Profile & Settings
                        </Link>
                      </div>

                      <div className="border-t border-slate-100 pt-1">
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            logout();
                            navigate('/login');
                          }}
                          className="flex items-center gap-2 w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50"
                        >
                          <LogOut className="w-3.5 h-3.5" /> Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-brand-600 text-white hover:bg-brand-500 shadow-sm shadow-brand-500/20 transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};

export default Navbar;
