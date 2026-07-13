import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService, UserProgress } from '../services/api';
import { useAuth } from './AuthContext';

interface ProgressContextType {
  xp: number;
  streak: number;
  completedLessons: number[];
  level: number;
  levelProgress: number; // 0 to 100 % progress to next level
  isLoading: boolean;
  completeLesson: (lessonId: number) => Promise<void>;
  refreshProgress: () => Promise<void>;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

const XP_KEY_PREFIX = '@finlit_xp_';
const STREAK_KEY_PREFIX = '@finlit_streak_';
const LAST_ACTIVE_KEY_PREFIX = '@finlit_last_active_';

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [xp, setXp] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Level calculation: 100 XP per level
  const level = Math.floor(xp / 100) + 1;
  const levelProgress = xp % 100; // XP inside the current level (0 to 99)

  const getStorageKeys = () => {
    const username = currentUser?.username || 'guest';
    return {
      xpKey: `${XP_KEY_PREFIX}${username}`,
      streakKey: `${STREAK_KEY_PREFIX}${username}`,
      lastActiveKey: `${LAST_ACTIVE_KEY_PREFIX}${username}`,
    };
  };

  const refreshProgress = async () => {
    if (!currentUser) {
      setXp(0);
      setStreak(0);
      setCompletedLessons([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const { xpKey, streakKey, lastActiveKey } = getStorageKeys();

    try {
      // 1. Fetch completed lessons from Spring Boot backend
      let backendProgress: UserProgress[] = [];
      try {
        backendProgress = await apiService.getProgress(currentUser.username);
      } catch (e) {
        console.warn('Could not load progress from backend, using local cache', e);
      }

      // Extract unique completed lesson IDs
      const completedIds = backendProgress
        .filter(p => p.completed)
        .map(p => p.lessonId);

      // 2. Load XP and Streak from local storage (authoritative for gamification local state)
      const localXp = await AsyncStorage.getItem(xpKey);
      const localStreak = await AsyncStorage.getItem(streakKey);
      const localLastActive = await AsyncStorage.getItem(lastActiveKey);

      // If backend has completed lessons but local XP doesn't reflect it, sync them
      // Each lesson completed is worth 10 XP
      const calculatedXpFromBackend = completedIds.length * 10;
      const initialXp = localXp ? parseInt(localXp, 10) : Math.max(0, calculatedXpFromBackend);
      
      // Calculate/Update Streak
      let currentStreak = localStreak ? parseInt(localStreak, 10) : 0;
      const todayStr = new Date().toDateString();

      if (localLastActive) {
        const lastActiveDate = new Date(localLastActive);
        const todayDate = new Date();
        
        // Remove times to compare dates
        lastActiveDate.setHours(0, 0, 0, 0);
        todayDate.setHours(0, 0, 0, 0);

        const diffTime = Math.abs(todayDate.getTime() - lastActiveDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          // Consecutive day!
          currentStreak += 1;
          await AsyncStorage.setItem(streakKey, currentStreak.toString());
          await AsyncStorage.setItem(lastActiveKey, new Date().toISOString());
        } else if (diffDays > 1) {
          // Streak broken
          currentStreak = 1;
          await AsyncStorage.setItem(streakKey, '1');
          await AsyncStorage.setItem(lastActiveKey, new Date().toISOString());
        }
        // If diffDays === 0, they already logged in today, keep the same streak
      } else {
        // First login ever
        currentStreak = 1;
        await AsyncStorage.setItem(streakKey, '1');
        await AsyncStorage.setItem(lastActiveKey, new Date().toISOString());
      }

      setXp(initialXp);
      setStreak(currentStreak);
      setCompletedLessons(completedIds);
      
      // Save initial local values if not already present
      if (!localXp) await AsyncStorage.setItem(xpKey, initialXp.toString());
      if (!localStreak) await AsyncStorage.setItem(streakKey, currentStreak.toString());
    } catch (error) {
      console.error('Failed to load progress', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshProgress();
  }, [currentUser]);

  const completeLesson = async (lessonId: number) => {
    if (!currentUser) return;

    // Check if already completed to prevent double XP awarding
    if (completedLessons.includes(lessonId)) {
      return;
    }

    const { xpKey } = getStorageKeys();
    const newXp = xp + 10;
    const newCompleted = [...completedLessons, lessonId];

    // Optimistically update local state
    setXp(newXp);
    setCompletedLessons(newCompleted);

    try {
      // 1. Sync with backend
      try {
        await apiService.saveProgress(currentUser.username, lessonId, true);
      } catch (backendError) {
        console.warn('Failed to sync progress with backend, saved locally', backendError);
      }

      // 2. Save in local storage
      await AsyncStorage.setItem(xpKey, newXp.toString());
    } catch (error) {
      console.error('Failed to save completed lesson progress', error);
    }
  };

  return (
    <ProgressContext.Provider
      value={{
        xp,
        streak,
        completedLessons,
        level,
        levelProgress,
        isLoading,
        completeLesson,
        refreshProgress,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};
