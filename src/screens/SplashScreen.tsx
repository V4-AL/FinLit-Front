import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated, Image, ActivityIndicator } from 'react-native';

export default function SplashScreen() {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, { transform: [{ scale: pulseAnim }] }]}>
        <Image
          source={require('../../assets/splash_screen.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </Animated.View>
      <Text style={styles.appName}>FinLit</Text>
      <Text style={styles.subtitle}>Duolingo for Personal Finance</Text>
      <ActivityIndicator size="small" color="#10B981" style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 4,
  },
  logoImage: {
    width: 60,
    height: 60,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#065F46',
    marginTop: 24,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 8,
  },
  loader: {
    marginTop: 40,
  },
});