import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Shield, Building2, MapPin, Mail, Phone, Calendar, CheckCircle2 } from 'lucide-react';

const Profile = () => {
  const { user, role, approvalStatus } = useAuth();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Account Profile</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          User identity, credentials, role authorization, and organization details.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        
        {/* User Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white font-extrabold text-2xl flex items-center justify-center">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900">{user?.full_name}</h2>
              <p className="text-xs text-slate-500">{user?.email}</p>
              <div className="flex items-center gap-2 pt-1">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  role === 'admin'
                    ? 'bg-purple-100 text-purple-700'
                    : role === 'operator'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {role} Account
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {approvalStatus}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 block text-[10px] uppercase font-bold flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" /> Email
            </span>
            <span className="font-semibold text-slate-900 block text-sm">{user?.email}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 block text-[10px] uppercase font-bold flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" /> Phone
            </span>
            <span className="font-semibold text-slate-900 block text-sm">{user?.phone || 'Not provided'}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 block text-[10px] uppercase font-bold flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> Primary City
            </span>
            <span className="font-semibold text-slate-900 block text-sm">{user?.city || 'India'}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 block text-[10px] uppercase font-bold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Member Since
            </span>
            <span className="font-semibold text-slate-900 block text-sm font-mono">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active'}
            </span>
          </div>
        </div>

        {/* Operator Profile Section if Operator */}
        {role === 'operator' && user?.operator_profile && (
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
              <Building2 className="w-4 h-4" /> Operator Organization Profile
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
              <div>
                <span className="text-slate-400 text-[10px] uppercase block">Organization</span>
                <span className="font-bold text-slate-900">{user.operator_profile.organization_name}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase block">State & City</span>
                <span className="font-bold text-slate-900">{user.operator_profile.city}, {user.operator_profile.state}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase block">Business Registration</span>
                <span className="font-bold text-slate-900">{user.operator_profile.business_reg_info || 'Registered'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase block">Address</span>
                <span className="font-bold text-slate-900">{user.operator_profile.address || 'India'}</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Profile;
