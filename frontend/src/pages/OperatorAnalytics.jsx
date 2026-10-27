import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { BarChart3, TrendingUp, Cpu, Zap, Clock, ShieldCheck } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const DEMAND_COLORS = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#10b981'
};

const OperatorAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/operators/me/analytics')
      .then((res) => setData(res.data))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="h-8 bg-slate-200 rounded w-1/4 animate-pulse"></div>
        <CardSkeleton count={3} />
      </div>
    );
  }

  const {
    total_assigned_stations = 0,
    total_capacity_kw = 0,
    total_predictions_generated = 0,
    demand_breakdown = {},
    hourly_demand_curve = []
  } = data || {};

  const pieData = [
    { name: 'Low Demand', value: demand_breakdown.low || 1, color: '#10b981' },
    { name: 'Medium Demand', value: demand_breakdown.medium || 1, color: '#f59e0b' },
    { name: 'High Demand', value: demand_breakdown.high || 1, color: '#ef4444' }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Operator Telemetry & Analytics</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          In-depth capacity utilization, surge forecasting, and demand tier distributions for your station network.
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-500 block">Assigned Fleet Size</span>
          <span className="text-3xl font-black text-slate-900">{total_assigned_stations} Hubs</span>
          <span className="text-xs text-slate-400 block">{total_capacity_kw} kW total connected load</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-500 block">AI Predictions Processed</span>
          <span className="text-3xl font-black text-brand-600">{total_predictions_generated}</span>
          <span className="text-xs text-slate-400 block">Grounded on real EV transaction volume</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-500 block">Peak Demand Ratio</span>
          <span className="text-3xl font-black text-rose-600">
            {Math.round(((demand_breakdown.high || 0) / Math.max(1, total_predictions_generated)) * 100)}%
          </span>
          <span className="text-xs text-slate-400 block">Sessions triggering surge thresholds</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Hourly Distribution */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900">24-Hour Throughput Distribution</h3>
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourly_demand_curve}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '0.75rem', border: 'none', color: '#fff', fontSize: '12px' }}
                  itemStyle={{ color: '#60a5fa' }}
                  formatter={(val) => [`${val} sessions`, 'Average Demand']}
                />
                <Bar dataKey="predicted_sessions" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Demand Level Pie */}
        <div className="lg:col-span-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <h3 className="text-base font-bold text-slate-900">Demand Tier Breakdown</h3>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 text-xs">
            {pieData.map((p) => (
              <div key={p.name} className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }}></span>
                  {p.name}
                </span>
                <span className="font-bold text-slate-900">{p.value} sessions</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default OperatorAnalytics;
