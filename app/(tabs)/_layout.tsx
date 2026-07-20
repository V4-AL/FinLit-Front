import React from 'react';
import { View, Text, ColorValue } from 'react-native';
import { Tabs } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';

const TabIcon = ({ name, color, size }: { name: string; color: ColorValue; size: number }) => {
  let emoji = '🏠';
  if (name === 'modules') emoji = '📚';
  if (name === 'settings') emoji = '⚙️';
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: size * 0.8, color }} accessible={false}>{emoji}</Text>
    </View>
  );
};

export default function TabsLayout() {
  const { colors } = useTheme();
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => <TabIcon name={route.name} color={color} size={size} />,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 0,
          shadowOpacity: 0,
          height: 56,
          paddingBottom: 8,
          paddingTop: 6,
          backgroundColor: colors.tabBar,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="modules" options={{ title: 'Modules' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
