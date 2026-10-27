import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, AlertCircle, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      // Role-based redirection
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'operator') {
        navigate('/operator/dashboard');
      } else {
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from);
      }
    } catch (err) {
      const detail = err.response?.data?.detail || 'Login failed. Please check your credentials.';
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  const autofill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-slate-200 p-8 sm:p-10 space-y-6">
        
        {/* Brand */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-2xl bg-brand-500 text-white flex items-center justify-center shadow-sm shadow-brand-500/25">
              <Zap className="w-6 h-6 fill-current" />
            </div>
            <span className="font-extrabold text-xl text-slate-900 tracking-tight">
              SmartCharge <span className="text-brand-500">AI</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold text-slate-900 pt-1">Sign in to your account</h2>
          <p className="text-xs text-slate-500">
            Access demand prediction, station management, and real-time charging telemetry.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. user@smartcharge.ai"
              className="w-full px-4 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-900"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 block">Password</label>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-900"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Credentials Quick-Fill Buttons */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center">
            One-Click Demo Login
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => autofill('admin@smartcharge.ai', 'Admin@123')}
              className="px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-100 text-purple-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Admin Demo
            </button>
            <button
              type="button"
              onClick={() => autofill('user@smartcharge.ai', 'User@123')}
              className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 text-emerald-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5" /> Driver Demo
            </button>
          </div>
        </div>

        {/* Links */}
        <div className="text-center space-y-2 pt-2 text-xs text-slate-600">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-brand-600 hover:underline">
              Create Driver Account
            </Link>
          </p>
          <p>
            Are you a station operator?{' '}
            <Link to="/operator-register" className="font-semibold text-blue-600 hover:underline">
              Register as Operator
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;
