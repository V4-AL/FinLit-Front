import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../contexts/AppContext';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

interface Slide {
  title: string;
  description: string;
  illustration: string;
}

const slides: Slide[] = [
  {
    title: 'Learn money skills\nthe smart way',
    description: 'Bite-sized, gamified lessons make learning finance easy and engaging. Perfect for everyday life.',
    illustration: '💡',
  },
  {
    title: 'Build habits with\ndaily streaks',
    description: 'Keep your streak alive by practicing a few minutes every day. Consistency is the key to wealth.',
    illustration: '🔥',
  },
  {
    title: 'Track progress &\nearn XP',
    description: 'Unlock modules, level up, and measure your financial literacy progress as you learn.',
    illustration: '📈',
  },
];

export default function OnboardingScreen() {
  const { completeOnboarding } = useApp();
  const { colors } = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      completeOnboarding();
    }
  };

  const activeSlide = slides[currentSlide];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={completeOnboarding} style={styles.skipButton}>
          <Text style={[styles.skipText, { color: colors.textMuted }]}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.slideContainer}>
        <Text style={styles.illustration}>{activeSlide.illustration}</Text>
        <Text style={[styles.title, { color: colors.text }]}>{activeSlide.title}</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>{activeSlide.description}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                { backgroundColor: colors.border },
                index === currentSlide ? { width: 24, backgroundColor: colors.accent } : null,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={[styles.button, { backgroundColor: colors.accent }]} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {currentSlide === slides.length - 1 ? 'Start Learning' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { height: 50, alignItems: 'flex-end', justifyContent: 'center', paddingHorizontal: 24 },
  skipButton: { padding: 8 },
  skipText: { fontSize: 14, fontWeight: '600' },
  slideContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  illustration: { fontSize: 100, marginBottom: 40, textAlign: 'center' },
  title: { fontSize: 28, fontWeight: '800', textAlign: 'center', lineHeight: 36, marginBottom: 16 },
  description: { fontSize: 15, textAlign: 'center', lineHeight: 22, paddingHorizontal: 10 },
  footer: { paddingHorizontal: 24, paddingBottom: 40, alignItems: 'center' },
  pagination: { flexDirection: 'row', marginBottom: 32 },
  dot: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 4 },
  button: { width: '100%', height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
