import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { api, setMemoryAccessToken } from '../api/axiosInstance';

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<any>;
  verify2FA: (tempToken: string, token: string) => Promise<any>;
  register: (data: any) => Promise<User>;
  logout: () => Promise<void>;
  hasRole: (...roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data } = await api.post('/auth/refresh');
        if (data.accessToken && data.user) {
          setAccessToken(data.accessToken);
          setMemoryAccessToken(data.accessToken);
          setUser(data.user);
        }
      } catch (err) {
        setAccessToken(null);
        setMemoryAccessToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<any> => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.requires2FA) {
      return data;
    }
    setAccessToken(data.accessToken);
    setMemoryAccessToken(data.accessToken);
    setUser(data.user);
    return data;
  };

  const verify2FA = async (tempToken: string, token: string): Promise<any> => {
    const { data } = await api.post('/auth/login/verify-2fa', { tempToken, token });
    setAccessToken(data.accessToken);
    setMemoryAccessToken(data.accessToken);
    setUser(data.user);
    return data;
  };

  const register = async (userData: any): Promise<User> => {
    const { data } = await api.post('/auth/register', userData);
    return data.data;
  };

  const logout = async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore network logout errors
    } finally {
      setAccessToken(null);
      setMemoryAccessToken(null);
      setUser(null);
    }
  };

  const hasRole = (...roles: Role[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        login,
        verify2FA,
        register,
        logout,
        hasRole,
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
