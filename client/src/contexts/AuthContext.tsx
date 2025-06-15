import { createContext, useContext, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { User } from '@shared/schema';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: any;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ['/api/auth/user'],
    staleTime: 10 * 60 * 1000, // 10 minutes - very long cache
    gcTime: 15 * 60 * 1000, // 15 minutes garbage collection
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: false,
  });

  const login = () => {
    window.location.href = '/api/login';
  };

  const logout = () => {
    window.location.href = '/api/logout';
  };

  const value: AuthContextValue = {
    user: user || null,
    isAuthenticated: !!user,
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