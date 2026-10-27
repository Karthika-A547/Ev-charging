import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Zap, AlertCircle, ShieldAlert, ArrowRight, Building2 } from 'lucide-react';

const OperatorRegister = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    organization_name: '',
    company_details: '',
    city: '',
    state: '',
    address: '',
    business_reg_info: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/operator-register', formData);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.detail || "Operator registration submission failed.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-slate-200 p-8 sm:p-10 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-500 border border-amber-200 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900">Application Submitted</h2>
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-800 text-xs font-medium leading-relaxed">
              Registration submitted successfully. Your account is waiting for administrator approval.
            </div>
            <p className="text-xs text-slate-500 leading-relaxed pt-2">
              Our administrative team will review your organization details ({formData.organization_name}) and grant operator credentials. You will not be able to log in until your application is approved.
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/login"
              className="inline-flex items-center justify-center w-full px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              Go to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-sm border border-slate-200 p-8 sm:p-10 space-y-6">
        
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl text-slate-900 tracking-tight">
              SmartCharge <span className="text-blue-600">Operator</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold text-slate-900 pt-1">Station Operator Registration</h2>
          <p className="text-xs text-slate-500">
            Submit your charging station network for platform onboarding and admin approval.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name</label>
              <input
                type="text"
                name="full_name"
                required
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Operator representative name"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Business Email</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="operator@company.com"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Organization / CPO Name</label>
              <input
                type="text"
                name="organization_name"
                required
                value={formData.organization_name}
                onChange={handleChange}
                placeholder="e.g. ChargePoint Networks India"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Phone Number</label>
              <input
                type="text"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 9876543210"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">State</label>
              <input
                type="text"
                name="state"
                required
                value={formData.state}
                onChange={handleChange}
                placeholder="e.g. Maharashtra"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">City</label>
              <input
                type="text"
                name="city"
                required
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g. Mumbai"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">GSTIN / Reg No (Opt)</label>
              <input
                type="text"
                name="business_reg_info"
                value={formData.business_reg_info}
                onChange={handleChange}
                placeholder="e.g. 27AAAAA0000A1Z5"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Charging Stations / Fleet Details</label>
            <textarea
              name="company_details"
              rows={2}
              value={formData.company_details}
              onChange={handleChange}
              placeholder="Brief details about your charging hubs, locations, or hardware setup..."
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Password</label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Create password"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Confirm Password</label>
              <input
                type="password"
                name="confirm_password"
                required
                value={formData.confirm_password}
                onChange={handleChange}
                placeholder="Confirm password"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm shadow-blue-500/25 mt-2"
          >
            {loading ? 'Submitting Application...' : 'Submit Operator Application'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-slate-600">
          Already approved?{' '}
          <Link to="/login" className="font-semibold text-slate-900 hover:underline">
            Operator Sign In
          </Link>
        </div>

      </div>
    </div>
  );
};

export default OperatorRegister;
