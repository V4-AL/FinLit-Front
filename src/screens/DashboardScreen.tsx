import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useProgress } from '../contexts/ProgressContext';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../navigation/AppNavigator';

type NavigationProp = BottomTabNavigationProp<MainTabParamList, 'Dashboard'>;

export default function DashboardScreen() {
  const { currentUser } = useAuth();
  const { xp, streak, level, levelProgress, completedLessons } = useProgress();
  const navigation = useNavigation<NavigationProp>();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Top Header Row */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greetingText}>Hello,</Text>
            <Text style={styles.usernameText}>{currentUser?.username || 'Learner'} 👋</Text>
          </View>
          <View style={styles.statsBadges}>
            <View style={styles.badgeStreak}>
              <Text style={styles.badgeEmoji}>🔥</Text>
              <Text style={styles.badgeText}>{streak}</Text>
            </View>
            <View style={styles.badgeXp}>
              <Text style={styles.badgeEmoji}>⭐</Text>
              <Text style={styles.badgeText}>{xp} XP</Text>
            </View>
          </View>
        </View>

        {/* Level & Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.levelTitle}>Level {level}</Text>
            <Text style={styles.progressFraction}>{levelProgress} / 100 XP</Text>
          </View>
          
          {/* Custom Progress Bar */}
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${Math.max(5, levelProgress)}%` }]} />
          </View>
          
          <Text style={styles.progressHint}>
            Earn {100 - levelProgress} more XP to reach Level {level + 1}!
          </Text>
        </View>

        {/* Primary CTA Card: Continue Learning */}
        <TouchableOpacity 
          style={styles.ctaCard} 
          onPress={() => navigation.navigate('Modules')}
          activeOpacity={0.9}
        >
          <View style={styles.ctaTextContainer}>
            <Text style={styles.ctaTag}>RECOMMENDED</Text>
            <Text style={styles.ctaTitle}>Continue Learning</Text>
            <Text style={styles.ctaDescription}>
              Expand your financial knowledge by completing the next lesson in your learning path.
            </Text>
          </View>
          <View style={styles.ctaPlayBtn}>
            <Text style={styles.ctaPlayText}>▶️</Text>
          </View>
        </TouchableOpacity>

        {/* Quick Stats Grid */}
        <Text style={styles.sectionTitle}>Your Achievements</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statEmoji}>🎓</Text>
            <Text style={styles.statVal}>{completedLessons.length}</Text>
            <Text style={styles.statLabel}>Lessons Done</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statEmoji}>🏆</Text>
            <Text style={styles.statVal}>{level}</Text>
            <Text style={styles.statLabel}>Current Level</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statEmoji}>⚡</Text>
            <Text style={styles.statVal}>{xp}</Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  greetingText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  usernameText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    marginTop: 2,
  },
  statsBadges: {
    flexDirection: 'row',
  },
  badgeStreak: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  badgeXp: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  badgeEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#065F46',
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
  },
  progressFraction: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  progressBarBg: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981', // Glowing Emerald Fill
    borderRadius: 6,
  },
  progressHint: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  ctaCard: {
    backgroundColor: '#10B981',
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  ctaTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  ctaTag: {
    color: '#ECFDF5',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  ctaTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  ctaDescription: {
    color: '#D1FAE5',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  ctaPlayBtn: {
    width: 48,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ctaPlayText: {
    fontSize: 18,
    marginLeft: 2, // Optical alignment
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    backgroundColor: '#FFFFFF',
    width: '31%',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  statVal: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
});
