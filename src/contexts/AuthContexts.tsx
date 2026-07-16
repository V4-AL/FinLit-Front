import React, { createContext, useContext, useState, useMemo } from 'react';
import { apiClient } from '../services/api';

type User = {
  id: string;
  username: string;
  email: string;
  avatarUri?: string | null;
};

type AuthContextType = {
  currentUser: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, username: string, password?: string) => Promise<void>;
  logout: () => void;
  updateUserAvatar: (uri: string) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      setCurrentUser(response.data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, username: string, password?: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/signup', { email, username, password });
      setCurrentUser(response.data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const updateUserAvatar = (uri: string) => {
    setCurrentUser(prev => (prev ? { ...prev, avatarUri: uri } : prev));
    // TODO: persist to backend, e.g. apiClient.post('/user/avatar', { uri })
  };

  const value = useMemo(
    () => ({ currentUser, isLoading, login, signup, logout, updateUserAvatar }),
    [currentUser, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}