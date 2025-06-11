import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';

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
  const [authData, setAuthData] = useState<AuthData>({
    isAuthenticated: false,
    user: null,
    userId: undefined
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAuthData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/auth/profile');
        if (response.ok) {
          const data = await response.json();
          setAuthData(data);
        } else {
          setAuthData({ isAuthenticated: false, user: null });
        }
      } catch (err) {
        console.error('Auth fetch error:', err);
        setError(err);
        setAuthData({ isAuthenticated: false, user: null });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuthData();
  }, []);

  const login = () => {
    window.location.href = '/login';
  };

  const logout = () => {
    window.location.href = '/logout';
  };

  const value: AuthContextValue = {
    ...authData,
    isLoading,
    error,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}