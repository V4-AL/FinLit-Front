import React, { createContext, useContext, useState, useMemo } from 'react';
import { apiService, User } from '../services/api';

type AuthContextType = {
  currentUser: User | null;
  isLoading: boolean;
  login: (username: string, email: string) => Promise<void>;
  logout: () => void;
  updateUserAvatar: (avatarUri: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // No dedicated /auth endpoint exists in api.ts — this looks the user up by
  // username among all users, and creates a new one if not found.
  // Swap this out if/when a real auth endpoint gets added to the backend.
  const login = async (username: string, email: string) => {
    setIsLoading(true);
    try {
      const users = await apiService.getUsers();
      const existing = users.find(u => u.username === username);

      if (existing) {
        setCurrentUser(existing);
      } else {
        const newUser = await apiService.createUser(username, email);
        setCurrentUser(newUser);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const updateUserAvatar = async (avatarUri: string) => {
    if (!currentUser?.id) {
      // Not yet persisted to the backend (no id) — just update local state
      setCurrentUser(prev => (prev ? { ...prev, avatarUri } : prev));
      return;
    }

    const updated = await apiService.updateUser(currentUser.id, { avatarUri });
    setCurrentUser(updated);
  };

  const value = useMemo(
    () => ({ currentUser, isLoading, login, logout, updateUserAvatar }),
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