import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { useProgress } from '../contexts/ProgressContext';
import { useTheme } from '../contexts/ThemeContext';
import { apiService, Module, Lesson } from '../services/api';
import CourseCard, { CardAccent } from '../components/courses/CourseCard';
import SkeletonLoader from '../components/common/SkeletonLoader';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// Maps module index → card accent colour so the carousel isn't monotone
const ACCENT_CYCLE: CardAccent[] = ['accent', 'success', 'warning', 'accent', 'success'];

// Category metadata for the browse grid
const CATEGORIES = [
  { emoji: '💰', label: 'Budgeting' },
  { emoji: '📈', label: 'Investing' },
  { emoji: '🏦', label: 'Saving' },
  { emoji: '💳', label: 'Credit' },
  { emoji: '🧾', label: 'Taxes' },
  { emoji: '📊', label: 'Planning' },
];

// Rough icon per module (falls back to 📚 if nothing matches)
function moduleIcon(title: string): string {
  const t = title.toLowerCase();
  if (t.includes('budget')) return '💰';
  if (t.includes('invest') || t.includes('compound') || t.includes('interest')) return '📈';
  if (t.includes('sav') || t.includes('emergency')) return '🏦';
  if (t.includes('credit') || t.includes('debt')) return '💳';
  if (t.includes('tax')) return '🧾';
  if (t.includes('insur')) return '🛡️';
  if (t.includes('retire')) return '🏖️';
  return '📚';
}

function moduleCategory(title: string): string {
  const t = title.toLowerCase();
  if (t.includes('budget')) return 'Budgeting';
  if (t.includes('invest') || t.includes('compound') || t.includes('interest')) return 'Investing';
  if (t.includes('sav') || t.includes('emergency')) return 'Saving';
  if (t.includes('credit') || t.includes('debt')) return 'Credit';
  if (t.includes('tax')) return 'Taxes';
  return 'Finance';
}

// Hours derived from completed lesson count (avg ~4 min / lesson)
const AVG_MIN_PER_LESSON = 4;

// ─── Fallback modules ─────────────────────────────────────────────────────────

const FALLBACK_MODULES: Module[] = [
  {
    id: 1, moduleId: 'module-1', moduleOrder: 1,
    title: 'Introduction to Budgeting',
    description: 'Manage your cash flow effectively.',
    lessons: [
      { id: 1, title: 'What is a Budget?', description: '', duration: 3, content: '' },
      { id: 2, title: 'The 50/30/20 Rule', description: '', duration: 5, content: '' },
      { id: 3, title: 'Tracking Expenses', description: '', duration: 4, content: '' },
    ],
  },
  {
    id: 2, moduleId: 'module-2', moduleOrder: 2,
    title: 'The Power of Compound Interest',
    description: 'Grow your wealth exponentially.',
    lessons: [
      { id: 4, title: 'Simple vs Compound', description: '', duration: 5, content: '' },
      { id: 5, title: 'The Rule of 72', description: '', duration: 4, content: '' },
    ],
  },
];

// ─── Skeleton loader row ──────────────────────────────────────────────────────

