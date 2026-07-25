import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiService, LeaderboardEntry } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

// ─── Medal helpers ────────────────────────────────────────────────────────────

function rankEmoji(rank: number): string {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
}

function rankBg(rank: number, isMe: boolean, colors: ReturnType<typeof useTheme>['colors']): object {
  if (isMe) return { backgroundColor: colors.accentLight, borderColor: colors.accent, borderWidth: 2 };
  if (rank <= 3) return { backgroundColor: colors.xpBadgeBg, borderColor: colors.xpBadgeBorder, borderWidth: 1 };
  return { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 };
}

// ─── Row Component ────────────────────────────────────────────────────────────

function LeaderboardRow({
  entry,
  rank,
  isMe,
  colors,
}: {
  entry: LeaderboardEntry;
  rank: number;
  isMe: boolean;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  const isTop3 = rank <= 3;
  const rankLabel = rankEmoji(rank);

  return (
    <View
      style={[styles.row, rankBg(rank, isMe, colors)]}
      accessibilityLabel={`Rank ${rank}: ${entry.username}, ${entry.totalPoints} points${isMe ? ', this is you' : ''}`}
    >
      {/* Rank */}
      <View style={styles.rankCell}>
        {isTop3 ? (
          <Text style={styles.medalEmoji} accessible={false}>{rankLabel}</Text>
        ) : (
          <Text style={[styles.rankNumber, { color: colors.textMuted }]}>{rankLabel}</Text>
        )}
      </View>

      {/* Avatar + name */}
      <View style={[styles.avatarCircle, { backgroundColor: isMe ? colors.accent : colors.border }]}>
        <Text style={[styles.avatarInitial, { color: isMe ? '#FFFFFF' : colors.textMuted }]}>
          {entry.username.charAt(0).toUpperCase()}
        </Text>
      </View>

      <View style={styles.nameCell}>
        <Text style={[styles.username, { color: isMe ? colors.accentDark : colors.text }]}>
          {entry.username}{isMe ? ' (You)' : ''}
        </Text>
        {entry.badges && entry.badges.length > 0 && (
          <Text style={styles.badgeRow} accessible={false}>
            {entry.badges.slice(0, 3).join(' ')}
          </Text>
        )}
      </View>

      {/* Points */}
      <View style={[styles.pointsPill, { backgroundColor: isMe ? colors.accent : colors.xpBadgeBg, borderColor: isMe ? colors.accent : colors.xpBadgeBorder }]}>
        <Text style={[styles.pointsText, { color: isMe ? '#FFFFFF' : colors.xpBadgeText }]}>
          {entry.totalPoints.toLocaleString()} pts
        </Text>
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function LeaderboardScreen() {
  const { currentUser } = useAuth();
  const { colors } = useTheme();

  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const myRank = entries.findIndex(e => e.username === currentUser?.username) + 1;

  const fetchLeaderboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const data = await apiService.getLeaderboard();
      setEntries(data ?? []);
    } catch {
      setError('Could not load the leaderboard. Check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // ── Loading ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Leaderboard 🏆</Text>
        </View>
        <View style={styles.center}>
          <Text style={styles.errorEmoji} accessible={false}>😕</Text>
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: colors.accent }]}
            onPress={() => fetchLeaderboard()}
            accessibilityRole="button"
            accessibilityLabel="Retry loading leaderboard"
          >
            <Text style={styles.retryBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Main ─────────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Leaderboard 🏆</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          Top financial learners this season
        </Text>
      </View>

      {/* My rank banner (if in top 20, show inline; otherwise show sticky) */}
      {myRank > 0 && (
        <View style={[styles.myRankBanner, { backgroundColor: colors.xpBadgeBg, borderColor: colors.xpBadgeBorder }]}>
          <Text style={styles.myRankEmoji} accessible={false}>📍</Text>
          <Text style={[styles.myRankText, { color: colors.accentDark }]}>
            Your rank: <Text style={{ fontWeight: '800' }}>#{myRank}</Text>
          </Text>
        </View>
      )}

      <FlatList
        data={entries}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchLeaderboard(true)}
            tintColor={colors.accent}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji} accessible={false}>🌱</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No learners ranked yet. Complete a lesson to claim the top spot!
            </Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <LeaderboardRow
            entry={item}
            rank={index + 1}
            isMe={item.username === currentUser?.username}
            colors={colors}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },

  // Header
  header: {
    paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 24, fontWeight: '800' },
  headerSubtitle: { fontSize: 14, fontWeight: '500', marginTop: 4 },

  // My rank banner
  myRankBanner: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 24, marginTop: 16,
    borderWidth: 1, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14,
  },
  myRankEmoji: { fontSize: 14, marginRight: 8 },
  myRankText: { fontSize: 14, fontWeight: '600' },

  // List
  list: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 48 },

  // Row
  row: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 16, paddingVertical: 14, paddingHorizontal: 16,
  },
  rankCell: { width: 36, alignItems: 'center', marginRight: 12 },
  medalEmoji: { fontSize: 22 },
  rankNumber: { fontSize: 14, fontWeight: '800' },
  avatarCircle: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  avatarInitial: { fontSize: 16, fontWeight: '800' },
  nameCell: { flex: 1 },
  username: { fontSize: 15, fontWeight: '700' },
  badgeRow: { fontSize: 13, marginTop: 2 },
  pointsPill: {
    borderWidth: 1, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  pointsText: { fontSize: 12, fontWeight: '800' },

  // Error
  errorEmoji: { fontSize: 48, marginBottom: 16 },
  errorText: { fontSize: 14, fontWeight: '500', textAlign: 'center', marginBottom: 24 },
  retryBtn: { height: 48, paddingHorizontal: 32, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  retryBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

  // Empty
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 14, fontWeight: '500', textAlign: 'center', lineHeight: 20 },
});
