import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import StationMap from '../components/StationMap';
import { CardSkeleton } from '../components/LoadingSkeleton';
import {
  MapPin,
  Zap,
  CloudSun,
  Car,
  TrendingUp,
  Cpu,
  Clock,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Heart,
  Activity,
  Layers,
  Info
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

const StationDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/stations/${id}`);
        setData(res.data);

        // Check if favorite
        try {
          const favs = await api.get('/users/me/favorites');
          const isFav = favs.data.some((f) => f.id === parseInt(id));
          setIsFavorite(isFav);
        } catch (e) {
          // Ignore if not logged in
        }
      } catch (err) {
        setError(err.response?.data?.detail || "Station details could not be loaded.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await api.delete(`/users/me/favorites/${id}`);
        setIsFavorite(false);
      } else {
        await api.post(`/users/me/favorites/${id}`);
        setIsFavorite(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="h-6 bg-slate-200 rounded w-1/4 animate-pulse"></div>
        <CardSkeleton count={3} />
        <div className="h-80 bg-slate-200 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Station Not Found</h2>
        <p className="text-xs text-slate-500">{error || "The requested charging hub does not exist."}</p>
        <Link
          to="/stations"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Stations Directory
        </Link>
      </div>
    );
  }

  const { station, weather, traffic, hourly_demand_trend } = data;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/stations"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Stations
        </Link>
        
        <div className="flex items-center gap-3">
          <button
            onClick={toggleFavorite}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
              isFavorite
                ? 'bg-pink-50 border-pink-200 text-pink-700'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current text-pink-500' : ''}`} />
            {isFavorite ? 'Favorited' : 'Bookmark'}
          </button>
          
          <Link
            to={`/predictions?station_id=${station.id}`}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-sm shadow-brand-500/25 flex items-center gap-1.5 transition-all"
          >
            <Zap className="w-4 h-4 fill-current" /> Predict Demand
          </Link>
        </div>
      </div>

      {/* Main Station Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800">
                {station.station_id}
              </span>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  station.current_demand_level === 'HIGH'
                    ? 'bg-rose-100 text-rose-700 border border-rose-200'
                    : station.current_demand_level === 'MEDIUM'
                    ? 'bg-amber-100 text-amber-700 border border-amber-200'
                    : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                }`}
              >
                {station.current_demand_level} DEMAND TIER
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {station.govt_private || 'Govt.'}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                CPO: {station.cpo_name || 'BEE India'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {station.name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
              <span>{station.location} &bull; {station.city}, {station.state}</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 shrink-0">
            <div className="text-center px-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Power</span>
              <span className="text-xl font-black text-slate-900">{station.total_power_kw || 60} kW</span>
            </div>
            <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>
            <div className="text-center px-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Charging Guns</span>
              <span className="text-xl font-black text-slate-900">{station.charging_gun_num || 2}</span>
            </div>
            <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>
            <div className="text-center px-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Hardware Piles</span>
              <span className="text-xl font-black text-slate-900">{station.piles_num || 2}</span>
            </div>
          </div>
        </div>

        {/* Live Environmental Telemetry Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Weather Widget */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/70 to-indigo-50/50 border border-blue-100 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20">
              <CloudSun className="w-6 h-6" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
                  Open-Meteo Live Weather
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">
                  {weather.available ? 'Live Sync' : 'Baseline'}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">
                  {weather.temperature_c}°C
                </span>
                <span className="text-xs font-semibold text-slate-600">
                  {weather.condition || 'Partly cloudy'}
                </span>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                <span>Humidity: <strong>{weather.humidity_pct}%</strong></span>
                <span>Precipitation: <strong>{weather.precipitation_mm} mm</strong></span>
                <span>Wind: <strong>{weather.wind_speed_kmh} km/h</strong></span>
              </div>
              <p className="text-[10px] text-slate-400 italic pt-1">{weather.status}</p>
            </div>
          </div>

          {/* Traffic Flow Widget */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/70 to-orange-50/50 border border-amber-100 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-amber-500/20">
              <Car className="w-6 h-6" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                  Open Routing Traffic Flow
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">
                  {traffic.available ? 'Flow Computed' : 'Standard'}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">
                  {traffic.traffic_level_name || 'NORMAL'}
                </span>
                <span className="text-xs font-semibold text-slate-600">
                  Index: {traffic.traffic_level_numeric}
                </span>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                <span>Flow Speed: <strong>{traffic.current_speed_kmh || traffic.estimated_speed_kmh || 32} km/h</strong></span>
                <span>Congestion: <strong>{traffic.congestion_ratio ? `${Math.round(traffic.congestion_ratio * 100)}%` : 'Minimal'}</strong></span>
              </div>
              <p className="text-[10px] text-slate-400 italic pt-1">{traffic.status}</p>
            </div>
          </div>

        </div>

        {/* Technical Attributes Grid */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Technical & Infrastructure Specifications
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">DC Fast Piles</span>
              <span className="font-bold text-slate-800 text-sm mt-0.5 block">{station.dc_piles_num || 0} Piles</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">AC Normal Piles</span>
              <span className="font-bold text-slate-800 text-sm mt-0.5 block">{station.ac_piles_num || 0} Piles</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Connector Protocols</span>
              <span className="font-bold text-slate-800 text-sm mt-0.5 block truncate">{station.charger_types || 'Type-II AC, CCS2'}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Coordinates</span>
              <span className="font-mono text-slate-800 text-xs mt-0.5 block truncate">
                {station.latitude?.toFixed(4)}, {station.longitude?.toFixed(4)}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* 24-Hour Demand Pattern Chart */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">24-Hour Charging Demand Curve</h3>
            <p className="text-xs text-slate-500">
              Hourly distribution of expected charging sessions derived from historical real-world transaction frequency.
            </p>
          </div>
          <span className="text-[11px] font-mono text-brand-700 bg-brand-50 border border-brand-200 px-3 py-1 rounded-full self-start">
            Peak Window: 09:00 - 11:00 &bull; 17:00 - 20:00
          </span>
        </div>

        <div className="h-64 sm:h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourly_demand_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="demandGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '0.75rem', border: 'none', color: '#fff', fontSize: '12px' }}
                itemStyle={{ color: '#34d399' }}
                formatter={(value) => [`${value} sessions/hr`, 'Expected Demand']}
              />
              <Area type="monotone" dataKey="demand_sessions" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#demandGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Map Location */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-900">Geographic Location</h3>
        <StationMap stations={[station]} selectedStation={station} height="360px" />
      </div>

    </div>
  );
};

export default StationDetails;