function CarouselSkeleton({ colors }: { colors: ReturnType<typeof useTheme>['colors'] }) {
  return (
    <View style={{ flexDirection: 'row', paddingHorizontal: 18, gap: 10 }}>
      {[0, 1].map(i => (
        <View
          key={i}
          style={{
            width: 200,
            borderRadius: 12,
            overflow: 'hidden',
            borderWidth: 0.5,
            borderColor: colors.border,
            backgroundColor: colors.surface,
          }}
        >
          <SkeletonLoader width={200} height={88} borderRadius={0} />
          <View style={{ padding: 10, gap: 8 }}>
            <SkeletonLoader width={60} height={10} borderRadius={4} />
            <SkeletonLoader width="90%" height={12} borderRadius={4} />
            <SkeletonLoader width="70%" height={12} borderRadius={4} />
            <SkeletonLoader width="100%" height={4} borderRadius={4} />
            <SkeletonLoader width={80} height={10} borderRadius={4} />
          </View>
        </View>
      ))}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

type EnrichedModule = Module & {
  lessonList: Lesson[];
  completedCount: number;
  progressPercent: number;
};

export default function DashboardScreen() {
  const { currentUser } = useAuth();
  const { streak, xp, completedLessons } = useProgress();
  const { colors } = useTheme();
  const router = useRouter();

  const [modules, setModules] = useState<EnrichedModule[]>([]);
  const [loading, setLoading] = useState(true);

  // Hours learned approximation
  const hoursLearned = ((completedLessons.length * AVG_MIN_PER_LESSON) / 60).toFixed(1);

  // ── Fetch + enrich modules ──────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [mods, lessons] = await Promise.all([
          apiService.getModules(),
          apiService.getAllLessons(),
        ]);

        if (cancelled) return;

        const sorted = (mods?.length ? mods : FALLBACK_MODULES).sort(
          (a, b) => (a.moduleOrder ?? 0) - (b.moduleOrder ?? 0)
        );

        const perModule = lessons?.length
          ? Math.ceil(lessons.length / sorted.length)
          : 0;

        const enriched: EnrichedModule[] = sorted.map((m, idx) => {
          const lessonList: Lesson[] =
            perModule > 0
              ? lessons.slice(idx * perModule, idx * perModule + perModule)
              : (m.lessons ?? []);

          const completedCount = lessonList.filter(l =>
            completedLessons.includes(l.id)
          ).length;

          const progressPercent =
            lessonList.length > 0
              ? (completedCount / lessonList.length) * 100
              : 0;

          return { ...m, lessonList, completedCount, progressPercent };
        });

        setModules(enriched);
      } catch {
        const enriched: EnrichedModule[] = FALLBACK_MODULES.map(m => {
          const lessonList = m.lessons ?? [];
          const completedCount = lessonList.filter(l =>
            completedLessons.includes(l.id)
          ).length;
          return {
            ...m,
            lessonList,
            completedCount,
            progressPercent:
              lessonList.length > 0
                ? (completedCount / lessonList.length) * 100
                : 0,
          };
        });
        setModules(enriched);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [completedLessons]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleModulePress = (mod: EnrichedModule) => {
    // Navigate to the modules tab, which shows lesson detail
    router.push('/modules');
  };

  const handleCategoryPress = (label: string) => {
    router.push('/modules');
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Greeting header ───────────────────────────────────────────── */}
        <View style={[styles.greetingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>

          <View style={[styles.greetingTop, { borderBottomColor: colors.border }]}>
            {/* Left: text */}
            <View style={styles.greetingTextBlock}>
              <Text style={[styles.greetingLabel, { color: colors.textSecondary }]}>
                {greeting()}
              </Text>
              <Text style={[styles.greetingName, { color: colors.text }]}>
                {currentUser?.username ?? 'Learner'}
              </Text>
            </View>

            {/* Right: avatar */}
            <View style={[styles.avatar, { backgroundColor: colors.accentLight }]}>
              {currentUser?.avatarUri ? (
                <Image
                  source={{ uri: currentUser.avatarUri }}
                  style={styles.avatarImg}
                  accessible={false}
                />
              ) : (
                <Text style={[styles.avatarInitial, { color: colors.accent }]}>
                  {(currentUser?.username ?? 'L').charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
          </View>

          {/* ── Stats row ──────────────────────────────────────────────── */}
          <View style={styles.statsRow}>
            {/* Streak — accent-tinted */}
            <View style={[styles.statCard, { backgroundColor: colors.accentLight }]}>
              <Text style={[styles.statLabel, { color: colors.accent }]}>Streak</Text>
              <Text style={[styles.statValue, { color: colors.accent }]}>
                {streak} {streak === 1 ? 'day' : 'days'}
              </Text>
            </View>

            {/* Hours learned — neutral */}
            <View style={[styles.statCard, { backgroundColor: colors.surfaceAlt }]}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Hours learned</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {hoursLearned}
              </Text>
            </View>
          </View>

          {/* ── Continue learning header ─────────────────────────────── */}
          <View style={styles.sectionRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Continue learning</Text>
            <TouchableOpacity
              onPress={() => router.push('/modules')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="See all modules"
            >
              <Text style={[styles.seeAll, { color: colors.accent }]}>See all</Text>
            </TouchableOpacity>
          </View>

          {/* ── Course carousel ──────────────────────────────────────── */}
          {loading ? (
            <View style={{ paddingBottom: 20 }}>
              <CarouselSkeleton colors={colors} />
            </View>
          ) : (
            <FlatList
              horizontal
              data={modules}
              keyExtractor={item => String(item.id)}
              contentContainerStyle={styles.carousel}
              showsHorizontalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
              renderItem={({ item, index }) => (
                <CourseCard
                  title={item.title}
                  category={moduleCategory(item.title)}
                  icon={moduleIcon(item.title)}
                  progressPercent={item.progressPercent}
                  lessonCount={item.lessonList.length}
                  completedCount={item.completedCount}
                  accent={ACCENT_CYCLE[index % ACCENT_CYCLE.length]}
                  onPress={() => handleModulePress(item)}
                />
              )}
            />
          )}

          {/* ── Browse categories ─────────────────────────────────────── */}
          <View style={[styles.categoriesSection, { borderTopColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Browse categories
            </Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat.label}
                  style={[styles.categoryChip, { backgroundColor: colors.surfaceAlt }]}
                  onPress={() => handleCategoryPress(cat.label)}
                  activeOpacity={0.75}
                  accessibilityRole="button"
                  accessibilityLabel={`Browse ${cat.label}`}
                >
                  <Text style={styles.categoryEmoji} accessible={false}>
                    {cat.emoji}
                  </Text>
                  <Text style={[styles.categoryLabel, { color: colors.textSecondary }]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 32,
  },

  // ── Outer container card (matches mockup's surface-2 rounded card) ──────────
  greetingCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 0.5,
  },

  // ── Greeting top ────────────────────────────────────────────────────────────
  greetingTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 14,
  },
  greetingTextBlock: { flex: 1 },
  greetingLabel: {
    fontSize: 13,
    fontWeight: '400',
    marginBottom: 2,
  },
  greetingName: {
    fontSize: 20,
    fontWeight: '500',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginLeft: 12,
  },
  avatarImg: { width: 40, height: 40, borderRadius: 20 },
  avatarInitial: { fontSize: 17, fontWeight: '700' },

  // ── Stats row ───────────────────────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    paddingBottom: 18,
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '500',
  },

  // ── Section row (title + see all) ──────────────────────────────────────────
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '500',
  },

  // ── Carousel ────────────────────────────────────────────────────────────────
  carousel: {
    paddingHorizontal: 18,
    paddingBottom: 20,
  },

  // ── Browse categories ───────────────────────────────────────────────────────
  categoriesSection: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 10,
    borderTopWidth: 0.5,
    marginTop: 4,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  categoryChip: {
    width: '30%',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  categoryEmoji: {
    fontSize: 20,
    marginBottom: 6,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
});