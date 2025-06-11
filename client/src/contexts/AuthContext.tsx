import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';

interface User {
  sid: string;
  given_name: string;
  family_name: string;
  nickname: string;
  name: string;
  picture: string;
  updated_at: string;
  email: string;
  email_verified: boolean;
  sub: string;
}

interface AuthData {
  isAuthenticated: boolean;
  user: User | null;
  userId?: number;
}

interface AuthContextValue extends AuthData {
  isLoading: boolean;
  error: any;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, isLoading, error } = useQuery<AuthData>({
    queryKey: ['/api/auth/profile'],
    staleTime: 10 * 60 * 1000, // 10 minutes - very long cache
    gcTime: 15 * 60 * 1000, // 15 minutes garbage collection
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const login = () => {
    window.location.href = '/login';
  };

  const logout = () => {
    window.location.href = '/logout';
  };

  const value: AuthContextValue = {
    user: data?.user || null,
    isAuthenticated: data?.isAuthenticated || false,
    userId: data?.userId,
    isLoading,
    error,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}