import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Switch } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useProgress } from '../contexts/ProgressContext';

export default function SettingsScreen() {
  const { currentUser, logout } = useAuth();
  const { xp, level } = useProgress();

  const [soundEnabled, setSoundEnabled] = React.useState(true);
  const [remindersEnabled, setRemindersEnabled] = React.useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <View style={styles.content}>
        {/* Profile Info Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
          <View style={styles.profileDetails}>
            <Text style={styles.usernameText}>{currentUser?.username || 'Guest'}</Text>
            <Text style={styles.emailText}>{currentUser?.email || 'no-email@example.com'}</Text>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>Lvl {level} • {xp} XP</Text>
            </View>
          </View>
        </View>

        {/* Settings options list */}
        <Text style={styles.sectionTitle}>App Settings</Text>
        <View style={styles.optionsList}>
          <View style={styles.optionRow}>
            <Text style={styles.optionLabel}>🔊 Sound Effects</Text>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: '#D1D5DB', true: '#A7F3D0' }}
              thumbColor={soundEnabled ? '#10B981' : '#F3F4F6'}
            />
          </View>

          <View style={styles.separator} />

          <View style={styles.optionRow}>
            <Text style={styles.optionLabel}>🔔 Daily Reminders</Text>
            <Switch
              value={remindersEnabled}
              onValueChange={setRemindersEnabled}
              trackColor={{ false: '#D1D5DB', true: '#A7F3D0' }}
              thumbColor={remindersEnabled ? '#10B981' : '#F3F4F6'}
            />
          </View>
        </View>

        {/* Danger/Log Out Section */}
        <TouchableOpacity style={styles.logoutButton} onPress={logout} activeOpacity={0.8}>
          <Text style={styles.logoutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
  },
  content: {
    padding: 24,
    flex: 1,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 32,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarEmoji: {
    fontSize: 32,
  },
  profileDetails: {
    flex: 1,
  },
  usernameText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
  },
  emailText: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '500',
  },
  levelBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  levelText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    paddingLeft: 4,
  },
  optionsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    marginBottom: 40,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  logoutButton: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: '#DC2626',
    fontSize: 15,
    fontWeight: '700',
  },
});
