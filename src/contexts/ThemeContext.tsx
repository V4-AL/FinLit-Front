import React, { createContext, useContext, useState, useMemo } from 'react';

type ColorPalette = {
  background: string;
  surface: string;
  border: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentLight: string;
  accentDark: string;
  streakBadgeBg: string;
  streakBadgeBorder: string;
  xpBadgeBg: string;
  xpBadgeBorder: string;
  xpBadgeText: string;
  switchTrackFalse: string;
  switchTrackTrue: string;
  logoutBg: string;
  logoutBorder: string;
  logoutText: string;
  tabBar: string;
  inputBg: string;
  errorText: string;
  quizSelectBg: string;
  quizSelectBorder: string;
  quizSelectText: string;
};

const lightColors: ColorPalette = {
  background: '#F9FAFB',
  surface: '#FFFFFF',
  border: '#E5E7EB',
  text: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  accent: '#10B981',
  accentLight: '#D1FAE5',
  accentDark: '#047857',
  tabBar: '#FFFFFF',
  streakBadgeBg: '#FEF3C7',
  streakBadgeBorder: '#FDE68A',
  xpBadgeBg: '#ECFDF5',
  xpBadgeBorder: '#A7F3D0',
  xpBadgeText: '#047857',
  switchTrackFalse: '#E5E7EB',
  switchTrackTrue: '#A7F3D0',
  logoutBg: '#FEF2F2',
  logoutBorder: '#FECACA',
  logoutText: '#DC2626',
  inputBg: '#F9FAFB',
  errorText: '#DC2626',
  quizSelectBg: '#EFF6FF',
  quizSelectBorder: '#3B82F6',
  quizSelectText: '#1D4ED8',
};

const darkColors: ColorPalette = {
  background: '#0F172A',
  surface: '#1E293B',
  border: '#334155',
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  accent: '#10B981',
  accentLight: '#065F46',
  accentDark: '#6EE7B7',
  tabBar: '#1E293B',
  streakBadgeBg: '#3F2E0E',
  streakBadgeBorder: '#78350F',
  xpBadgeBg: '#064E3B',
  xpBadgeBorder: '#047857',
  xpBadgeText: '#6EE7B7',
  switchTrackFalse: '#334155',
  switchTrackTrue: '#065F46',
  logoutBg: '#3F1D1D',
  logoutBorder: '#7F1D1D',
  logoutText: '#F87171',
  inputBg: '#0F172A',
  errorText: '#F87171',
  quizSelectBg: '#1E3A5F',
  quizSelectBorder: '#3B82F6',
  quizSelectText: '#93C5FD',
};

type ThemeContextType = {
  colors: ColorPalette;
  isDark: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const toggleTheme = () => setIsDark(prev => !prev);
  const colors = useMemo(() => (isDark ? darkColors : lightColors), [isDark]);
  const value = useMemo(() => ({ colors, isDark, toggleTheme }), [colors, isDark]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}