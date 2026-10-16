import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const DEFAULT_USER = {
  id: 1,
  username: 'alex.rivera',
  full_name: 'Alex Rivera',
  role: 'official'
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('methore_auth_user');
      return savedUser ? JSON.parse(savedUser) : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('methore_auth_token') || 'offline-station-token-alex-rivera';
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('methore_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('methore_auth_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('methore_auth_token', token);
    } else {
      localStorage.removeItem('methore_auth_token');
    }
  }, [token]);

  const login = async (username, password) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Authentication failed');
      }

      const data = await res.json();
      setUser(data.user);
      setToken(data.token);
      return data.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('methore_auth_user');
    localStorage.removeItem('methore_auth_token');
  };

  const switchDemoRole = (roleKey) => {
    const demoAccounts = {
      official: {
        id: 1,
        username: 'alex.rivera',
        full_name: 'Alex Rivera',
        role: 'official'
      },
      administrator: {
        id: 2,
        username: 'jordan.reyes',
        full_name: 'Jordan Reyes',
        role: 'administrator'
      },
      researcher: {
        id: 3,
        username: 'sam.taylor',
        full_name: 'Sam Taylor',
        role: 'researcher'
      }
    };

    const selected = demoAccounts[roleKey] || demoAccounts.official;
    setUser(selected);
    setToken(`demo-token-${selected.username}`);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, switchDemoRole, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
