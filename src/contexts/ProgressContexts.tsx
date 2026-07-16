import React, { createContext, useContext, useState, useMemo } from 'react';

type ProgressContextType = {
    xp: number;
    streak: number;
    level: number;
    levelProgress: number; // 0–100, XP progress toward next level
    completedLessons: string[];
    addXp: (amount: number) => void;
    markLessonComplete: (lessonId: string) => void;
    incrementStreak: () => void;
    resetStreak: () => void;
};

const XP_PER_LEVEL = 100;

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
    const [xp, setXp] = useState(0);
    const [streak, setStreak] = useState(0);
    const [completedLessons, setCompletedLessons] = useState<string[]>([]);

    const level = Math.floor(xp / XP_PER_LEVEL) + 1;
    const levelProgress = xp % XP_PER_LEVEL;

    const addXp = (amount: number) => {
    setXp(prev => prev + amount);
    // TODO: sync with backend, e.g. api.post('/progress/xp', { amount })
};

const markLessonComplete = (lessonId: string) => {
    setCompletedLessons(prev =>
    prev.includes(lessonId) ? prev : [...prev, lessonId]
    );
    // TODO: persist to backend
};

const incrementStreak = () => setStreak(prev => prev + 1);
const resetStreak = () => setStreak(0);

const value = useMemo(
    () => ({
    xp,
    streak,
    level,
    levelProgress,
    completedLessons,
    addXp,
    markLessonComplete,
    incrementStreak,
    resetStreak,
    }),
    [xp, streak, level, levelProgress, completedLessons]
);

return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
    const context = useContext(ProgressContext);
    if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
    }
    return context;
}