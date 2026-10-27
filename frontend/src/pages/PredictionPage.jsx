import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import {
  Cpu,
  Zap,
  Calendar,
  Clock,
  CloudSun,
  Car,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Info,
  RefreshCw,
  MapPin,
  Search,
  Filter
} from 'lucide-react';

const PredictionPage = () => {
  const [searchParams] = useSearchParams();
  const preSelectedStationId = searchParams.get('station_id') || '';

  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [stations, setStations] = useState([]);
  const [selectedStationId, setSelectedStationId] = useState(preSelectedStationId);
  const [loadingStations, setLoadingStations] = useState(false);

  const [targetDate, setTargetDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [hour, setHour] = useState(18);

  // Weather & traffic auto fetch toggle
  const [autoFetchApi, setAutoFetchApi] = useState(true);
  const [tempOverride, setTempOverride] = useState(28);
  const [humidityOverride, setHumidityOverride] = useState(55);
  const [precipOverride, setPrecipOverride] = useState(0);
  const [trafficOverride, setTrafficOverride] = useState(1.5);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [showTechDetails, setShowTechDetails] = useState(false);

  // 1. Fetch available states for dropdown
  useEffect(() => {
    api.get('/stations/states')
      .then((res) => {
        setStates(res.data || []);
      })
      .catch((e) => console.error('Failed to load states:', e));
  }, []);

  // 2. Fetch cities whenever selectedState changes
  useEffect(() => {
    setSelectedCity('');
    if (selectedState) {
      api.get(`/stations/cities?state=${encodeURIComponent(selectedState)}`)
        .then((res) => {
          setCities(res.data || []);
        })
        .catch((e) => console.error('Failed to load cities:', e));
    } else {
      setCities([]);
    }
  }, [selectedState]);

  // 3. If preSelectedStationId exists, fetch its state and city
  useEffect(() => {
    if (preSelectedStationId) {
      api.get(`/stations/${preSelectedStationId}`)
        .then((res) => {
          const st = res.data?.station || res.data;
          if (st?.state) {
            setSelectedState(st.state);
            if (st?.city) setSelectedCity(st.city);
          }
        })
        .catch((e) => console.error(e));
    }
  }, [preSelectedStationId]);

  // 4. Automatically load stations whenever state, city, or search changes
  useEffect(() => {
    setLoadingStations(true);
    const params = { limit: 500 };
    if (selectedState) params.state = selectedState;
    if (selectedCity) params.city = selectedCity;
    if (searchQuery.trim()) params.search = searchQuery.trim();

    api.get('/stations', { params })
      .then((res) => {
        const list = res.data || [];
        setStations(list);
        if (list.length > 0) {
          const exists = list.some((s) => s.id.toString() === selectedStationId);
          if (!exists && !preSelectedStationId) {
            setSelectedStationId(list[0].id.toString());
          }
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoadingStations(false));
  }, [selectedState, selectedCity, searchQuery]);

  const handlePredict = async (e) => {
    e.preventDefault();
    if (!selectedStationId) {
      setError("Please select a charging station.");
      return;
    }

    setError('');
    setLoading(true);
    setResult(null);

    try {
      const payload = {
        station_id: selectedStationId.toString(),
        target_date: targetDate,
        hour: parseInt(hour),
        fetch_live_api: autoFetchApi
      };

      if (!autoFetchApi) {
        payload.temperature = parseFloat(tempOverride);
        payload.humidity = parseFloat(humidityOverride);
        payload.precipitation = parseFloat(precipOverride);
        payload.traffic_level = parseFloat(trafficOverride);
      }

      const res = await api.post('/predictions', payload);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Prediction generation failed. Ensure backend and model are active.");
    } finally {
      setLoading(false);
    }
  };

  const currentSelectedStation = stations.find((s) => s.id.toString() === selectedStationId);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 fill-current" /> Random Forest Inference Engine
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          AI Charging Demand Predictor
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
          Forecast upcoming EV demand at any station in India. Inputs are combined with live Open-Meteo atmospheric telemetry and routing traffic congestion.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Input Form Column */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-brand-600" /> Prediction Parameters
            </h2>
            <span className="text-[11px] font-mono text-slate-400">Model: RF-Demand-v1.0</span>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handlePredict} className="space-y-4">
            
            {/* Station Selection Section with State Filter and Search */}
            <div className="space-y-2.5 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-600" /> Target Charging Station
                </label>
                <span className="text-[11px] text-slate-500 font-medium">
                  {loadingStations ? "Loading..." : `${stations.length} stations available`}
                </span>
              </div>

              {/* State Filter & Search Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* 1. State Dropdown */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">1. Select State</label>
                  <div className="relative">
                    <Filter className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={selectedState}
                      onChange={(e) => {
                        setSelectedState(e.target.value);
                        setSearchQuery(''); // Clear manual search so all stations in the state are shown directly
                      }}
                      className="w-full pl-7 pr-2 py-1.5 text-xs rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
                    >
                      <option value="">All States (India)</option>
                      {states.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 2. City Dropdown */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    2. Select City {selectedState ? `in ${selectedState}` : ''}
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => {
                      setSelectedCity(e.target.value);
                      setSearchQuery('');
                    }}
                    disabled={!selectedState && cities.length === 0}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <option value="">
                      {selectedState ? `All Cities in ${selectedState}` : "Select a State first"}
                    </option>
                    {cities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Optional Quick Search Keyword Filter */}
              <div>
                <div className="relative">
                  <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Optional: Filter stations by keyword, CPO (e.g. Ather, Tata, IOCL)..."
                    className="w-full pl-7 pr-2.5 py-1.5 text-xs rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Station Dropdown */}
              <div>
                <select
                  value={selectedStationId}
                  onChange={(e) => setSelectedStationId(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
                >
                  {stations.length === 0 ? (
                    <option value="">No stations found for this state/search</option>
                  ) : (
                    stations.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.station_id} &ndash; {st.name} | {st.city}, {st.state} ({st.cpo_name})
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Quick Station Metadata Card */}
              {currentSelectedStation && (
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs shadow-xs">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <span className="truncate max-w-[240px] sm:max-w-xs">{currentSelectedStation.name}</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-100 text-slate-700">
                        {currentSelectedStation.cpo_name}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {currentSelectedStation.city}, {currentSelectedStation.state} &bull; {currentSelectedStation.total_power_kw} kW &bull; {currentSelectedStation.charging_gun_num} Guns
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      currentSelectedStation.current_demand_level === 'HIGH'
                        ? 'bg-rose-100 text-rose-700'
                        : currentSelectedStation.current_demand_level === 'MEDIUM'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {currentSelectedStation.current_demand_level} DEMAND
                  </span>
                </div>
              )}
            </div>

            {/* Date and Hour */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Target Date
                </label>
                <input
                  type="date"
                  required
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Target Time of Day
                </label>
                <select
                  value={hour}
                  onChange={(e) => setHour(parseInt(e.target.value))}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                >
                  {Array.from({ length: 24 }).map((_, i) => (
                    <option key={i} value={i}>
                      {`${i.toString().padStart(2, '0')}:00`} {i >= 12 ? 'PM' : 'AM'} {i === 9 || i === 18 ? '(Peak Typical)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Weather & Traffic Integration Toggle */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Live API Integration</span>
                  <span className="text-[11px] text-slate-500">Auto-retrieve Open-Meteo weather & Open Traffic flow</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoFetchApi}
                    onChange={(e) => setAutoFetchApi(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-600"></div>
                </label>
              </div>

              {!autoFetchApi && (
                <div className="pt-3 border-t border-slate-200 space-y-3 animate-in fade-in">
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                    Manual Environmental Overrides
                  </span>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-1">Temperature (°C): {tempOverride}°C</label>
                      <input
                        type="range"
                        min="5"
                        max="48"
                        step="0.5"
                        value={tempOverride}
                        onChange={(e) => setTempOverride(e.target.value)}
                        className="w-full accent-brand-600"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-1">Humidity (%): {humidityOverride}%</label>
                      <input
                        type="range"
                        min="10"
                        max="98"
                        value={humidityOverride}
                        onChange={(e) => setHumidityOverride(e.target.value)}
                        className="w-full accent-brand-600"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-1">Precipitation (mm): {precipOverride} mm</label>
                      <input
                        type="range"
                        min="0"
                        max="30"
                        step="0.5"
                        value={precipOverride}
                        onChange={(e) => setPrecipOverride(e.target.value)}
                        className="w-full accent-brand-600"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-1">Traffic Congestion Index: {trafficOverride}</label>
                      <input
                        type="range"
                        min="0.5"
                        max="4.0"
                        step="0.1"
                        value={trafficOverride}
                        onChange={(e) => setTrafficOverride(e.target.value)}
                        className="w-full accent-brand-600"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-brand-400" />
                  Generating Random Forest Forecast...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-brand-400 text-brand-400" />
                  Predict Charging Demand
                </>
              )}
            </button>
          </form>
        </div>

        {/* Prediction Results Column */}
        <div className="lg:col-span-6 space-y-6">
          {result ? (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-in fade-in duration-200">
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Model Prediction Output
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  {new Date(result.timestamp).toLocaleTimeString()}
                </span>
              </div>

              {/* Big KPI Highlight */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-navy-950 text-white space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">Target Session Volume</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-extrabold tracking-wider ${
                      result.demand_level === 'HIGH'
                        ? 'bg-rose-500 text-white'
                        : result.demand_level === 'MEDIUM'
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-emerald-500 text-white'
                    }`}
                  >
                    {result.demand_level} DEMAND
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black text-brand-400 tracking-tight">
                    {result.predicted_demand_sessions}
                  </span>
                  <span className="text-sm font-medium text-slate-300">
                    charging sessions / hour
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                  <span>Station: <strong className="text-slate-200">{result.station_name}</strong></span>
                  <span>Time: <strong className="text-slate-200">{result.target_date} @ {result.hour?.toString().padStart(2, '0')}:00</strong></span>
                </div>
              </div>

              {/* Metrics & Environmental Inputs Breakdown */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                
                {/* Historical baseline & comparison */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Normal Station Pace</span>
                  <span className="text-base font-extrabold text-slate-900">
                    {result.historical_mean_demand} cars/hr avg
                  </span>
                  <span className={`text-[10px] font-semibold block ${
                    result.predicted_demand_sessions < result.historical_mean_demand
                      ? 'text-emerald-600'
                      : result.predicted_demand_sessions > result.historical_mean_demand
                      ? 'text-amber-600'
                      : 'text-slate-500'
                  }`}>
                    {result.predicted_demand_sessions < result.historical_mean_demand
                      ? `↓ ${Math.round((result.historical_mean_demand - result.predicted_demand_sessions) * 10) / 10} fewer cars/hr (Quieter hour)`
                      : result.predicted_demand_sessions > result.historical_mean_demand
                      ? `↑ ${Math.round((result.predicted_demand_sessions - result.historical_mean_demand) * 10) / 10} more cars/hr (Busier hour)`
                      : 'Matches normal rush'}
                  </span>
                </div>

                {/* Weather condition */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Weather Factors</span>
                  <span className="text-base font-extrabold text-slate-900">
                    {result.weather_inputs?.temperature_c}°C
                  </span>
                  <span className="text-[10px] text-slate-500 block truncate">
                    {result.weather_inputs?.condition || 'Partly cloudy'} &bull; {result.weather_inputs?.humidity_pct}% RH
                  </span>
                </div>

                {/* Traffic Flow */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Traffic Congestion</span>
                  <span className="text-base font-extrabold text-slate-900">
                    {result.traffic_inputs?.traffic_level_name || 'NORMAL'}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    Impedance Index: {result.traffic_inputs?.traffic_level_numeric}
                  </span>
                </div>

                {/* Driver-Centric Estimated Wait Time */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Estimated Wait Time</span>
                  <span
                    className={`text-base font-extrabold ${
                      result.demand_level === 'HIGH'
                        ? 'text-rose-600'
                        : result.demand_level === 'MEDIUM'
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {result.demand_level === 'HIGH'
                      ? '20 - 30 mins'
                      : result.demand_level === 'MEDIUM'
                      ? '5 - 15 mins'
                      : '< 5 mins (Immediate)'}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    {result.demand_level === 'HIGH'
                      ? 'Peak occupancy likely'
                      : result.demand_level === 'MEDIUM'
                      ? 'Steady charger turnover'
                      : 'Open chargers available'}
                  </span>
                </div>

              </div>

              {/* Driver Recommendation Advice Banner */}
              <div
                className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 ${
                  result.demand_level === 'HIGH'
                    ? 'bg-rose-50/80 border-rose-200 text-rose-800'
                    : result.demand_level === 'MEDIUM'
                    ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                    : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                }`}
              >
                <Sparkles
                  className={`w-4 h-4 shrink-0 mt-0.5 ${
                    result.demand_level === 'HIGH'
                      ? 'text-rose-500'
                      : result.demand_level === 'MEDIUM'
                      ? 'text-amber-500'
                      : 'text-emerald-600'
                  }`}
                />
                <div className="space-y-0.5">
                  <span className="font-bold block">
                    {result.demand_level === 'HIGH'
                      ? 'High Demand Alert'
                      : result.demand_level === 'MEDIUM'
                      ? 'Moderate Charging Traffic'
                      : 'Optimal Charging Window'}
                  </span>
                  <p className="text-[11px] leading-relaxed opacity-90">
                    {result.demand_level === 'HIGH'
                      ? 'Heavy vehicle demand projected during this hour. Consider arriving 30 minutes earlier or routing to a nearby backup station.'
                      : result.demand_level === 'MEDIUM'
                      ? 'Normal charging pace expected. Most EV drivers find an open plug with little to no waiting.'
                      : 'Excellent time to charge! Fast access with immediate plug availability and zero queue expected.'}
                  </p>
                </div>
              </div>

              {/* Status Note & Collapsible Technical Model Diagnostics */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Stored to your activity history
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowTechDetails(!showTechDetails)}
                    className="text-[11px] text-slate-400 hover:text-slate-600 underline cursor-pointer"
                  >
                    {showTechDetails ? 'Hide ML Model Specs' : 'View ML Model Specs'}
                  </button>
                </div>

                {showTechDetails && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 space-y-1 font-mono animate-in fade-in duration-150">
                    <div className="flex justify-between">
                      <span>Model:</span>
                      <span className="font-bold text-slate-800">Random Forest Regressor (v1.0)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Holdout Accuracy:</span>
                      <span className="font-bold text-slate-800">R² = 0.7726 (77.3% Variance)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Test Error:</span>
                      <span className="font-bold text-slate-800">MAE = 0.8838 sessions | RMSE = 1.5485</span>
                    </div>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-sm text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
                <Cpu className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Ready for Prediction</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Select your target charging hub, pick the date and hour, and click <strong>Predict Charging Demand</strong> to compute future vehicle throughput.
              </p>
              
              {/* Demand Level Threshold Explainer */}
              <div className="pt-4 border-t border-slate-100 text-left space-y-2">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Transparent Demand Tier Thresholds:
                </span>
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span><strong>LOW:</strong> &le; 2.0 sessions / hour (minimal queue time)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span><strong>MEDIUM:</strong> 2.1 &ndash; 6.0 sessions / hour (moderate queue time)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                    <span><strong>HIGH:</strong> &ge; 6.1 sessions / hour (high queue likelihood)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default PredictionPage;
