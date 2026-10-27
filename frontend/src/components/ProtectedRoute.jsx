import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading, role, approvalStatus } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-600 animate-pulse">
            <Zap className="w-6 h-6 animate-bounce" />
          </div>
          <span className="text-sm font-medium text-slate-500">Authenticating session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Operator approval check
  if (role === 'operator' && approvalStatus !== 'approved') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto text-amber-500 mb-4">
            <Zap className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Operator Account Pending Approval</h2>
          <p className="text-sm text-slate-600 mb-6">
            Your registration is currently under review by our administration team. Once approved, you will have complete access to your charging management dashboard.
          </p>
          <a
            href="/"
            className="inline-flex items-center justify-center w-full px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            Return to Homepage
          </a>
        </div>
      </div>
    );
  }

  // Role validation
  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect to respective dashboard
    const defaultRoute = role === 'admin' ? '/admin/dashboard' : (role === 'operator' ? '/operator/dashboard' : '/dashboard');
    return <Navigate to={defaultRoute} replace />;
  }

  return children;
};

export default ProtectedRoute;
