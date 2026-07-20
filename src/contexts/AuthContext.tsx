import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../services/firebase';
import { apiService, type User } from '../services/api';
import { readJson, writeJson, removeItem, STORAGE_KEYS } from '../services/storage';

type AuthContextType = {
  currentUser: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, username: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateAvatar: (uri: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Firebase restores the persisted session (see services/firebase.ts) and fires this once
    // that's resolved, so it doubles as our app-boot hydration.
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setCurrentUser(null);
        await removeItem(STORAGE_KEYS.currentUser);
        setIsLoading(false);
        return;
      }
      try {
        const user = await apiService.syncUser();
        setCurrentUser(user);
        await writeJson(STORAGE_KEYS.currentUser, user);
      } catch {
        // Backend unreachable — fall back to the last synced profile rather than booting the user.
        const cached = await readJson<User>(STORAGE_KEYS.currentUser);
        setCurrentUser(cached);
      } finally {
        setIsLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      const user = await apiService.syncUser();
      setCurrentUser(user);
      await writeJson(STORAGE_KEYS.currentUser, user);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, username: string, password?: string) => {
    setIsLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password ?? '');
      await updateProfile(credential.user, { displayName: username });
      const user = await apiService.syncUser(username);
      setCurrentUser(user);
      await writeJson(STORAGE_KEYS.currentUser, user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    await removeItem(STORAGE_KEYS.currentUser);
  };

  const updateAvatar = async (uri: string) => {
    // TODO: replace with your real avatar-upload endpoint
    // const response = await apiClient.post('/user/avatar', { uri });
    setCurrentUser(prev => {
      const next = prev ? { ...prev, avatarUri: uri } : prev;
      if (next) writeJson(STORAGE_KEYS.currentUser, next);
      return next;
    });
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
