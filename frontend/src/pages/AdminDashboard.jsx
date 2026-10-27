import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { CardSkeleton } from '../components/LoadingSkeleton';
import {
  Users,
  ShieldCheck,
  MapPin,
  Cpu,
  Database,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  Clock,
  Layers
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then((res) => setData(res.data))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="h-8 bg-slate-200 rounded w-1/4 animate-pulse"></div>
        <CardSkeleton count={4} />
      </div>
    );
  }

  const {
    metrics = {},
    station_distribution_by_state = [],
    demand_breakdown = {},
    recent_activities = []
  } = data || {};

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> Platform Governance Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Administrator Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time infrastructure oversight, operator approvals, dataset verification, and AI engine training.
          </p>
        </div>

        {metrics.pending_operator_requests > 0 && (
          <Link
            to="/admin/operators/requests"
            className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-2 shadow-sm animate-pulse"
          >
            <AlertTriangle className="w-4 h-4" />
            {metrics.pending_operator_requests} Pending Operator Approval{metrics.pending_operator_requests > 1 ? 's' : ''}
          </Link>
        )}
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Transactions</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900">
            {metrics.total_real_transactions?.toLocaleString() || '8,544,695'}
          </span>
          <span className="text-[11px] text-slate-500 block">Real Parquet order streams</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Charging Stations</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900">
            {metrics.total_stations?.toLocaleString() || '3,000'}
          </span>
          <span className="text-[11px] text-slate-500 block">BEE India validated hubs</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Operator Accounts</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900">{metrics.total_operators || 0}</span>
          <span className="text-[11px] text-slate-500 block">{metrics.approved_operators || 0} approved / active</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">AI Predictions Logged</span>
            <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-brand-600">{metrics.total_predictions || 0}</span>
          <span className="text-[11px] text-slate-500 block">Random Forest inferences</span>
        </div>
      </div>

      {/* Main Charts & Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Top States Distribution Chart */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Charging Station Distribution by State</h3>
              <p className="text-xs text-slate-500">Real station count across top geographic regions in India.</p>
            </div>
            <Link to="/admin/stations" className="text-xs text-purple-600 font-semibold hover:underline">
              Manage Stations &rarr;
            </Link>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={station_distribution_by_state}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="state" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '0.75rem', border: 'none', color: '#fff', fontSize: '12px' }}
                  itemStyle={{ color: '#a855f7' }}
                  formatter={(val) => [`${val} stations`, 'Hub Count']}
                />
                <Bar dataKey="count" fill="#7c3aed" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Admin Actions & Demand Tiers */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Demand Tier breakdown card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">Network Demand Distribution</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 text-emerald-800 text-xs">
                <span className="font-semibold flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> LOW DEMAND
                </span>
                <span className="font-extrabold">{demand_breakdown.LOW || 0} Hubs</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-50 text-amber-800 text-xs">
                <span className="font-semibold flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> MEDIUM DEMAND
                </span>
                <span className="font-extrabold">{demand_breakdown.MEDIUM || 0} Hubs</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-rose-50 text-rose-800 text-xs">
                <span className="font-semibold flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> HIGH DEMAND
                </span>
                <span className="font-extrabold">{demand_breakdown.HIGH || 0} Hubs</span>
              </div>
            </div>
          </div>

          {/* Shortcuts */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 text-xs">
            <h3 className="font-bold text-slate-900">Admin Operations</h3>
            <Link
              to="/admin/operators/requests"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors"
            >
              <span className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-amber-500" /> Review Operator Requests
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/admin/model"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-brand-600" /> Retrain Random Forest Model
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/admin/datasets"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-600" /> Inspect Parquet & CSV Datasets
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
