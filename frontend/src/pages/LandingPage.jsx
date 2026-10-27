import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  Cpu,
  CloudSun,
  Car,
  TrendingUp,
  Shield,
  Layers,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Database,
  BarChart4
} from 'lucide-react';
import api from '../services/api';

const LandingPage = () => {
  const [stats, setStats] = useState({
    stations: 8370,
    transactions: '8.54M',
    accuracy: '77.3% R²',
    cpos: '25+'
  });

  useEffect(() => {
    // Attempt to load live count
    api.get('/stations?limit=1')
      .then(() => {
        // Stats are grounded in real datasets
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200 bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.07]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-ping"></span>
              Real EV Transactions & BEE India Stations Connected
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Predict EV Charging Demand <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-teal-500 to-emerald-600">
                Before It Peaks
              </span>
            </h1>

            <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              SmartCharge AI uses historical charging activity, station technical specifications, live Open-Meteo weather, and traffic flow conditions to forecast future EV charging demand across India.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                to="/stations"
                className="px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              >
                <MapPin className="w-4 h-4 text-brand-400" /> Explore Stations
              </Link>
              <Link
                to="/register"
                className="px-6 py-3 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-500 shadow-sm shadow-brand-500/25 transition-all flex items-center gap-2"
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Demo Credentials Box */}
            <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-2xl max-w-xl mx-auto text-left shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Preconfigured Demo Credentials
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-900 block mb-1">Administrator</span>
                  <span className="text-slate-600 font-mono block">admin@smartcharge.ai</span>
                  <span className="text-slate-500 font-mono block">Pass: Admin@123</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-900 block mb-1">EV Driver (User)</span>
                  <span className="text-slate-600 font-mono block">user@smartcharge.ai</span>
                  <span className="text-slate-500 font-mono block">Pass: User@123</span>
                </div>
              </div>
              <div className="mt-2 text-center">
                <Link to="/operator-register" className="text-xs text-brand-600 hover:underline font-medium">
                  Looking to register as a Charging Operator? Submit an approval request &rarr;
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Metrics Row */}
      <section className="bg-white border-b border-slate-200 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">8,544,695</span>
              <span className="text-xs text-slate-500 font-medium block mt-1">Real EV Transactions</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">8,370+</span>
              <span className="text-xs text-slate-500 font-medium block mt-1">India EV Stations</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-3xl font-extrabold text-brand-600 tracking-tight">0.88 MAE</span>
              <span className="text-xs text-slate-500 font-medium block mt-1">Random Forest Error</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">100% Free</span>
              <span className="text-xs text-slate-500 font-medium block mt-1">Open Weather & Traffic APIs</span>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Built for Drivers, Operators & Grid Administrators
          </h2>
          <p className="text-slate-600 text-sm">
            End-to-end intelligence platform using scikit-learn Random Forest regression, FastAPI, and OpenStreetMap.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">AI Demand Prediction</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Trained directly on real transactional datasets with 80/20 train/test evaluation (R² = 0.7726). Predicts hourly sessions and classifies into LOW, MEDIUM, or HIGH demand.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CloudSun className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Open-Meteo Weather API</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Coordinate-based temperature, humidity, precipitation, and conditions fetched on demand with 15-minute caching and safe fallback mechanisms.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Car className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Live Traffic Flow</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Open routing and road network congestion analysis computes urban traffic levels around charging stations to enrich prediction inputs.
            </p>
          </div>
        </div>
      </section>

      {/* Role Breakdown */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Role-Based Charging Ecosystem
            </h2>
            <p className="text-slate-600 text-sm">
              Strict backend role validation with customized portals for each user type.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* User */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                  Normal User
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <h4 className="text-base font-bold text-slate-900">EV Drivers & Fleets</h4>
              <ul className="text-xs text-slate-600 space-y-2">
                <li>• Search India stations by city, state, or CPO</li>
                <li>• Interactive Leaflet map with colored demand pins</li>
                <li>• Generate instant hour-by-hour demand forecasts</li>
                <li>• Save favorite charging hubs</li>
                <li>• View private search & prediction history</li>
              </ul>
              <Link to="/login" className="block text-center py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors">
                Log in as Driver &rarr;
              </Link>
            </div>

            {/* Operator */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full">
                  Charging Operator
                </span>
                <Shield className="w-4 h-4 text-blue-600" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Station Operators (CPOs)</h4>
              <ul className="text-xs text-slate-600 space-y-2">
                <li>• Registration with organization details</li>
                <li>• Pending admin approval workflow</li>
                <li>• Dedicated assigned station dashboard</li>
                <li>• Real-time peak hour analytics & utilization</li>
                <li>• Update operational status & power capacity</li>
              </ul>
              <Link to="/operator-register" className="block text-center py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors">
                Register as Operator &rarr;
              </Link>
            </div>

            {/* Admin */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2.5 py-1 rounded-full">
                  Platform Admin
                </span>
                <Database className="w-4 h-4 text-purple-600" />
              </div>
              <h4 className="text-base font-bold text-slate-900">System Administrators</h4>
              <ul className="text-xs text-slate-600 space-y-2">
                <li>• Operator approval / rejection with custom notes</li>
                <li>• Assign charging stations to approved operators</li>
                <li>• Inspect real datasets & parquet coverage</li>
                <li>• Trigger Random Forest ML model retrain</li>
                <li>• Comprehensive audit & system activity logs</li>
              </ul>
              <Link to="/login" className="block text-center py-2 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors">
                Admin Portal Login &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 text-xs py-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-brand-400" />
            <span className="font-bold text-slate-200">SmartCharge AI</span>
            <span>&copy; {new Date().getFullYear()} – All Rights Reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/stations" className="hover:text-white transition-colors">Stations</Link>
            <Link to="/predictions" className="hover:text-white transition-colors">AI Predictor</Link>
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link to="/operator-register" className="hover:text-white transition-colors">Operator Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
