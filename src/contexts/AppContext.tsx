import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider } from './ThemeContext';
import { AuthProvider } from './AuthContext';
import { ProgressProvider } from './ProgressContext';

// --- App-level state: first launch + app-wide loading ---
type AppContextType = {
  isFirstLaunch: boolean;
  isLoading: boolean;
  completeOnboarding: () => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: replace with real check, e.g. AsyncStorage.getItem('hasOnboarded')
    const bootstrap = async () => {
      setIsLoading(false);
    };
    bootstrap();
  }, []);

  const completeOnboarding = () => {
    setIsFirstLaunch(false);
    // TODO: persist, e.g. AsyncStorage.setItem('hasOnboarded', 'true')
  };

  const value = useMemo(
    () => ({ isFirstLaunch, isLoading, completeOnboarding }),
    [isFirstLaunch, isLoading]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProviders tree');
  }
  return context;
}

// --- Combined provider tree ---
type AppProvidersProps = {
  children: React.ReactNode;
};

export default function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <AppStateProvider>
        <AuthProvider>
          <ProgressProvider>
            {children}
          </ProgressProvider>
        </AuthProvider>
      </AppStateProvider>
    </ThemeProvider>
  );
}

export { useTheme } from './ThemeContext';
export { useAuth } from './AuthContext';
export { useProgress } from './ProgressContext';