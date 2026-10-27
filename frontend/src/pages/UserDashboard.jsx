import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StationMap from '../components/StationMap';
import { CardSkeleton, TableSkeleton } from '../components/LoadingSkeleton';
import {
  MapPin,
  Cpu,
  Zap,
  Clock,
  Heart,
  Search,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  CloudSun,
  Navigation
} from 'lucide-react';

const UserDashboard = () => {
  const { user } = useAuth();
  const [stations, setStations] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [stationsRes, predsRes, favsRes] = await Promise.all([
          api.get('/stations?limit=50'),
          api.get('/users/me/predictions?limit=5'),
          api.get('/users/me/favorites')
        ]);
        setStations(stationsRes.data);
        setPredictions(predsRes.data);
        setFavorites(favsRes.data);
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const highDemandStations = stations.filter((s) => s.current_demand_level === 'HIGH');
  const activeStations = stations.filter((s) => s.is_operational);

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="h-8 bg-slate-200 rounded w-1/4 animate-pulse"></div>
        <CardSkeleton count={4} />
        <div className="h-96 bg-slate-200 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-navy-900 to-slate-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-sm">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-400 text-xs font-semibold border border-brand-500/30">
            <Zap className="w-3.5 h-3.5 fill-current" /> Driver Intelligence Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.full_name?.split(' ')[0] || 'EV Driver'}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Real-time charging availability, live demand forecasting, and network status across India. Predict queue times before arriving.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/predictions"
              className="px-4 py-2 rounded-xl bg-brand-600 text-white font-semibold text-xs hover:bg-brand-500 transition-colors flex items-center gap-1.5 shadow-sm shadow-brand-500/30"
            >
              <Cpu className="w-3.5 h-3.5" /> Predict Demand
            </Link>
            <Link
              to="/stations"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5 text-brand-400" /> Explore All Stations
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Available Stations</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900">{activeStations.length}</span>
          <span className="text-[11px] text-slate-500 block">Operational in current sector</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">High Demand Hubs</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-rose-600">{highDemandStations.length}</span>
          <span className="text-[11px] text-slate-500 block">&ge; 7 sessions/hr predicted</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Saved Favorites</span>
            <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
              <Heart className="w-4 h-4 fill-current" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900">{favorites.length}</span>
          <span className="text-[11px] text-slate-500 block">Bookmarked charging hubs</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">My Predictions</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900">{predictions.length}</span>
          <span className="text-[11px] text-slate-500 block">AI queries generated</span>
        </div>
      </div>

      {/* Interactive Map Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">National EV Charging Map</h3>
            <p className="text-xs text-slate-500">Color-coded markers indicate live AI demand level (Green: Low, Amber: Medium, Red: High)</p>
          </div>
          <Link to="/stations" className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1">
            Full Map View <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <StationMap stations={stations} height="420px" />
      </div>

      {/* Two Column Layout: Nearby Stations & Recent Predictions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recommended Stations */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Active Charging Stations</h3>
            <Link to="/stations" className="text-xs text-slate-500 hover:text-slate-800 font-medium">
              View all ({stations.length})
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {stations.slice(0, 6).map((st) => (
              <div
                key={st.id}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {st.station_id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        st.current_demand_level === 'HIGH'
                          ? 'bg-rose-100 text-rose-700'
                          : st.current_demand_level === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {st.current_demand_level}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{st.name}</h4>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{st.city}, {st.state}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2 rounded-xl">
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase">Power</span>
                    <span className="font-semibold text-slate-700">{st.total_power_kw || 60} kW</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase">Plugs</span>
                    <span className="font-semibold text-slate-700">{st.charging_gun_num || 2} Guns</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Link
                    to={`/stations/${st.id}`}
                    className="flex-1 py-1.5 text-center text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition-colors"
                  >
                    Details
                  </Link>
                  <Link
                    to={`/predictions?station_id=${st.id}`}
                    className="px-3 py-1.5 text-xs font-semibold bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 rounded-xl transition-colors flex items-center gap-1"
                  >
                    <Zap className="w-3 h-3" /> Predict
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent AI Predictions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Recent AI Predictions</h3>
            <Link to="/history" className="text-xs text-brand-600 hover:text-brand-700 font-semibold">
              History
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
            {predictions.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs space-y-2">
                <Cpu className="w-8 h-8 mx-auto text-slate-300" />
                <p>No predictions generated yet.</p>
                <Link
                  to="/predictions"
                  className="inline-block mt-2 px-3 py-1.5 bg-brand-600 text-white rounded-xl font-medium text-xs hover:bg-brand-500"
                >
                  Create first prediction
                </Link>
              </div>
            ) : (
              predictions.map((p) => (
                <div key={p.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 truncate max-w-[150px]">{p.station_name}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        p.demand_level === 'HIGH'
                          ? 'bg-rose-100 text-rose-700'
                          : p.demand_level === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {p.predicted_demand} sessions ({p.demand_level})
                    </span>
                  </div>
                  <div className="text-slate-500 flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {p.target_date} @ {String(p.hour).padStart(2, '0')}:00
                    </span>
                    <span className="font-mono text-[10px]">{p.model_version ? p.model_version.split('-')[1] : ''}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default UserDashboard;
