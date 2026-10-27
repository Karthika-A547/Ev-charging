import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('smartcharge_token') || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('smartcharge_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.get('/auth/me')
        .then((res) => {
          setUser(res.data);
          localStorage.setItem('smartcharge_user', JSON.stringify(res.data));
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { access_token, role, user_id, full_name, approval_status } = res.data;
    
    setToken(access_token);
    localStorage.setItem('smartcharge_token', access_token);
    
    // Fetch full profile
    const profileRes = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    setUser(profileRes.data);
    localStorage.setItem('smartcharge_user', JSON.stringify(profileRes.data));
    return profileRes.data;
  };

  const logout = async () => {
    try {
      if (token) await api.post('/auth/logout');
    } catch (e) {
      // Ignore logout error
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('smartcharge_token');
      localStorage.removeItem('smartcharge_user');
    }
  };

  const refreshUser = async () => {
    if (token) {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data);
        localStorage.setItem('smartcharge_user', JSON.stringify(res.data));
      } catch (e) {
        console.error("Failed to refresh user:", e);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        role: user?.role || null,
        approvalStatus: user?.approval_status || null,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
