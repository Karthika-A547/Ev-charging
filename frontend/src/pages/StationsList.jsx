import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import StationMap from '../components/StationMap';
import { TableSkeleton } from '../components/LoadingSkeleton';
import {
  Search,
  Filter,
  MapPin,
  Zap,
  Heart,
  ChevronLeft,
  ChevronRight,
  Layers,
  Map as MapIcon,
  List as ListIcon
} from 'lucide-react';

const StationsList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [stations, setStations] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(new Set());

  // Filter States
  const [search, setSearch] = useState(initialSearch);
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDemand, setSelectedDemand] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'

  // Pagination
  const [offset, setOffset] = useState(0);
  const limit = 30;

  // Load States dropdown
  useEffect(() => {
    api.get('/stations/states').then((res) => setStates(res.data)).catch(() => {});
    api.get('/users/me/favorites').then((res) => {
      setFavorites(new Set(res.data.map((s) => s.id)));
    }).catch(() => {});
  }, []);

  // Load Cities when state changes
  useEffect(() => {
    if (selectedState) {
      api.get(`/stations/cities?state=${encodeURIComponent(selectedState)}`)
        .then((res) => setCities(res.data))
        .catch(() => {});
    } else {
      setCities([]);
      setSelectedCity('');
    }
  }, [selectedState]);

  // Fetch stations with filters
  const fetchStations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (selectedState) params.append('state', selectedState);
      if (selectedCity) params.append('city', selectedCity);
      if (selectedDemand) params.append('demand_level', selectedDemand);
      params.append('limit', limit);
      params.append('offset', offset);

      const res = await api.get(`/stations?${params.toString()}`);
      setStations(res.data);
    } catch (e) {
      console.error("Error loading stations:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, [offset, selectedState, selectedCity, selectedDemand]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setOffset(0);
    fetchStations();
  };

  const toggleFavorite = async (stationId) => {
    const isFav = favorites.has(stationId);
    try {
      if (isFav) {
        await api.delete(`/users/me/favorites/${stationId}`);
        const next = new Set(favorites);
        next.delete(stationId);
        setFavorites(next);
      } else {
        await api.post(`/users/me/favorites/${stationId}`);
        const next = new Set(favorites);
        next.add(stationId);
        setFavorites(next);
      }
    } catch (e) {
      console.error("Failed to toggle favorite:", e);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Charging Station Network</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real validated stations across 22+ states from official BEE India directory.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start sm:self-auto border border-slate-200">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ListIcon className="w-3.5 h-3.5" /> Station Cards
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              viewMode === 'map' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" /> Interactive Map
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-3">
          
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by station name, CPO (e.g. Tata Power, IOCL), or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full md:w-auto">
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setOffset(0);
              }}
              className="px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:border-brand-500"
            >
              <option value="">All States</option>
              {states.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>

            <select
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                setOffset(0);
              }}
              disabled={!selectedState}
              className="px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:border-brand-500 disabled:opacity-50"
            >
              <option value="">All Cities</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={selectedDemand}
              onChange={(e) => {
                setSelectedDemand(e.target.value);
                setOffset(0);
              }}
              className="px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:border-brand-500 col-span-2 sm:col-span-1"
            >
              <option value="">All Demand Tiers</option>
              <option value="LOW">Low Demand</option>
              <option value="MEDIUM">Medium Demand</option>
              <option value="HIGH">High Demand</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full md:w-auto px-5 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors"
          >
            Apply Filter
          </button>
        </form>
      </div>

      {/* Main Content Area */}
      {viewMode === 'map' ? (
        <div className="space-y-4">
          <StationMap stations={stations} height="600px" />
          <p className="text-xs text-slate-500 text-center">
            Showing up to {stations.length} charging stations matching your criteria on the interactive map.
          </p>
        </div>
      ) : loading ? (
        <TableSkeleton rows={8} />
      ) : stations.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
          <Layers className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No charging stations found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search keywords, clearing state filters, or selecting a different demand tier.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedState('');
              setSelectedCity('');
              setSelectedDemand('');
              setOffset(0);
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {stations.map((st) => (
              <div
                key={st.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {st.station_id}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          st.current_demand_level === 'HIGH'
                            ? 'bg-rose-100 text-rose-700'
                            : st.current_demand_level === 'MEDIUM'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {st.current_demand_level} DEMAND
                      </span>
                      <button
                        onClick={() => toggleFavorite(st.id)}
                        className={`p-1 rounded-lg transition-colors ${
                          favorites.has(st.id) ? 'text-pink-500' : 'text-slate-300 hover:text-slate-500'
                        }`}
                        title="Bookmark favorite"
                      >
                        <Heart className={`w-4 h-4 ${favorites.has(st.id) ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                    {st.name}
                  </h3>

                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{st.city || st.state}, {st.state}</span>
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl text-center text-xs">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Operator</span>
                    <span className="font-semibold text-slate-700 truncate block">{st.cpo_name || 'BEE'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Power</span>
                    <span className="font-semibold text-slate-700">{st.total_power_kw || 60} kW</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Guns</span>
                    <span className="font-semibold text-slate-700">{st.charging_gun_num || 2}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                  <Link
                    to={`/stations/${st.id}`}
                    className="flex-1 text-center py-2 px-3 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
                  >
                    View Details
                  </Link>
                  <Link
                    to={`/predictions?station_id=${st.id}`}
                    className="py-2 px-3 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Zap className="w-3.5 h-3.5" /> Predict
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200">
            <span className="text-xs text-slate-500">
              Showing {offset + 1} - {offset + stations.length} stations
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={offset === 0}
                onClick={() => setOffset(Math.max(0, offset - limit))}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={stations.length < limit}
                onClick={() => setOffset(offset + limit)}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StationsList;
