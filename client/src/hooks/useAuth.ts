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
}

export function useAuth() {
  const { data, isLoading, error } = useQuery<AuthData>({
    queryKey: ['/api/auth/profile'],
    retry: false,
  });

  const login = () => {
    window.location.href = '/login';
  };

  const logout = () => {
    window.location.href = '/logout';
  };

  return {
    user: data?.user || null,
    isAuthenticated: data?.isAuthenticated || false,
    isLoading,
    error,
    login,
    logout,
  };
}