import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { CardSkeleton } from '../components/LoadingSkeleton';
import {
  LayoutDashboard,
  MapPin,
  Cpu,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building2,
  ArrowRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const OperatorDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/operators/me/analytics')
      .then((res) => setAnalytics(res.data))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="h-8 bg-slate-200 rounded w-1/4 animate-pulse"></div>
        <CardSkeleton count={4} />
        <div className="h-80 bg-slate-200 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  const {
    total_assigned_stations = 0,
    active_stations = 0,
    total_capacity_kw = 0,
    total_charging_guns = 0,
    demand_breakdown = {},
    hourly_demand_curve = [],
    stations_summary = []
  } = analytics || {};

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
            <ShieldCheck className="w-3.5 h-3.5" /> Approved Charge Point Operator
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Station Fleet Operations Hub
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Monitor real-time throughput, forecast peak demand periods, and manage operational readiness for your assigned charging stations.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <Link
              to="/operator/stations"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors"
            >
              Manage Assigned Hubs
            </Link>
            <Link
              to="/predictions"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-colors"
            >
              Run AI Forecast
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Assigned Stations</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900">{total_assigned_stations}</span>
          <span className="text-[11px] text-slate-500 block">{active_stations} currently online</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Rated Power</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900">{total_capacity_kw} kW</span>
          <span className="text-[11px] text-slate-500 block">Fleet grid draw capacity</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Dispensers</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900">{total_charging_guns}</span>
          <span className="text-[11px] text-slate-500 block">Total connector ports</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Surge Alert Hubs</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-rose-600">{demand_breakdown.high || 0}</span>
          <span className="text-[11px] text-slate-500 block">High demand forecasted</span>
        </div>
      </div>

      {/* Hourly Demand Profile Chart */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">Fleet Demand Curve (Sessions/Hour)</h3>
            <p className="text-xs text-slate-500">
              Composite predicted session volume across all assigned stations.
            </p>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourly_demand_curve} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="operatorDemandGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '0.75rem', border: 'none', color: '#fff', fontSize: '12px' }}
                itemStyle={{ color: '#60a5fa' }}
                formatter={(value) => [`${value} sessions`, 'Predicted Volume']}
              />
              <Area type="monotone" dataKey="predicted_sessions" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#operatorDemandGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Assigned Stations Summary Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Assigned Station Fleet</h3>
          <Link to="/operator/stations" className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1">
            Manage All Stations <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {stations_summary.length === 0 ? (
          <div className="bg-white p-10 rounded-3xl border border-slate-200 text-center space-y-2">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-bold text-slate-800 text-sm">No Stations Assigned Yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Administrator has not yet assigned charging stations to your operator account. Contact the administrator to assign network stations.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Code</th>
                    <th className="px-6 py-3.5">Station Name</th>
                    <th className="px-6 py-3.5">Location</th>
                    <th className="px-6 py-3.5">Capacity</th>
                    <th className="px-6 py-3.5">Demand Tier</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stations_summary.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-800">{st.station_id}</td>
                      <td className="px-6 py-4 font-semibold text-slate-900 max-w-xs truncate">{st.name}</td>
                      <td className="px-6 py-4 text-slate-600 truncate">{st.city}, {st.state}</td>
                      <td className="px-6 py-4 font-semibold text-slate-800">{st.power_kw} kW</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            st.current_demand_level === 'HIGH'
                              ? 'bg-rose-100 text-rose-700'
                              : st.current_demand_level === 'MEDIUM'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {st.current_demand_level}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          st.is_operational ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {st.is_operational ? 'Online' : 'Offline'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/operator/stations/${st.id}`}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default OperatorDashboard;
