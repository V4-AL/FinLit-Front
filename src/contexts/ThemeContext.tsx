import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = '@finlit_theme';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  accent: string;
  accentLight: string;
  accentDark: string;
  tabBar: string;
  inputBg: string;
  streakBadgeBg: string;
  streakBadgeBorder: string;
  xpBadgeBg: string;
  xpBadgeBorder: string;
  xpBadgeText: string;
  cardShadow: string;
  errorBg: string;
  errorBorder: string;
  errorText: string;
  successBg: string;
  successBorder: string;
  optionSelectedBg: string;
  optionSelectedBorder: string;
  switchTrackTrue: string;
  switchTrackFalse: string;
  logoutBg: string;
  logoutBorder: string;
  logoutText: string;
}

const lightColors: ThemeColors = {
  background: '#F9FAFB',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  text: '#1F2937',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  accent: '#10B981',
  accentLight: '#ECFDF5',
  accentDark: '#065F46',
  tabBar: '#FFFFFF',
  inputBg: '#F9FAFB',
  streakBadgeBg: '#FEF3C7',
  streakBadgeBorder: '#FDE68A',
  xpBadgeBg: '#ECFDF5',
  xpBadgeBorder: '#A7F3D0',
  xpBadgeText: '#065F46',
  cardShadow: '#000000',
  errorBg: '#FEF2F2',
  errorBorder: '#FCA5A5',
  errorText: '#DC2626',
  successBg: '#ECFDF5',
  successBorder: '#A7F3D0',
  optionSelectedBg: '#EFF6FF',
  optionSelectedBorder: '#3B82F6',
  switchTrackTrue: '#A7F3D0',
  switchTrackFalse: '#D1D5DB',
  logoutBg: '#FEE2E2',
  logoutBorder: '#FCA5A5',
  logoutText: '#DC2626',
};

const darkColors: ThemeColors = {
  background: '#0F172A',
  surface: '#1E293B',
  surfaceElevated: '#263349',
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  border: '#334155',
  accent: '#10B981',
  accentLight: '#064E3B',
  accentDark: '#6EE7B7',
  tabBar: '#1E293B',
  inputBg: '#0F172A',
  streakBadgeBg: '#451A03',
  streakBadgeBorder: '#92400E',
  xpBadgeBg: '#064E3B',
  xpBadgeBorder: '#065F46',
  xpBadgeText: '#6EE7B7',
  cardShadow: '#000000',
  errorBg: '#450A0A',
  errorBorder: '#7F1D1D',
  errorText: '#FCA5A5',
  successBg: '#064E3B',
  successBorder: '#065F46',
  optionSelectedBg: '#1E3A5F',
  optionSelectedBorder: '#3B82F6',
  switchTrackTrue: '#064E3B',
  switchTrackFalse: '#475569',
  logoutBg: '#450A0A',
  logoutBorder: '#7F1D1D',
  logoutText: '#FCA5A5',
};

interface ThemeContextType {
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then(val => {
      if (val === 'dark') setIsDark(true);
    });
  }, []);

  const toggleTheme = async () => {
    const next = !isDark;
    setIsDark(next);
    await AsyncStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ isDark, colors: isDark ? darkColors : lightColors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
