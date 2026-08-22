'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse } from '@/types';
import { mockCurrentUser } from '@/lib/mockData';
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
          // Try validating with live backend /api/auth/me
          try {
            const res = await api.get<{ user: User }>('/api/auth/me');
            if (res.data?.user) {
              setUser(res.data.user);
              localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
              return;
            }
          } catch {
            // If offline or live server unavailable, fallback to cached user or mock
          }

          if (storedUser) {
            setUser(JSON.parse(storedUser));
          } else {
            setUser(mockCurrentUser);
          }
        } else {
          // Default to mock user for mock-first rapid development
          const initialMockToken = 'mock-jwt-token-dev-c';
          localStorage.setItem(TOKEN_KEY, initialMockToken);
          localStorage.setItem(USER_KEY, JSON.stringify(mockCurrentUser));
          setToken(initialMockToken);
          setUser(mockCurrentUser);
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
      let authRes: AuthResponse;
      try {
        const res = await api.post<AuthResponse>('/api/auth/login', { email, password });
        authRes = res.data;
      } catch (err: any) {
        if (err.response?.status === 401 || err.response?.status === 400) {
          throw err;
        }
        // Fallback to mock login if backend is unreachable
        authRes = {
          token: `mock-token-${Date.now()}`,
          user: {
            ...mockCurrentUser,
            email,
          },
        };
      }

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
      let authRes: AuthResponse;
      try {
        const res = await api.post<AuthResponse>('/api/auth/register', data);
        authRes = res.data;
      } catch (err: any) {
        if (err.response?.status === 409 || err.response?.status === 400) {
          throw err;
        }
        // Fallback to mock registration
        authRes = {
          token: `mock-token-${Date.now()}`,
          user: {
            id: `user-${Date.now()}`,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone || null,
            city: data.city || null,
            country: data.country || null,
            photo: data.photo || null,
            role: 'TRAVELER',
            createdAt: new Date().toISOString(),
          },
        };
      }

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
