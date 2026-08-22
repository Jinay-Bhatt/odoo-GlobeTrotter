'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse } from '@/types';
import api from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    city?: string;
    country?: string;
    photo?: string;
  }) => Promise<AuthResponse>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'gt_token';
const USER_KEY = 'gt_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function initAuth() {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);

        if (storedToken) {
          setToken(storedToken);
          try {
            const res = await api.get<{ user: User }>('/api/auth/me');
            if (res.data?.user) {
              setUser(res.data.user);
              localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
              return;
            }
          } catch {
            if (storedUser) {
              setUser(JSON.parse(storedUser));
            }
          }
        }
      } catch {
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const res = await api.post<AuthResponse>('/api/auth/login', { email, password });
      const authRes = res.data;

      localStorage.setItem(TOKEN_KEY, authRes.token);
      localStorage.setItem(USER_KEY, JSON.stringify(authRes.user));
      setToken(authRes.token);
      setUser(authRes.user);
      return authRes;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    city?: string;
    country?: string;
    photo?: string;
  }): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const res = await api.post<AuthResponse>('/api/auth/register', data);
      const authRes = res.data;

      localStorage.setItem(TOKEN_KEY, authRes.token);
      localStorage.setItem(USER_KEY, JSON.stringify(authRes.user));
      setToken(authRes.token);
      setUser(authRes.user);
      return authRes;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  const updateUser = (updated: User) => {
    setUser(updated);
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
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
