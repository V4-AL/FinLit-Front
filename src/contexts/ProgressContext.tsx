import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { readJson, writeJson, STORAGE_KEYS } from '../services/storage';

type ProgressContextType = {
  xp: number;
  streak: number;
  level: number;
  levelProgress: number;
  completedLessons: number[];
  isLoading: boolean;
  addXp: (amount: number) => void;
  completeLesson: (lessonId: number) => Promise<void>;
};

type PersistedProgress = {
  xp: number;
  streak: number;
  completedLessons: number[];
  lastActivityDate: string | null; // YYYY-MM-DD
};

const XP_PER_LEVEL = 100;
const XP_PER_LESSON = 10;

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / msPerDay);
}

/** Given the last recorded activity day, returns the streak count for "today". */
function nextStreak(previousStreak: number, lastActivityDate: string | null, today: string): number {
  if (!lastActivityDate) return 1;
  const gap = daysBetween(lastActivityDate, today);
  if (gap === 0) return previousStreak; // already active today
  if (gap === 1) return previousStreak + 1; // consecutive day
  return 1; // missed one or more days — streak restarts
}

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const [lastActivityDate, setLastActivityDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const hydrate = async () => {
      const saved = await readJson<PersistedProgress>(STORAGE_KEYS.progress);
      if (saved) {
        setXp(saved.xp);
        setCompletedLessons(saved.completedLessons);
        setLastActivityDate(saved.lastActivityDate);
        // A day (or more) may have passed with no activity since the app last closed —
        // reflect that lapse immediately rather than waiting for the next lesson.
        const today = todayKey();
        setStreak(saved.lastActivityDate && daysBetween(saved.lastActivityDate, today) > 1 ? 0 : saved.streak);
      }
      setIsLoading(false);
    };
    hydrate();
  }, []);

  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const levelProgress = xp % XP_PER_LEVEL;

  const persist = (next: PersistedProgress) => {
    writeJson(STORAGE_KEYS.progress, next);
  };

  const addXp = (amount: number) => {
    setXp(prev => {
      const next = prev + amount;
      persist({ xp: next, streak, completedLessons, lastActivityDate });
      return next;
    });
  };

  const completeLesson = async (lessonId: number) => {
    const alreadyCompleted = completedLessons.includes(lessonId);
    const today = todayKey();
    const updatedStreak = nextStreak(streak, lastActivityDate, today);
    const updatedCompleted = alreadyCompleted ? completedLessons : [...completedLessons, lessonId];
    // Only first-time completion earns XP — replaying a lesson shouldn't farm infinite XP.
    const updatedXp = alreadyCompleted ? xp : xp + XP_PER_LESSON;

    setCompletedLessons(updatedCompleted);
    setStreak(updatedStreak);
    setLastActivityDate(today);
    setXp(updatedXp);
    persist({ xp: updatedXp, streak: updatedStreak, completedLessons: updatedCompleted, lastActivityDate: today });
    // TODO: also sync completion to the backend, e.g. apiService.saveProgress(username, lessonId, true)
  };

  const value = useMemo(
    () => ({ xp, streak, level, levelProgress, completedLessons, isLoading, addXp, completeLesson }),
    [xp, streak, level, levelProgress, completedLessons, isLoading]
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) throw new Error('useProgress must be used within a ProgressProvider');
  return context;
}
