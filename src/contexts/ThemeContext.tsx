import React, { createContext, useContext, useState, useMemo } from 'react';

type ColorPalette = {
  // ── Canvas ────────────────────────────────────────────────────────────────
  background: string;
  surface: string;
  surfaceAlt: string;   // slightly dimmer surface — nested cards, hover states
  border: string;

  // ── Text ─────────────────────────────────────────────────────────────────
  text: string;
  textSecondary: string;
  textMuted: string;

  // ── Brand (blue) ─────────────────────────────────────────────────────────
  accent: string;
  accentLight: string;
  accentDark: string;

  // ── Semantic ──────────────────────────────────────────────────────────────
  success: string;        // completed states, green
  successLight: string;   // completion badge background
  warning: string;        // in-progress / amber
  warningLight: string;   // warning badge background

  // ── Error ─────────────────────────────────────────────────────────────────
  errorText: string;
  logoutBg: string;
  logoutBorder: string;
  logoutText: string;

  // ── Controls ──────────────────────────────────────────────────────────────
  tabBar: string;
  inputBg: string;
  switchTrackFalse: string;
  switchTrackTrue: string;

  // ── Quiz ──────────────────────────────────────────────────────────────────
  quizSelectBg: string;
  quizSelectBorder: string;
  quizSelectText: string;

  // ── Legacy backward-compat tokens ─────────────────────────────────────────
  // These keep existing screens (SettingsScreen, LessonScreen, etc.) working
  // without changes while the visual redesign rolls out screen-by-screen.
  streakBadgeBg: string;
  streakBadgeBorder: string;
  xpBadgeBg: string;
  xpBadgeBorder: string;
  xpBadgeText: string;
};

// ─── Light ────────────────────────────────────────────────────────────────────

const lightColors: ColorPalette = {
  // Canvas
  background:   '#F7F9FA',
  surface:      '#FFFFFF',
  surfaceAlt:   '#F0F4F8',
  border:       '#DDE1E7',

  // Text
  text:            '#1C1D1F',
  textSecondary:   '#5A5F73',
  textMuted:       '#9DA3AF',

  // Brand — confident blue (Coursera-range)
  accent:      '#0056D2',
  accentLight: '#E8F1FF',
  accentDark:  '#003DA5',

  // Semantic
  success:      '#1A7F37',
  successLight: '#DAFBE1',
  warning:      '#9A6700',
  warningLight: '#FFF8C5',

  // Error / destructive
  errorText:    '#CF222E',
  logoutBg:     '#FFEBE9',
  logoutBorder: '#FFCECB',
  logoutText:   '#CF222E',

  // Controls
  tabBar:           '#FFFFFF',
  inputBg:          '#F7F9FA',
  switchTrackFalse: '#DDE1E7',
  switchTrackTrue:  '#93C5FD',

  // Quiz
  quizSelectBg:     '#E8F1FF',
  quizSelectBorder: '#0056D2',
  quizSelectText:   '#003DA5',

  // Legacy / backward-compat
  streakBadgeBg:    '#FFF8C5',
  streakBadgeBorder:'#FDE68A',
  xpBadgeBg:        '#E8F1FF',
  xpBadgeBorder:    '#93C5FD',
  xpBadgeText:      '#003DA5',
};

// ─── Dark ─────────────────────────────────────────────────────────────────────

const darkColors: ColorPalette = {
  // Canvas
  background:   '#0D1117',
  surface:      '#161B22',
  surfaceAlt:   '#1C2128',
  border:       '#30363D',

  // Text
  text:            '#E6EDF3',
  textSecondary:   '#8B949E',
  textMuted:       '#6E7681',

  // Brand
  accent:      '#2F81F7',
  accentLight: '#1A2D4F',
  accentDark:  '#58A6FF',

  // Semantic
  success:      '#3FB950',
  successLight: '#0A3320',
  warning:      '#D29922',
  warningLight: '#2D2000',

  // Error / destructive
  errorText:    '#F85149',
  logoutBg:     '#3D0000',
  logoutBorder: '#7F1D1D',
  logoutText:   '#F85149',

  // Controls
  tabBar:           '#161B22',
  inputBg:          '#0D1117',
  switchTrackFalse: '#30363D',
  switchTrackTrue:  '#1A2D4F',

  // Quiz
  quizSelectBg:     '#1A2D4F',
  quizSelectBorder: '#2F81F7',
  quizSelectText:   '#58A6FF',

  // Legacy / backward-compat
  streakBadgeBg:    '#2D2000',
  streakBadgeBorder:'#78350F',
  xpBadgeBg:        '#1A2D4F',
  xpBadgeBorder:    '#2F81F7',
  xpBadgeText:      '#58A6FF',
};

// ─── Context ──────────────────────────────────────────────────────────────────

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