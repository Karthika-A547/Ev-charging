import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Public Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import OperatorRegister from './pages/OperatorRegister';

// User Pages
import UserDashboard from './pages/UserDashboard';
import StationsList from './pages/StationsList';
import StationDetails from './pages/StationDetails';
import PredictionPage from './pages/PredictionPage';
import UserHistory from './pages/UserHistory';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import NotificationsPage from './pages/NotificationsPage';

// Operator Pages
import OperatorDashboard from './pages/OperatorDashboard';
import OperatorStations from './pages/OperatorStations';
import OperatorAnalytics from './pages/OperatorAnalytics';
import OperatorHistory from './pages/OperatorHistory';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminOperatorRequests from './pages/AdminOperatorRequests';
import AdminUsers from './pages/AdminUsers';
import AdminOperators from './pages/AdminOperators';
import AdminStations from './pages/AdminStations';
import AdminDatasets from './pages/AdminDatasets';
import AdminModel from './pages/AdminModel';
import AdminModelHistory from './pages/AdminModelHistory';
import AdminActivity from './pages/AdminActivity';
import AdminAnalytics from './pages/AdminAnalytics';

const AppLayout = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check if current route is a standalone public page
  const isPublicStandalone = ['/', '/login', '/register', '/operator-register'].includes(location.pathname);

  if (isPublicStandalone && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar toggleSidebar={() => {}} isSidebarOpen={false} />
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        isSidebarOpen={sidebarOpen}
      />
      <div className="flex-1 flex">
        {isAuthenticated && (
          <Sidebar
            isOpen={sidebarOpen}
            closeSidebar={() => setSidebarOpen(false)}
          />
        )}
        <main className={`flex-1 transition-all duration-200 ${isAuthenticated ? 'lg:pl-64' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/operator-register" element={<OperatorRegister />} />

            {/* User & General Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['user', 'operator', 'admin']}>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/stations"
              element={
                <ProtectedRoute allowedRoles={['user', 'operator', 'admin']}>
                  <StationsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/stations/:id"
              element={
                <ProtectedRoute allowedRoles={['user', 'operator', 'admin']}>
                  <StationDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/predictions"
              element={
                <ProtectedRoute allowedRoles={['user', 'operator', 'admin']}>
                  <PredictionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute allowedRoles={['user', 'operator', 'admin']}>
                  <UserHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/favorites"
              element={
                <ProtectedRoute allowedRoles={['user', 'operator', 'admin']}>
                  <Favorites />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={['user', 'operator', 'admin']}>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute allowedRoles={['user', 'operator', 'admin']}>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />

            {/* Operator Protected Routes */}
            <Route
              path="/operator/dashboard"
              element={
                <ProtectedRoute allowedRoles={['operator', 'admin']}>
                  <OperatorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/operator/stations"
              element={
                <ProtectedRoute allowedRoles={['operator', 'admin']}>
                  <OperatorStations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/operator/stations/:id"
              element={
                <ProtectedRoute allowedRoles={['operator', 'admin']}>
                  <StationDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/operator/predictions"
              element={
                <ProtectedRoute allowedRoles={['operator', 'admin']}>
                  <PredictionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/operator/analytics"
              element={
                <ProtectedRoute allowedRoles={['operator', 'admin']}>
                  <OperatorAnalytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/operator/history"
              element={
                <ProtectedRoute allowedRoles={['operator', 'admin']}>
                  <OperatorHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/operator/profile"
              element={
                <ProtectedRoute allowedRoles={['operator', 'admin']}>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Admin Protected Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/operators/requests"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminOperatorRequests />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/operators"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminOperators />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/stations"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminStations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/datasets"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDatasets />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/model"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminModel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/model-history"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminModelHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/activity"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminActivity />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminAnalytics />
                </ProtectedRoute>
              }
            />

            {/* Catch-all Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </Router>
    </AuthProvider>
  );
}

export default App;
