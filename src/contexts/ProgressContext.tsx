import React, { createContext, useContext, useState, useMemo } from 'react';

type ProgressContextType = {
  xp: number;
  streak: number;
  level: number;
  levelProgress: number;
  completedLessons: number[];
  addXp: (amount: number) => void;
  completeLesson: (lessonId: number) => Promise<void>;
  incrementStreak: () => void;
  resetStreak: () => void;
};

const XP_PER_LEVEL = 100;
const XP_PER_LESSON = 10;

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);

  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const levelProgress = xp % XP_PER_LEVEL;

  const addXp = (amount: number) => {
    setXp(prev => prev + amount);
  };

  const completeLesson = async (lessonId: number) => {
    setCompletedLessons(prev => (prev.includes(lessonId) ? prev : [...prev, lessonId]));
    addXp(XP_PER_LESSON);
    // TODO: persist to backend, e.g. await apiClient.post('/progress/complete', { lessonId })
  };

  const incrementStreak = () => setStreak(prev => prev + 1);
  const resetStreak = () => setStreak(0);

  const value = useMemo(
    () => ({ xp, streak, level, levelProgress, completedLessons, addXp, completeLesson, incrementStreak, resetStreak }),
    [xp, streak, level, levelProgress, completedLessons]
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) throw new Error('useProgress must be used within a ProgressProvider');
  return context;
}