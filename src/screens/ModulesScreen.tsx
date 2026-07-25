import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiService, Module, Lesson, ModuleAccessResponse } from '../services/api';
import { useProgress } from '../contexts/ProgressContext';
import { useTheme } from '../contexts/ThemeContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useRouter } from 'expo-router';

// ─── Fallback data ─────────────────────────────────────────────────────────────

const FALLBACK_MODULES: Module[] = [
  {
    id: 1,
    moduleId: 'module-1',
    moduleOrder: 1,
    title: 'Introduction to Budgeting',
    description: 'Learn the fundamentals of managing your cash flow and setting up a budgeting system.',
    lessons: [
      {
        id: 1,
        title: 'What is a Budget?',
        description: 'Understand the concept of income, expenses, and why budgeting is your financial foundation.',
        duration: 3,
        content: JSON.stringify([
          { type: 'text', value: 'Welcome to FinLit! A budget is a plan for your money. It helps you ensure you have enough for the things you need and the things that are important to you.' },
          { type: 'text', value: 'Think of budgeting not as a restriction, but as a tool that gives you absolute freedom over your cash flow. It shows you exactly where your money goes instead of wondering where it went.' },
          { type: 'quiz', question: 'What is the primary purpose of a budget?', options: ['To restrict all spending', 'To map out and control your cash flow', 'To make you rich overnight'], answer: 1 },
        ]),
      },
      {
        id: 2,
        title: 'The 50/30/20 Rule',
        description: 'A simple, highly popular framework to allocate your income dynamically.',
        duration: 5,
        content: JSON.stringify([
          { type: 'text', value: 'The 50/30/20 rule divides your after-tax income into: 50% for Needs, 30% for Wants, and 20% for Savings.' },
          { type: 'quiz', question: 'Under the 50/30/20 rule, saving for an emergency fund falls into?', options: ['50% Needs', '30% Wants', '20% Savings'], answer: 2 },
        ]),
      },
      {
        id: 3,
        title: 'Tracking Your Expenses',
        description: 'How to monitor transactions and identify leaks in your daily spending.',
        duration: 4,
        content: JSON.stringify([
          { type: 'text', value: 'Tracking your expenses exposes the hidden leaks in your cash flow.' },
          { type: 'quiz', question: 'Why is tracking expenses crucial?', options: ['Increases credit score', 'Verifies spending aligns with your budget', 'Allows refunds'], answer: 1 },
        ]),
      },
    ],
  },
  {
    id: 2,
    moduleId: 'module-2',
    moduleOrder: 2,
    title: 'The Power of Compound Interest',
    description: 'Discover why compound interest is described as the eighth wonder of the world.',
    lessons: [
      {
        id: 4,
        title: 'Simple vs. Compound',
        description: 'Learn how compounding makes your interest earn interest, multiplying wealth over time.',
        duration: 5,
        content: JSON.stringify([
          { type: 'text', value: 'Compound interest is earned on the principal PLUS all accumulated interest from previous periods.' },
          { type: 'quiz', question: 'What does interest "compounding" mean?', options: ['Earn interest once a year', 'Earned interest earns more interest', 'The bank charges a fee'], answer: 1 },
        ]),
      },
      {
        id: 5,
        title: 'The Rule of 72',
        description: 'A quick mental shortcut to calculate how fast your investments will double.',
        duration: 4,
        content: JSON.stringify([
          { type: 'text', value: 'Divide 72 by your annual interest rate to find years to double. At 8%, that is 9 years.' },
          { type: 'quiz', question: 'At a 6% annual return, how long to double your money?', options: ['12 years', '6 years', '72 years'], answer: 0 },
        ]),
      },
    ],
  },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ModulesScreen() {
  const { completedLessons } = useProgress();
  const { colors } = useTheme();
  const { isSubscribed, checkModuleAccess, buyLife, useLife } = useSubscription();
  const router = useRouter();

  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  // Map of moduleId → access response (cached after first check)
  const [accessMap, setAccessMap] = useState<Record<number, ModuleAccessResponse>>({});
  const [accessLoading, setAccessLoading] = useState<Record<number, boolean>>({});

  // ── Fetch modules ────────────────────────────────────────────────────────────

  useEffect(() => {
    const fetchModulesAndLessons = async () => {
      try {
        const [fetchedModules, fetchedLessons] = await Promise.all([
          apiService.getModules(),
          apiService.getAllLessons(),
        ]);

        if (fetchedModules && fetchedModules.length > 0) {
          const sortedModules = [...fetchedModules].sort(
            (a, b) => (a.moduleOrder ?? 0) - (b.moduleOrder ?? 0)
          );
          let mappedModules: Module[];
          if (fetchedLessons && fetchedLessons.length > 0) {
            const totalModules = sortedModules.length;
            const lessonsPerModule = Math.ceil(fetchedLessons.length / totalModules);
            mappedModules = sortedModules.map((m, idx) => {
              const fallback = FALLBACK_MODULES.find(
                fm => fm.moduleId === m.moduleId || fm.title === m.title
              );
              const sliceStart = idx * lessonsPerModule;
              const backendLessonsForModule = fetchedLessons.slice(sliceStart, sliceStart + lessonsPerModule);
              return {
                ...m,
                lessons: backendLessonsForModule.length > 0
                  ? backendLessonsForModule
                  : fallback?.lessons || [],
              };
            });
          } else {
            mappedModules = sortedModules.map(m => {
              const fallback = FALLBACK_MODULES.find(
                fm => fm.moduleId === m.moduleId || fm.title === m.title
              );
              return { ...m, lessons: m.lessons || fallback?.lessons || [] };
            });
          }
          setModules(mappedModules);
        } else {
          setModules(FALLBACK_MODULES);
          setUsingFallback(true);
        }
      } catch (error) {
        console.warn('Backend modules fetch failed, using local mock data', error);
        setModules(FALLBACK_MODULES);
        setUsingFallback(true);
      } finally {
        setLoading(false);
      }
    };
    fetchModulesAndLessons();
  }, []);

  // ── Access checking ──────────────────────────────────────────────────────────

  // Check access for all modules once they load (only for non-subscribed users)
  useEffect(() => {
    if (modules.length === 0 || isSubscribed) return;
    const checkAll = async () => {
      const results: Record<number, ModuleAccessResponse> = {};
      await Promise.all(
        modules.map(async (m) => {
          try {
            results[m.id] = await checkModuleAccess(m.id);
          } catch {
            results[m.id] = { hasAccess: true }; // fail open
          }
        })
      );
      setAccessMap(results);
    };
    checkAll();
  }, [modules, isSubscribed, checkModuleAccess]);

  const getModuleAccess = (moduleId: number): ModuleAccessResponse => {
    if (isSubscribed) return { hasAccess: true };
    return accessMap[moduleId] ?? { hasAccess: true }; // default open while checking
  };

  // ── Handle "Use Life" ─────────────────────────────────────────────────────────

  const handleUseLife = useCallback(
    async (mod: Module) => {
      const access = getModuleAccess(mod.id);
      const lives = access.livesRemaining ?? 0;

      if (lives <= 0) {
        Alert.alert(
          'No Lives Available',
          'You need lives to unlock this module. Purchase lives from the Upgrade tab, or subscribe for unlimited access.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Upgrade', onPress: () => router.push('/payment') },
          ]
        );
        return;
      }

      Alert.alert(
        'Use a Life?',
        `You have ${lives} life${lives !== 1 ? 's' : ''} remaining. Use one to access "${mod.title}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Use Life',
            style: 'default',
            onPress: async () => {
              setAccessLoading(prev => ({ ...prev, [mod.id]: true }));
              const ok = await useLife(mod.id);
              if (ok) {
                // Re-check access for this module
                const updated = await checkModuleAccess(mod.id);
                setAccessMap(prev => ({ ...prev, [mod.id]: updated }));
              } else {
                Alert.alert('Error', 'Could not use life. Please try again.');
              }
              setAccessLoading(prev => ({ ...prev, [mod.id]: false }));
            },
          },
        ]
      );
    },
    [accessMap, isSubscribed, useLife, checkModuleAccess, router]
  );

  // ── Handle "Buy Life" ─────────────────────────────────────────────────────────

  const handleBuyLife = useCallback(
    async (mod: Module) => {
      Alert.alert(
        'Buy a Life',
        `Purchase a life using your points to unlock "${mod.title}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Buy Life',
            onPress: async () => {
              setAccessLoading(prev => ({ ...prev, [mod.id]: true }));
              const ok = await buyLife(mod.id);
              if (ok) {
                const updated = await checkModuleAccess(mod.id);
                setAccessMap(prev => ({ ...prev, [mod.id]: updated }));
              } else {
                Alert.alert('Error', 'Could not purchase life. You may not have enough points.');
              }
              setAccessLoading(prev => ({ ...prev, [mod.id]: false }));
            },
          },
        ]
      );
    },
    [buyLife, checkModuleAccess]
  );

  // ── Lesson unlock logic ──────────────────────────────────────────────────────

  const isLessonUnlocked = (lessonId: number, moduleIndex: number, lessonIndex: number): boolean => {
    if (moduleIndex === 0 && lessonIndex === 0) return true;
    if (completedLessons.includes(lessonId)) return true;
    if (lessonIndex > 0) {
      const prevLesson = modules[moduleIndex].lessons?.[lessonIndex - 1];
      return prevLesson ? completedLessons.includes(prevLesson.id) : false;
    }
    if (moduleIndex > 0) {
      const prevModule = modules[moduleIndex - 1];
      const prevModuleLessons = prevModule.lessons || [];
      if (prevModuleLessons.length === 0) return true;
      return completedLessons.includes(prevModuleLessons[prevModuleLessons.length - 1].id);
    }
    return false;
  };

  const handleLessonClick = (lesson: Lesson, unlocked: boolean) => {
    if (unlocked) {
      router.push({ pathname: '/lesson/[lessonId]', params: { lessonId: String(lesson.id) } });
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Learning Modules</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Follow your personal finance roadmap</Text>
      </View>

      {usingFallback && (
        <View style={[styles.fallbackNotice, { backgroundColor: colors.streakBadgeBg, borderColor: colors.streakBadgeBorder }]}>
          <Text style={[styles.fallbackNoticeText, { color: colors.xpBadgeText }]}>
            Showing sample lessons — check your connection to sync your real progress.
          </Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {modules.map((mod, modIdx) => {
          const moduleLessons = mod.lessons || [];
          const completedCount = moduleLessons.filter(l => completedLessons.includes(l.id)).length;
          const progressPercent = moduleLessons.length > 0
            ? (completedCount / moduleLessons.length) * 100
            : 0;
          const access = getModuleAccess(mod.id);
          const isModuleLocked = !access.hasAccess;
          const isAccessChecking = !!accessLoading[mod.id];
          const lives = access.livesRemaining ?? 0;

          return (
            <View key={mod.id} style={styles.moduleSection}>
              <View style={[styles.moduleHeaderCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.moduleMeta}>
                  <Text style={[styles.moduleNumber, { color: colors.accent }]}>MODULE {modIdx + 1}</Text>
                  <Text style={[styles.moduleProgress, { color: colors.textSecondary }]}>
                    {completedCount}/{moduleLessons.length} Completed
                  </Text>
                </View>
                <Text style={[styles.moduleTitle, { color: colors.text }]}>{mod.title}</Text>
                <Text style={[styles.moduleDescription, { color: colors.textSecondary }]}>{mod.description}</Text>
                <View
                  style={[styles.progressBarBg, { backgroundColor: colors.border }]}
                  accessibilityRole="progressbar"
                  accessibilityValue={{ min: 0, max: 100, now: Math.round(progressPercent) }}
                >
                  <View style={[styles.progressBarFill, { width: `${progressPercent}%`, backgroundColor: colors.accent }]} />
                </View>

                {/* Access gating actions */}
                {isModuleLocked && !isSubscribed && (
                  <View style={styles.lockedActions}>
                    <View style={[styles.lockedBadge, { backgroundColor: colors.logoutBg, borderColor: colors.logoutBorder }]}>
                      <Text style={styles.lockedBadgeEmoji} accessible={false}>🔒</Text>
                      <Text style={[styles.lockedBadgeText, { color: colors.logoutText }]}>Locked</Text>
                    </View>
                    {isAccessChecking ? (
                      <ActivityIndicator size="small" color={colors.accent} style={{ marginLeft: 8 }} />
                    ) : (
                      <View style={styles.lockedButtonRow}>
                        {lives > 0 && (
                          <TouchableOpacity
                            style={[styles.lifeBtn, { borderColor: colors.accent, backgroundColor: colors.accentLight }]}
                            onPress={() => handleUseLife(mod)}
                            accessibilityRole="button"
                            accessibilityLabel={`Use a life to unlock ${mod.title}. ${lives} lives remaining.`}
                          >
                            <Text style={styles.lifeBtnEmoji} accessible={false}>❤️</Text>
                            <Text style={[styles.lifeBtnText, { color: colors.accentDark }]}>
                              Use Life ({lives})
                            </Text>
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity
                          style={[styles.upgradeBtn, { backgroundColor: colors.accent }]}
                          onPress={() => router.push('/payment')}
                          accessibilityRole="button"
                          accessibilityLabel="Upgrade to Pro to unlock this module"
                        >
                          <Text style={styles.upgradeBtnText}>Upgrade 🚀</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
              </View>

              {/* Lessons list — dimmed if module is locked */}
              <View style={[styles.timelineList, isModuleLocked && styles.lockedOverlay]}>
                {moduleLessons.map((lesson, lesIdx) => {
                  const completed = completedLessons.includes(lesson.id);
                  const unlocked = !isModuleLocked && isLessonUnlocked(lesson.id, modIdx, lesIdx);
                  const statusLabel = completed ? 'Completed' : unlocked ? 'Start lesson' : 'Locked';

                  return (
                    <TouchableOpacity
                      key={lesson.id}
                      style={[
                        styles.lessonRow,
                        { backgroundColor: colors.surface, borderColor: colors.border },
                        (!unlocked || isModuleLocked) ? { opacity: 0.55 } : null,
                      ]}
                      onPress={() => handleLessonClick(lesson, unlocked)}
                      activeOpacity={unlocked ? 0.7 : 1}
                      accessibilityRole="button"
                      accessibilityLabel={`${lesson.title}, ${lesson.duration} minutes, ${statusLabel}`}
                      accessibilityState={{ disabled: !unlocked || isModuleLocked }}
                    >
                      <View style={[
                        styles.indicatorCircle,
                        completed
                          ? { backgroundColor: colors.accentLight }
                          : (!unlocked || isModuleLocked)
                          ? { backgroundColor: colors.border }
                          : { backgroundColor: colors.accentLight, borderWidth: 1.5, borderColor: colors.accent },
                      ]}>
                        <Text style={[styles.indicatorText, { color: colors.accent }]} accessible={false}>
                          {completed ? '✓' : (!unlocked || isModuleLocked) ? '🔒' : lesIdx + 1}
                        </Text>
                      </View>
                      <View style={styles.lessonInfo}>
                        <Text style={[styles.lessonTitle, { color: unlocked && !isModuleLocked ? colors.text : colors.textMuted }]}>
                          {lesson.title}
                        </Text>
                        <Text style={[styles.lessonMeta, { color: colors.textSecondary }]}>
                          {lesson.duration} mins • {completed ? 'Completed' : unlocked && !isModuleLocked ? 'Start Lesson' : 'Locked'}
                        </Text>
                      </View>
                      {unlocked && !completed && !isModuleLocked && (
                        <Text style={[styles.arrowIcon, { color: colors.accent }]}>➔</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  fallbackNotice: {
    marginHorizontal: 24, marginTop: 16,
    borderRadius: 12, borderWidth: 1, paddingVertical: 10, paddingHorizontal: 14,
  },
  fallbackNoticeText: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
  header: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16, borderBottomWidth: 1 },
  headerTitle: { fontSize: 24, fontWeight: '800' },
  headerSubtitle: { fontSize: 14, marginTop: 4, fontWeight: '500' },
  scrollContent: { padding: 24 },
  moduleSection: { marginBottom: 32 },
  moduleHeaderCard: { borderRadius: 20, padding: 20, borderWidth: 1 },
  moduleMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  moduleNumber: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  moduleProgress: { fontSize: 11, fontWeight: '700' },
  moduleTitle: { fontSize: 18, fontWeight: '800', marginBottom: 6 },
  moduleDescription: { fontSize: 13, lineHeight: 18, marginBottom: 16 },
  progressBarBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%' },

  // Locked module UI
  lockedActions: { marginTop: 16 },
  lockedBadge: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    borderRadius: 20, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 12,
  },
  lockedBadgeEmoji: { fontSize: 12, marginRight: 4 },
  lockedBadgeText: { fontSize: 12, fontWeight: '700' },
  lockedButtonRow: { flexDirection: 'row', gap: 10 },
  lifeBtn: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 9,
  },
  lifeBtnEmoji: { fontSize: 14, marginRight: 6 },
  lifeBtnText: { fontSize: 13, fontWeight: '700' },
  upgradeBtn: {
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 9,
  },
  upgradeBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  lockedOverlay: { opacity: 0.85 },

  // Lesson rows
  timelineList: { marginTop: 16, paddingLeft: 12 },
  lessonRow: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1,
  },
  indicatorCircle: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center', marginRight: 16,
  },
  indicatorText: { fontSize: 13, fontWeight: '800' },
  lessonInfo: { flex: 1 },
  lessonTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  lessonMeta: { fontSize: 12, fontWeight: '500' },
  arrowIcon: { fontSize: 16, fontWeight: '700' },
});