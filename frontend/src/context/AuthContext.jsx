import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state by verifying token with backend
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          const freshUser = await authService.getMe();
          setUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));
        } catch (err) {
          console.error('Session expired or invalid:', err.message);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    const { user: authedUser, token: authToken } = data;
    
    setToken(authToken);
    setUser(authedUser);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(authedUser));

    return authedUser;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    const { user: registeredUser, token: authToken } = data;

    setToken(authToken);
    setUser(registeredUser);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(registeredUser));

    return registeredUser;
  };

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  }, []);

  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const getDashboardRouteForRole = (role) => {
    switch (role) {
      case 'ADMIN':
        return '/admin/dashboard';
      case 'STORE_OWNER':
        return '/owner/dashboard';
      case 'USER':
      default:
        return '/user/dashboard';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        register,
        logout,
        updateUser,
        getDashboardRouteForRole,
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
