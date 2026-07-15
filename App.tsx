import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './src/contexts/AppContext';
import { AuthProvider } from './src/contexts/AuthContext';
import { ProgressProvider } from './src/contexts/ProgressContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppProvider>
          <AuthProvider>
            <ProgressProvider>
              <AppNavigator />
            </ProgressProvider>
          </AuthProvider>
        </AppProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
