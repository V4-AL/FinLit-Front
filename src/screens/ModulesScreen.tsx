import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiService, Module, Lesson } from '../services/api';
import { useProgress } from '../contexts/ProgressContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
type NavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;
// Fallback modules matching DataLoader json formats for premium demo resilience
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
          { type: 'quiz', question: 'What is the primary purpose of a budget?', options: ['To restrict all spending', 'To map out and control your cash flow', 'To make you rich overnight'], answer: 1 }
        ])
      },
      {
        id: 2,
        title: 'The 50/30/20 Rule',
        description: 'A simple, highly popular framework to allocate your income dynamically.',
        duration: 5,
        content: JSON.stringify([
          { type: 'text', value: 'The 50/30/20 rule is a simple budgeting method. It divides your after-tax income into three categories: 50% for Needs, 30% for Wants, and 20% for Savings.' },
          { type: 'text', value: 'Needs are essentials like rent, utilities, and groceries. Wants are lifestyle choices like dining out or streaming services. Savings include retirement investments or emergency funds.' },
          { type: 'quiz', question: 'Under the 50/30/20 rule, which category does saving for an emergency fund fall into?', options: ['50% Needs', '30% Wants', '20% Savings'], answer: 2 }
        ])
      },
      {
        id: 3,
        title: 'Tracking Your Expenses',
        description: 'How to monitor transactions and identify leaks in your daily spending.',
        duration: 4,
        content: JSON.stringify([
          { type: 'text', value: 'You can create the best budget in the world, but if you do not track your actual expenses, it won\'t work. Tracking exposes the hidden leaks in your cash flow.' },
          { type: 'text', value: 'Try categorized tracking weekly. Checking statements once a month is often too late to adjust habits.' },
          { type: 'quiz', question: 'Why is tracking expenses crucial for a budget?', options: ['It increases your credit score directly', 'It verifies if your actual spending aligns with your budget plan', 'It allows you to get refunds'], answer: 1 }
        ])
      }
    ]
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
          { type: 'text', value: 'Simple interest is earned only on the original principal. Compound interest is earned on the principal PLUS all accumulated interest from previous periods.' },
          { type: 'text', value: 'As interest compounds, your balance grows exponentially rather than linearly. Over long periods, this difference is massive.' },
          { type: 'quiz', question: 'What does interest "compounding" mean?', options: ['You only earn interest once a year', 'Your earned interest starts earning interest as well', 'The bank charges you a fee'], answer: 1 }
        ])
      },
      {
        id: 5,
        title: 'The Rule of 72',
        description: 'A quick mental shortcut to calculate how fast your investments will double.',
        duration: 4,
        content: JSON.stringify([
          { type: 'text', value: 'The Rule of 72 is a quick way to estimate how many years it will take for your money to double. Divide 72 by your expected annual interest rate.' },
          { type: 'text', value: 'For example, at an 8% interest rate, your money will double in approximately 9 years (72 / 8 = 9).' },
          { type: 'quiz', question: 'If you invest at a 6% annual return, about how many years will it take to double your investment?', options: ['12 years', '6 years', '72 years'], answer: 0 }
        ])
      }
    ]
  }
];
export default function ModulesScreen() {
  const { completedLessons } = useProgress();
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModulesAndLessons = async () => {
      try {
        // Fetch modules and all lessons concurrently
        const [fetchedModules, fetchedLessons] = await Promise.all([
          apiService.getModules(),
          apiService.getAllLessons(),
        ]);


        if (fetchedModules && fetchedModules.length > 0) {
          // Sort modules by moduleOrder
          const sortedModules = [...fetchedModules].sort(
            (a, b) => (a.moduleOrder ?? 0) - (b.moduleOrder ?? 0)
          );
          // Distribute lessons across modules evenly by order.
          // Since the backend doesn't have a module FK on Lesson, we distribute
          // them sequentially: split all lessons into groups based on module count.
          let mappedModules: Module[];
          if (fetchedLessons && fetchedLessons.length > 0) {
            const totalModules = sortedModules.length;
            const lessonsPerModule = Math.ceil(fetchedLessons.length / totalModules);
            mappedModules = sortedModules.map((m, idx) => {
              // Try finding the matching fallback to cross-reference
              const fallback = FALLBACK_MODULES.find(
                fm => fm.moduleId === m.moduleId || fm.title === m.title
              );
              // Slice lessons for this module from the sorted flat list
              const sliceStart = idx * lessonsPerModule;
              const sliceEnd = sliceStart + lessonsPerModule;
              const backendLessonsForModule = fetchedLessons.slice(sliceStart, sliceEnd);
              return {
                ...m,
                // Prefer real backend lessons; fallback to mock if slice is empty
                lessons: backendLessonsForModule.length > 0
                  ? backendLessonsForModule
                  : fallback?.lessons || [],
              };
            });
          } else {
            // Lessons endpoint empty or not yet populated — merge with fallback
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
        }
      } catch (error) {
        console.warn('Backend modules fetch failed, using local mock data', error);
        setModules(FALLBACK_MODULES);
      } finally {
        setLoading(false);
      }
    };

    fetchModulesAndLessons();
  }, []);
  // Helper to determine if a lesson is unlocked
  const isLessonUnlocked = (lessonId: number, moduleIndex: number, lessonIndex: number) => {
    // First lesson of first module is always unlocked
    if (moduleIndex === 0 && lessonIndex === 0) return true;
    // Check if the lesson is already completed
    if (completedLessons.includes(lessonId)) return true;
    // Otherwise, check if the previous lesson in the current module is completed
    if (lessonIndex > 0) {
      const prevLesson = modules[moduleIndex].lessons?.[lessonIndex - 1];
      return prevLesson ? completedLessons.includes(prevLesson.id) : false;
    }
    // If it's the first lesson of a subsequent module, check if the last lesson of the previous module is completed
    if (moduleIndex > 0) {
      const prevModule = modules[moduleIndex - 1];
      const prevModuleLessons = prevModule.lessons || [];
      if (prevModuleLessons.length === 0) return true;
      const lastLessonOfPrevModule = prevModuleLessons[prevModuleLessons.length - 1];
      return completedLessons.includes(lastLessonOfPrevModule.id);
    }
    return false;
  };
  const handleLessonClick = (lesson: Lesson, unlocked: boolean) => {
    if (unlocked) {
      navigation.navigate('Lesson', { lessonId: lesson.id, lessonTitle: lesson.title });
    }
  };
  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Learning Modules</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Follow your personal finance roadmap</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {modules.map((mod, modIdx) => {
          const moduleLessons = mod.lessons || [];
          const completedCount = moduleLessons.filter(l => completedLessons.includes(l.id)).length;
          const progressPercent = moduleLessons.length > 0 ? (completedCount / moduleLessons.length) * 100 : 0;

          return (
            <View key={mod.id} style={styles.moduleSection}>
              <View style={[styles.moduleHeaderCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.moduleMeta}>
                  <Text style={[styles.moduleNumber, { color: colors.accent }]}>MODULE {modIdx + 1}</Text>
                  <Text style={[styles.moduleProgress, { color: colors.textSecondary }]}>{completedCount}/{moduleLessons.length} Completed</Text>
                </View>
                <Text style={[styles.moduleTitle, { color: colors.text }]}>{mod.title}</Text>
                <Text style={[styles.moduleDescription, { color: colors.textSecondary }]}>{mod.description}</Text>
                <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
                  <View style={[styles.progressBarFill, { width: `${progressPercent}%`, backgroundColor: colors.accent }]} />
                </View>
              </View>
              <View style={styles.timelineList}>
                {moduleLessons.map((lesson, lesIdx) => {
                  const completed = completedLessons.includes(lesson.id);
                  const unlocked = isLessonUnlocked(lesson.id, modIdx, lesIdx);
                  return (
                    <TouchableOpacity
                      key={lesson.id}
                      style={[
                        styles.lessonRow,
                        { backgroundColor: colors.surface, borderColor: colors.border },
                        !unlocked ? { opacity: 0.6 } : null,
                      ]}
                      onPress={() => handleLessonClick(lesson, unlocked)}
                      activeOpacity={unlocked ? 0.7 : 1}
                    >
                      <View style={[
                        styles.indicatorCircle,
                        completed
                          ? { backgroundColor: colors.accentLight }
                          : !unlocked
                          ? { backgroundColor: colors.border }
                          : { backgroundColor: colors.accentLight, borderWidth: 1.5, borderColor: colors.accent }
                      ]}>
                        <Text style={[styles.indicatorText, { color: colors.accent }]}>
                          {completed ? '✓' : !unlocked ? '🔒' : lesIdx + 1}
                        </Text>
                      </View>
                      <View style={styles.lessonInfo}>
                        <Text style={[styles.lessonTitle, { color: unlocked ? colors.text : colors.textMuted }]}>
                          {lesson.title}
                        </Text>
                        <Text style={[styles.lessonMeta, { color: colors.textSecondary }]}>
                          {lesson.duration} mins • {completed ? 'Completed' : unlocked ? 'Start Lesson' : 'Locked'}
                        </Text>
                      </View>
                      {unlocked && !completed && (
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
const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16, borderBottomWidth: 1 },
  headerTitle: { fontSize: 24, fontWeight: '800' },
  headerSubtitle: { fontSize: 14, marginTop: 4, fontWeight: '500' },
  scrollContent: { padding: 24 },
  moduleSection: { marginBottom: 32 },
  moduleHeaderCard: { borderRadius: 20, padding: 20, borderWidth: 1, elevation: 1 },
  moduleMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  moduleNumber: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  moduleProgress: { fontSize: 11, fontWeight: '700' },
  moduleTitle: { fontSize: 18, fontWeight: '800', marginBottom: 6 },
  moduleDescription: { fontSize: 13, lineHeight: 18, marginBottom: 16 },
  progressBarBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%' },
  timelineList: { marginTop: 16, paddingLeft: 12 },
  lessonRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1 },
  indicatorCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  indicatorText: { fontSize: 13, fontWeight: '800' },
  lessonInfo: { flex: 1 },
  lessonTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  lessonMeta: { fontSize: 12, fontWeight: '500' },
  arrowIcon: { fontSize: 16, fontWeight: '700' },
});