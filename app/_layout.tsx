import 'react-native-gesture-handler';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import AppProviders from '../src/contexts/AppContext';
import { useApp } from '../src/contexts/AppContext';
import { useAuth } from '../src/contexts/AuthContext';
import { useProgress } from '../src/contexts/ProgressContext';
import SplashScreen from '../src/screens/SplashScreen';

function RootNavigator() {
  const { isFirstLaunch, isLoading: appLoading } = useApp();
  const { currentUser, isLoading: authLoading } = useAuth();
  const { isLoading: progressLoading } = useProgress();

  if (appLoading || authLoading || progressLoading) {
    return <SplashScreen />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isFirstLaunch}>
        <Stack.Screen name="onboarding" />
      </Stack.Protected>
      <Stack.Protected guard={!isFirstLaunch && !currentUser}>
        <Stack.Screen name="auth" />
      </Stack.Protected>
      <Stack.Protected guard={!isFirstLaunch && !!currentUser}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="lesson/[lessonId]" options={{ gestureEnabled: false }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProviders>
          <StatusBar style="auto" />
          <RootNavigator />
        </AppProviders>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
