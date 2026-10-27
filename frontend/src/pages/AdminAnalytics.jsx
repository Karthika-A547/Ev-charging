import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { BarChart3, TrendingUp, MapPin, Zap, Building2 } from 'lucide-react';
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

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/demand')
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
    demand_levels = {},
    state_demand_breakdown = [],
    top_cpos = []
  } = data || {};

  const pieData = [
    { name: 'Low Demand', value: demand_levels.LOW || 1, color: '#10b981' },
    { name: 'Medium Demand', value: demand_levels.MEDIUM || 1, color: '#f59e0b' },
    { name: 'High Demand', value: demand_levels.HIGH || 1, color: '#ef4444' }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">National Network Analytics</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Geographic and Charge Point Operator (CPO) market distribution across Indian charging infrastructure.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Top CPOs */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-purple-600" />
            Top Charge Point Operators (CPOs) in India
          </h3>
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top_cpos}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="cpo" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '0.75rem', border: 'none', color: '#fff', fontSize: '12px' }}
                  itemStyle={{ color: '#c084fc' }}
                  formatter={(val) => [`${val} stations`, 'Hubs Managed']}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* National Demand Pie */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Zap className="w-4 h-4 text-brand-600" />
            Platform Demand Distribution
          </h3>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
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
                <span className="font-bold text-slate-900">{p.value.toLocaleString()} Hubs</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminAnalytics;
