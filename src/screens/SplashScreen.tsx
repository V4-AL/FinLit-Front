import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated, ActivityIndicator } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export default function SplashScreen() {
  const { colors } = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View style={[styles.logoContainer, { backgroundColor: colors.accentLight, transform: [{ scale: pulseAnim }] }]}>
        <Text style={styles.logoText}>🪙</Text>
      </Animated.View>
      <Text style={[styles.appName, { color: colors.accentDark }]}>FinLit</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Duolingo for Personal Finance</Text>
      <ActivityIndicator size="small" color={colors.accent} style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logoContainer: {
    width: 100, height: 100, borderRadius: 50,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#10B981', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15, shadowRadius: 15, elevation: 4,
  },
  logoText: { fontSize: 50 },
  appName: { fontSize: 32, fontWeight: '800', marginTop: 24, letterSpacing: 0.5 },
  subtitle: { fontSize: 14, fontWeight: '500', marginTop: 8 },
  loader: { marginTop: 40 },
});