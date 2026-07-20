import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { apiService, Lesson } from '../services/api';
import { useProgress } from '../contexts/ProgressContext';
import { useTheme } from '../contexts/ThemeContext';
import { useReducedMotion } from '../hooks/useReducedMotion';
interface ContentBlock {
  type: 'text' | 'quiz';
  value?: string;
  question?: string;
  options?: string[];
  answer?: number;
}
export default function LessonScreen() {
  const router = useRouter();
  const { lessonId: lessonIdParam } = useLocalSearchParams<{ lessonId: string }>();
  const lessonId = Number(lessonIdParam);
  const { completeLesson } = useProgress();
  const { colors } = useTheme();
  const reducedMotion = useReducedMotion();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<ContentBlock[]>([]);

  // Quiz State
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  // Lesson complete transition state
  const [isFinished, setIsFinished] = useState(false);
  const [completing, setCompleting] = useState(false);
  const isAdvancing = useRef(false);
  // XP Anim
  const xpScaleAnim = useState(new Animated.Value(0))[0];
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const fetched = await apiService.getLesson(lessonId);
        setLesson(fetched);

        // Parse content blocks
        if (fetched.content) {
          try {
            const parsed = JSON.parse(fetched.content);
            if (Array.isArray(parsed)) {
              setSlides(parsed);
            } else {
              setSlides([{ type: 'text', value: fetched.content }]);
            }
          } catch {
            setSlides([
              { type: 'text', value: fetched.content },
              { type: 'quiz', question: 'What is the main topic of this lesson?', options: [fetched.title, 'None of the above'], answer: 0 }
            ]);
          }
        }
      } catch (error) {
        console.warn('Backend lesson fetch failed, parsing fallback content', error);
        // Load fallback content matching the clicked ID
        let fallbackContent: ContentBlock[] = [];
        if (lessonId === 1) {
          fallbackContent = [
            { type: 'text', value: 'Welcome to FinLit! A budget is a plan for your money. It helps you ensure you have enough for the things you need and the things that are important to you.' },
            { type: 'text', value: 'Think of budgeting not as a restriction, but as a tool that gives you absolute freedom over your cash flow. It shows you exactly where your money goes instead of wondering where it went.' },
            { type: 'quiz', question: 'What is the primary purpose of a budget?', options: ['To restrict all spending', 'To map out and control your cash flow', 'To make you rich overnight'], answer: 1 }
          ];
        } else if (lessonId === 2) {
          fallbackContent = [
            { type: 'text', value: 'The 50/30/20 rule is a simple budgeting method. It divides your after-tax income into three categories: 50% for Needs, 30% for Wants, and 20% for Savings.' },
            { type: 'text', value: 'Needs are essentials like rent, utilities, and groceries. Wants are lifestyle choices like dining out or streaming services. Savings include retirement investments or emergency funds.' },
            { type: 'quiz', question: 'Under the 50/30/20 rule, which category does saving for an emergency fund fall into?', options: ['50% Needs', '30% Wants', '20% Savings'], answer: 2 }
          ];
        } else {
          fallbackContent = [
            { type: 'text', value: 'Financial literacy is key to making wise financial decisions. By reading these cards and taking the quiz, you are advancing your education!' },
            { type: 'quiz', question: 'Does financial literacy help you make better money decisions?', options: ['Yes', 'No'], answer: 0 }
          ];
        }
        setSlides(fallbackContent);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [lessonId]);
  const activeSlide = slides[currentSlide];
  const progressPercent = slides.length > 0 ? ((currentSlide + (isFinished ? 1 : 0)) / slides.length) * 100 : 0;
  const handleContinue = async () => {
    if (isAdvancing.current) return; // guard against rapid double-taps
    if (activeSlide.type === 'quiz' && !isAnswerChecked) {
      // Check answer
      if (selectedOption === null) return;

      const correct = selectedOption === activeSlide.answer;
      setIsAnswerCorrect(correct);
      setIsAnswerChecked(true);
      return;
    }
    if (activeSlide.type === 'quiz' && isAnswerChecked && !isAnswerCorrect) {
      // Try again if incorrect
      setIsAnswerChecked(false);
      setSelectedOption(null);
      return;
    }
    // Go to next slide or finish
    if (currentSlide < slides.length - 1) {
      isAdvancing.current = true;
      setCurrentSlide(currentSlide + 1);
      setSelectedOption(null);
      setIsAnswerChecked(false);
      isAdvancing.current = false;
    } else {
      // Complete lesson & play visual XP animation
      isAdvancing.current = true;
      setCompleting(true);
      setIsFinished(true);
      try {
        await completeLesson(lessonId);
      } finally {
        setCompleting(false);
      }

      if (reducedMotion) {
        xpScaleAnim.setValue(1);
      } else {
        Animated.spring(xpScaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 6,
          useNativeDriver: true,
        }).start();
      }
    }
  };
  const handleQuit = () => {
    router.back();
  };
  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }
  // Completion screen layout
  if (isFinished) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.finishContainer}>
          <Text style={styles.cupEmoji}>🏆</Text>
          <Text style={[styles.finishTitle, { color: colors.text }]}>Lesson Complete!</Text>
          <Text style={[styles.finishSubtitle, { color: colors.textSecondary }]}>You are one step closer to financial freedom.</Text>
          <Animated.View
            style={[styles.xpBadge, { backgroundColor: colors.streakBadgeBg, borderColor: colors.streakBadgeBorder, transform: [{ scale: xpScaleAnim }] }]}
            accessibilityLabel="You earned 10 experience points"
          >
            <Text style={[styles.xpText, { color: colors.xpBadgeText }]}>⭐ +10 XP</Text>
          </Animated.View>
          <TouchableOpacity
            style={[styles.finishButton, { backgroundColor: colors.accent }]}
            onPress={handleQuit}
            accessibilityRole="button"
            accessibilityLabel="Return to your learning journey"
          >
            <Text style={styles.finishButtonText}>Return to Journey</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Header & Progress Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleQuit}
          style={styles.closeButton}
          accessibilityRole="button"
          accessibilityLabel="Close lesson"
        >
          <Text style={[styles.closeButtonText, { color: colors.textMuted }]}>✕</Text>
        </TouchableOpacity>
        <View
          style={styles.progressContainer}
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: 100, now: Math.round(progressPercent) }}
        >
          <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%`, backgroundColor: colors.accent }]} />
          </View>
        </View>
      </View>
      {/* Main Slide Content Card */}
      <View style={styles.contentCard}>
        {activeSlide.type === 'text' ? (
          <View style={styles.textSlide}>
            <Text style={styles.slideIcon}>📖</Text>
            <Text style={[styles.textContent, { color: colors.text }]}>{activeSlide.value}</Text>
          </View>
        ) : (
          <View style={styles.quizSlide}>
            <Text style={[styles.quizTag, { color: colors.accent }]}>QUIZ CHALLENGE</Text>
            <Text style={[styles.quizQuestion, { color: colors.text }]}>{activeSlide.question}</Text>

            <View style={styles.optionsList}>
              {activeSlide.options?.map((option, index) => {
                const isSelected = selectedOption === index;
                const showCorrect = isAnswerChecked && index === activeSlide.answer;
                const showWrong = isAnswerChecked && isSelected && !isAnswerCorrect;
                const optionColors = showCorrect
                  ? { borderColor: colors.accent, backgroundColor: colors.accentLight }
                  : showWrong
                  ? { borderColor: colors.logoutText, backgroundColor: colors.logoutBg }
                  : isSelected
                  ? { borderColor: colors.quizSelectBorder, backgroundColor: colors.quizSelectBg }
                  : { borderColor: colors.border, backgroundColor: colors.surface };
                const textColor = isSelected
                  ? colors.quizSelectText
                  : showCorrect || showWrong
                  ? colors.text
                  : colors.textSecondary;
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.optionButton, optionColors]}
                    onPress={() => !isAnswerChecked && setSelectedOption(index)}
                    activeOpacity={isAnswerChecked ? 1 : 0.7}
                    accessibilityRole="radio"
                    accessibilityLabel={option}
                    accessibilityState={{ selected: isSelected, disabled: isAnswerChecked }}
                  >
                    <Text style={[styles.optionText, { color: textColor }]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </View>
      {/* Bottom Actions Banner */}
      <View style={[
        styles.actionFooter,
        { borderTopColor: colors.border },
        isAnswerChecked ? (isAnswerCorrect ? { backgroundColor: colors.accentLight, borderColor: colors.streakBadgeBorder } : { backgroundColor: colors.logoutBg, borderColor: colors.logoutBorder }) : null,
      ]}>
        {isAnswerChecked && (
          <View style={styles.feedbackTextContainer} accessibilityLiveRegion="polite">
            <Text style={[styles.feedbackTitle, { color: isAnswerCorrect ? colors.accentDark : colors.logoutText }]}>
              {isAnswerCorrect ? '🎉 Correct!' : '❌ Incorrect'}
            </Text>
            <Text style={[styles.feedbackDescription, { color: colors.textSecondary }]}>
              {isAnswerCorrect
                ? 'Awesome job! Keep compounding your knowledge.'
                : 'Double check the choices and try again!'}
            </Text>
          </View>
        )}
        <TouchableOpacity
          style={[
            styles.continueButton,
            { backgroundColor: colors.accent },
            activeSlide.type === 'quiz' && selectedOption === null ? { backgroundColor: colors.border } : null,
            isAnswerChecked && !isAnswerCorrect ? { backgroundColor: colors.logoutText } : null,
          ]}
          onPress={handleContinue}
          disabled={(activeSlide.type === 'quiz' && selectedOption === null) || completing}
          accessibilityRole="button"
          accessibilityLabel={
            activeSlide.type === 'quiz'
              ? (!isAnswerChecked ? 'Check answer' : (isAnswerCorrect ? 'Continue' : 'Try again'))
              : 'Continue'
          }
          accessibilityState={{ disabled: (activeSlide.type === 'quiz' && selectedOption === null) || completing, busy: completing }}
        >
          {completing ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.continueButtonText}>
              {activeSlide.type === 'quiz'
                ? (!isAnswerChecked ? 'Check Answer' : (isAnswerCorrect ? 'Continue' : 'Try Again'))
                : 'Continue'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  closeButton: {
    padding: 8,
    marginRight: 12,
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: '800',
  },
  progressContainer: {
    flex: 1,
  },
  progressBarBg: {
    height: 14,
    borderRadius: 7,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 7,
  },
  contentCard: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  textSlide: {
    alignItems: 'center',
  },
  slideIcon: {
    fontSize: 70,
    marginBottom: 32,
  },
  textContent: {
    fontSize: 20,
    lineHeight: 30,
    fontWeight: '600',
    textAlign: 'center',
  },
  quizSlide: {
    alignItems: 'stretch',
  },
  quizTag: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 12,
    textAlign: 'center',
  },
  quizQuestion: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 28,
  },
  optionsList: {
    gap: 12,
  },
  optionButton: {
    borderWidth: 2,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '700',
  },
  actionFooter: {
    padding: 24,
    borderTopWidth: 1.5,
  },
  feedbackTextContainer: {
    marginBottom: 16,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  feedbackDescription: {
    fontSize: 14,
    fontWeight: '500',
  },
  continueButton: {
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  finishContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  cupEmoji: {
    fontSize: 100,
    marginBottom: 32,
  },
  finishTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 12,
  },
  finishSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  xpBadge: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    marginBottom: 60,
    borderWidth: 1.5,
  },
  xpText: {
    fontSize: 20,
    fontWeight: '800',
  },
  finishButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
