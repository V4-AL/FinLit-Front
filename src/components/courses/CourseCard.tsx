import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

// ─── Types ────────────────────────────────────────────────────────────────────

export type CardAccent = 'accent' | 'success' | 'warning';

type Props = {
  title: string;
  category: string;
  /** Emoji used as the card's visual icon (displayed in the coloured header panel) */
  icon: string;
  progressPercent: number;   // 0-100
  lessonCount: number;
  completedCount: number;
  accent?: CardAccent;
  onPress: () => void;
};

// ─── Accent helpers ───────────────────────────────────────────────────────────

function useAccentColors(accent: CardAccent) {
  const { colors } = useTheme();
  switch (accent) {
    case 'success':
      return {
        headerBg: colors.successLight,
        iconColor: colors.success,
        tagColor: colors.success,
        fillColor: colors.success,
      };
    case 'warning':
      return {
        headerBg: colors.warningLight,
        iconColor: colors.warning,
        tagColor: colors.warning,
        fillColor: colors.warning,
      };
    case 'accent':
    default:
      return {
        headerBg: colors.accentLight,
        iconColor: colors.accent,
        tagColor: colors.accent,
        fillColor: colors.accent,
      };
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CourseCard({
  title,
  category,
  icon,
  progressPercent,
  lessonCount,
  completedCount,
  accent = 'accent',
  onPress,
}: Props) {
  const { colors } = useTheme();
  const ac = useAccentColors(accent);

  const pct = Math.min(100, Math.max(0, progressPercent));
  const metaText = `${completedCount}/${lessonCount} lessons`;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${category}, ${Math.round(pct)}% complete`}
    >
      {/* Coloured thumbnail panel */}
      <View style={[styles.header, { backgroundColor: ac.headerBg }]}>
        <Text style={[styles.icon, { color: ac.iconColor }]} accessible={false}>
          {icon}
        </Text>
      </View>

      {/* Text body */}
      <View style={styles.body}>
        <Text style={[styles.category, { color: ac.tagColor }]} numberOfLines={1}>
          {category.toUpperCase()}
        </Text>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {title}
        </Text>

        {/* Progress track */}
        <View style={[styles.track, { backgroundColor: colors.surfaceAlt }]}>
          <View
            style={[styles.fill, { width: `${pct}%` as `${number}%`, backgroundColor: ac.fillColor }]}
          />
        </View>

        <Text style={[styles.meta, { color: colors.textMuted }]}>
          {pct > 0 ? `${Math.round(pct)}% complete` : metaText}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    width: 200,
    borderRadius: 12,
    borderWidth: 0.5,
    overflow: 'hidden',
  },
  header: {
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 30,
  },
  body: {
    padding: 10,
  },
  category: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    marginBottom: 10,
  },
  track: {
    height: 4,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  meta: {
    fontSize: 11,
  },
});
