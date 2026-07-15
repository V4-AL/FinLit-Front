import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useProgress } from '../contexts/ProgressContext';
import { useTheme } from '../contexts/ThemeContext';

export default function SettingsScreen() {
  const { currentUser, logout } = useAuth();
  const { xp, level } = useProgress();
  const { colors, isDark, toggleTheme } = useTheme();

  const [soundEnabled, setSoundEnabled] = React.useState(true);
  const [remindersEnabled, setRemindersEnabled] = React.useState(true);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
      </View>

      <View style={styles.content}>
        {/* Profile Info Card */}
        <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.avatarCircle, { backgroundColor: colors.accentLight }]}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
          <View style={styles.profileDetails}>
            <Text style={[styles.usernameText, { color: colors.text }]}>{currentUser?.username || 'Guest'}</Text>
            <Text style={[styles.emailText, { color: colors.textSecondary }]}>{currentUser?.email || 'no-email@example.com'}</Text>
            <View style={[styles.levelBadge, { backgroundColor: colors.streakBadgeBg, borderColor: colors.streakBadgeBorder }]}>
              <Text style={[styles.levelText, { color: colors.xpBadgeText }]}>Lvl {level} • {xp} XP</Text>
            </View>
          </View>
        </View>

        {/* Appearance Section */}
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Appearance</Text>
        <View style={[styles.optionsList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Dark Mode Toggle — main feature */}
          <View style={styles.optionRow}>
            <View style={styles.optionLabelGroup}>
              <Text style={styles.optionEmoji}>{isDark ? '🌙' : '☀️'}</Text>
              <Text style={[styles.optionLabel, { color: colors.text }]}>{isDark ? 'Dark Mode' : 'Light Mode'}</Text>
            </View>
            <TouchableOpacity
              style={[styles.themeToggleBtn, { backgroundColor: isDark ? colors.accent : colors.border }]}
              onPress={toggleTheme}
              activeOpacity={0.8}
            >
              <View style={[styles.themeToggleThumb, { transform: [{ translateX: isDark ? 22 : 2 }] }]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* App Preferences Section */}
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Preferences</Text>
        <View style={[styles.optionsList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.optionRow}>
            <View style={styles.optionLabelGroup}>
              <Text style={styles.optionEmoji}>🔊</Text>
              <Text style={[styles.optionLabel, { color: colors.text }]}>Sound Effects</Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: colors.switchTrackFalse, true: colors.switchTrackTrue }}
              thumbColor={soundEnabled ? colors.accent : '#F3F4F6'}
            />
          </View>

          <View style={[styles.separator, { backgroundColor: colors.border }]} />

          <View style={styles.optionRow}>
            <View style={styles.optionLabelGroup}>
              <Text style={styles.optionEmoji}>🔔</Text>
              <Text style={[styles.optionLabel, { color: colors.text }]}>Daily Reminders</Text>
            </View>
            <Switch
              value={remindersEnabled}
              onValueChange={setRemindersEnabled}
              trackColor={{ false: colors.switchTrackFalse, true: colors.switchTrackTrue }}
              thumbColor={remindersEnabled ? colors.accent : '#F3F4F6'}
            />
          </View>
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.logoutBg, borderColor: colors.logoutBorder }]}
          onPress={logout}
          activeOpacity={0.8}
        >
          <Text style={[styles.logoutButtonText, { color: colors.logoutText }]}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 24, fontWeight: '800' },
  content: { padding: 24, flex: 1 },
  profileCard: {
    borderRadius: 24, padding: 20,
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, marginBottom: 32,
  },
  avatarCircle: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center', marginRight: 16,
  },
  avatarEmoji: { fontSize: 32 },
  profileDetails: { flex: 1 },
  usernameText: { fontSize: 18, fontWeight: '800' },
  emailText: { fontSize: 13, marginTop: 2, fontWeight: '500' },
  levelBadge: {
    alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 12, marginTop: 8, borderWidth: 1,
  },
  levelText: { fontSize: 11, fontWeight: '700' },
  sectionTitle: {
    fontSize: 12, fontWeight: '800', textTransform: 'uppercase',
    letterSpacing: 1, marginBottom: 10, paddingLeft: 4,
  },
  optionsList: {
    borderRadius: 20, borderWidth: 1,
    paddingHorizontal: 16, marginBottom: 24,
  },
  optionRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 16,
  },
  optionLabelGroup: { flexDirection: 'row', alignItems: 'center' },
  optionEmoji: { fontSize: 18, marginRight: 10 },
  optionLabel: { fontSize: 15, fontWeight: '600' },
  separator: { height: 1 },
  // Custom animated-style toggle for dark mode
  themeToggleBtn: {
    width: 48, height: 26, borderRadius: 13,
    justifyContent: 'center',
  },
  themeToggleThumb: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2, shadowRadius: 2, elevation: 2,
  },
  logoutButton: {
    borderWidth: 1.5, height: 52,
    borderRadius: 16, alignItems: 'center', justifyContent: 'center',
  },
  logoutButtonText: { fontSize: 15, fontWeight: '700' },
});