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
  updateAvatar: (uri: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
  setIsLoading(true);
  try {
    const response = await apiClient.post('/auth/login', { email, password });
    console.log('LOGIN RESPONSE:', JSON.stringify(response.data));
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

  const updateAvatar = async (uri: string) => {
    // TODO: replace with your real avatar-upload endpoint
    // const response = await apiClient.post('/user/avatar', { uri });
    setCurrentUser(prev => (prev ? { ...prev, avatarUri: uri } : prev));
  };

  const value = useMemo(
    () => ({ currentUser, isLoading, login, signup, logout, updateAvatar }),
    [currentUser, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}