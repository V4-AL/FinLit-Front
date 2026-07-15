import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useProgress } from '../contexts/ProgressContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../navigation/AppNavigator';

type NavigationProp = BottomTabNavigationProp<MainTabParamList, 'Dashboard'>;

export default function DashboardScreen() {
  const { currentUser } = useAuth();
  const { xp, streak, level, levelProgress, completedLessons } = useProgress();
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Top Header Row */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greetingText, { color: colors.textSecondary }]}>Hello,</Text>
            <Text style={[styles.usernameText, { color: colors.text }]}>{currentUser?.username || 'Learner'} 👋</Text>
          </View>
          <View style={styles.statsBadges}>
            <View style={[styles.badgeStreak, { backgroundColor: colors.streakBadgeBg, borderColor: colors.streakBadgeBorder }]}>
              <Text style={styles.badgeEmoji}>🔥</Text>
              <Text style={[styles.badgeText, { color: colors.xpBadgeText }]}>{streak}</Text>
            </View>
            <View style={[styles.badgeXp, { backgroundColor: colors.xpBadgeBg, borderColor: colors.xpBadgeBorder }]}>
              <Text style={styles.badgeEmoji}>⭐</Text>
              <Text style={[styles.badgeText, { color: colors.xpBadgeText }]}>{xp} XP</Text>
            </View>
          </View>
        </View>

        {/* Level & Progress Card */}
        <View style={[styles.progressCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.progressHeader}>
            <Text style={[styles.levelTitle, { color: colors.text }]}>Level {level}</Text>
            <Text style={[styles.progressFraction, { color: colors.textSecondary }]}>{levelProgress} / 100 XP</Text>
          </View>
          <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
            <View style={[styles.progressBarFill, { width: `${Math.max(5, levelProgress)}%`, backgroundColor: colors.accent }]} />
          </View>
          <Text style={[styles.progressHint, { color: colors.textSecondary }]}>
            Earn {100 - levelProgress} more XP to reach Level {level + 1}!
          </Text>
        </View>

        {/* CTA */}
        <TouchableOpacity style={[styles.ctaCard, { backgroundColor: colors.accent }]} onPress={() => navigation.navigate('Modules')} activeOpacity={0.9}>
          <View style={styles.ctaTextContainer}>
            <Text style={styles.ctaTag}>RECOMMENDED</Text>
            <Text style={styles.ctaTitle}>Continue Learning</Text>
            <Text style={styles.ctaDescription}>Expand your financial knowledge by completing the next lesson in your learning path.</Text>
          </View>
          <View style={styles.ctaPlayBtn}>
            <Text style={styles.ctaPlayText}>▶️</Text>
          </View>
        </TouchableOpacity>

        {/* Quick Stats */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Achievements</Text>
        <View style={styles.statsGrid}>
          {[
            { emoji: '🎓', val: completedLessons.length, label: 'Lessons Done' },
            { emoji: '🏆', val: level, label: 'Current Level' },
            { emoji: '⚡', val: xp, label: 'Total XP' },
          ].map(stat => (
            <View key={stat.label} style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={styles.statEmoji}>{stat.emoji}</Text>
              <Text style={[styles.statVal, { color: colors.text }]}>{stat.val}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  greetingText: { fontSize: 16, fontWeight: '500' },
  usernameText: { fontSize: 24, fontWeight: '800', marginTop: 2 },
  statsBadges: { flexDirection: 'row' },
  badgeStreak: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 1 },
  badgeXp: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  badgeEmoji: { fontSize: 14, marginRight: 4 },
  badgeText: { fontSize: 13, fontWeight: '700' },
  progressCard: { borderRadius: 24, padding: 24, borderWidth: 1, marginBottom: 24 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  levelTitle: { fontSize: 18, fontWeight: '800' },
  progressFraction: { fontSize: 14, fontWeight: '600' },
  progressBarBg: { height: 12, borderRadius: 6, overflow: 'hidden', marginBottom: 12 },
  progressBarFill: { height: '100%', borderRadius: 6 },
  progressHint: { fontSize: 13, fontWeight: '500' },
  ctaCard: { borderRadius: 24, padding: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 },
  ctaTextContainer: { flex: 1, marginRight: 16 },
  ctaTag: { color: '#ECFDF5', fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  ctaTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '800', marginBottom: 8 },
  ctaDescription: { color: '#D1FAE5', fontSize: 13, lineHeight: 18, fontWeight: '500' },
  ctaPlayBtn: { width: 48, height: 48, backgroundColor: '#FFFFFF', borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  ctaPlayText: { fontSize: 18, marginLeft: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  statBox: { width: '31%', borderRadius: 20, paddingVertical: 16, paddingHorizontal: 8, alignItems: 'center', borderWidth: 1 },
  statEmoji: { fontSize: 24, marginBottom: 8 },
  statVal: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center', marginTop: 4 },
});
