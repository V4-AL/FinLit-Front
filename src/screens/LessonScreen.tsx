import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { apiService, Lesson } from '../services/api';
import { useProgress } from '../contexts/ProgressContext';
import { useTheme } from '../contexts/ThemeContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface ContentBlock {
  type: 'text' | 'quiz';
  value?: string;
  question?: string;
  options?: string[];
  answer?: number;
  explanation?: string;
}

export default function LessonScreen() {
  const router = useRouter();
  const { lessonId: lessonIdParam } = useLocalSearchParams<{ lessonId: string }>();
  const lessonId = Number(lessonIdParam);
  const { completeLesson } = useProgress();
  const { colors } = useTheme();
  const { isSubscribed, buyHint } = useSubscription();
  const reducedMotion = useReducedMotion();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<ContentBlock[]>([]);

  // Quiz state
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  // Hint state
  const [hintRevealed, setHintRevealed] = useState(false);
  const [hintBuying, setHintBuying] = useState(false);

  // Lesson completion state
  const [isFinished, setIsFinished] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [xpEarned, setXpEarned] = useState(10);
  const isAdvancing = useRef(false);

  // XP animation
  const xpScaleAnim = useState(new Animated.Value(0))[0];

  // ── Fetch lesson ────────────────────────────────────────────────────────────

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const fetched = await apiService.getLesson(lessonId);
        setLesson(fetched);

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
              {
                type: 'quiz',
                question: 'What is the main topic of this lesson?',
                options: [fetched.title, 'None of the above'],
                answer: 0,
              },
            ]);
          }
        }
      } catch (error) {
        console.warn('Backend lesson fetch failed, using fallback content', error);
        let fallbackContent: ContentBlock[] = [];
        if (lessonId === 1) {
          fallbackContent = [
            { type: 'text', value: 'A budget is a plan for your money. It helps you ensure you have enough for the things you need and want.' },
            { type: 'text', value: 'Budgeting gives you absolute freedom over your cash flow — it shows where your money goes instead of wondering where it went.' },
            { type: 'quiz', question: 'What is the primary purpose of a budget?', options: ['To restrict all spending', 'To map out and control your cash flow', 'To make you rich overnight'], answer: 1 },
          ];
        } else if (lessonId === 2) {
          fallbackContent = [
            { type: 'text', value: 'The 50/30/20 rule divides your after-tax income into Needs (50%), Wants (30%), and Savings (20%).' },
            { type: 'quiz', question: 'Saving for an emergency fund falls into?', options: ['50% Needs', '30% Wants', '20% Savings'], answer: 2 },
          ];
        } else {
          fallbackContent = [
            { type: 'text', value: 'Financial literacy is key to making wise financial decisions. By reading these cards you are advancing your education!' },
            { type: 'quiz', question: 'Does financial literacy help you make better money decisions?', options: ['Yes', 'No'], answer: 0 },
          ];
        }
        setSlides(fallbackContent);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [lessonId]);

  // Reset hint when slide changes
  useEffect(() => {
    setHintRevealed(false);
  }, [currentSlide]);

  // ── Derived ────────────────────────────────────────────────────────────────

  const activeSlide = slides[currentSlide];
  const progressPercent =
    slides.length > 0 ? ((currentSlide + (isFinished ? 1 : 0)) / slides.length) * 100 : 0;

  // ── Hint ───────────────────────────────────────────────────────────────────

  const handleHint = async () => {
    if (hintRevealed) return;

    if (isSubscribed) {
      // Pro users get hints free
      setHintRevealed(true);
      return;
    }

    Alert.alert(
      'Use a Hint 💡',
      'Spending points to reveal the correct answer. This will cost points from your balance.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Use Hint',
          onPress: async () => {
            setHintBuying(true);
            const ok = await buyHint();
            setHintBuying(false);
            if (ok) {
              setHintRevealed(true);
            } else {
              Alert.alert(
                'Not enough points',
                'You need more points to buy a hint. Keep completing lessons to earn more!'
              );
            }
          },
        },
      ]
    );
  };

  // ── Continue / check answer ────────────────────────────────────────────────

  const handleContinue = async () => {
    if (isAdvancing.current) return;

    if (activeSlide.type === 'quiz' && !isAnswerChecked) {
      if (selectedOption === null) return;
      const correct = selectedOption === activeSlide.answer;
      setIsAnswerCorrect(correct);
      setIsAnswerChecked(true);
      return;
    }

    if (activeSlide.type === 'quiz' && isAnswerChecked && !isAnswerCorrect) {
      // Try again
      setIsAnswerChecked(false);
      setSelectedOption(null);
      setHintRevealed(false);
      return;
    }

    if (currentSlide < slides.length - 1) {
      isAdvancing.current = true;
      setCurrentSlide(currentSlide + 1);
      setSelectedOption(null);
      setIsAnswerChecked(false);
      isAdvancing.current = false;
    } else {
      // Complete lesson
      isAdvancing.current = true;
      setCompleting(true);
      setIsFinished(true);

      try {
        await completeLesson(lessonId);
        // ProgressContext will reconcile XP from server; read it back via xpEarned for display
        setXpEarned(10);
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

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  // ── Completion screen ──────────────────────────────────────────────────────

  if (isFinished) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.finishContainer}>
          <Text style={styles.cupEmoji}>🏆</Text>
          <Text style={[styles.finishTitle, { color: colors.text }]}>Lesson Complete!</Text>
          <Text style={[styles.finishSubtitle, { color: colors.textSecondary }]}>
            You are one step closer to financial freedom.
          </Text>
          <Animated.View
            style={[
              styles.xpBadge,
              {
                backgroundColor: colors.streakBadgeBg,
                borderColor: colors.streakBadgeBorder,
                transform: [{ scale: xpScaleAnim }],
              },
            ]}
            accessibilityLabel={`You earned ${xpEarned} experience points`}
          >
            <Text style={[styles.xpText, { color: colors.xpBadgeText }]}>⭐ +{xpEarned} XP</Text>
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

  // ── Main lesson screen ─────────────────────────────────────────────────────

  const isQuizSlide = activeSlide?.type === 'quiz';
  const hintAvailable = isQuizSlide && !isAnswerChecked;
  // Show the explanation/hint text if user has revealed it
  const hintText = hintRevealed && isQuizSlide
    ? (activeSlide.explanation ?? `Hint: The correct answer is option ${(activeSlide.answer ?? 0) + 1}.`)
    : null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header + progress bar */}
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
            <View
              style={[styles.progressBarFill, { width: `${progressPercent}%`, backgroundColor: colors.accent }]}
            />
          </View>
        </View>

        {/* Hint button — only on quiz slides before checking */}
        {hintAvailable && (
          <TouchableOpacity
            onPress={handleHint}
            style={[styles.hintButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
            disabled={hintBuying || hintRevealed}
            accessibilityRole="button"
            accessibilityLabel={isSubscribed ? 'Reveal hint' : 'Buy a hint'}
          >
            {hintBuying ? (
              <ActivityIndicator size="small" color={colors.accent} />
            ) : (
              <Text style={styles.hintEmoji} accessible={false}>💡</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Slide content */}
      <View style={styles.contentCard}>
        {!isQuizSlide ? (
          <View style={styles.textSlide}>
            <Text style={styles.slideIcon}>📖</Text>
            <Text style={[styles.textContent, { color: colors.text }]}>{activeSlide?.value}</Text>
          </View>
        ) : (
          <View style={styles.quizSlide}>
            <Text style={[styles.quizTag, { color: colors.accent }]}>QUIZ CHALLENGE</Text>
            <Text style={[styles.quizQuestion, { color: colors.text }]}>{activeSlide.question}</Text>

            {/* Hint text */}
            {hintText && (
              <View style={[styles.hintBox, { backgroundColor: colors.xpBadgeBg, borderColor: colors.xpBadgeBorder }]}>
                <Text style={[styles.hintBoxText, { color: colors.accentDark }]}>{hintText}</Text>
              </View>
            )}

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
                const textColor = showCorrect
                  ? colors.accentDark
                  : showWrong
                  ? colors.logoutText
                  : isSelected
                  ? colors.quizSelectText
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
                    <Text style={[styles.optionText, { color: textColor }]}>{option}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </View>

      {/* Action footer */}
      <View style={[
        styles.actionFooter,
        { borderTopColor: colors.border },
        isAnswerChecked
          ? isAnswerCorrect
            ? { backgroundColor: colors.accentLight, borderColor: colors.streakBadgeBorder }
            : { backgroundColor: colors.logoutBg, borderColor: colors.logoutBorder }
          : null,
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
            isQuizSlide && selectedOption === null ? { backgroundColor: colors.border } : null,
            isAnswerChecked && !isAnswerCorrect ? { backgroundColor: colors.logoutText } : null,
          ]}
          onPress={handleContinue}
          disabled={(isQuizSlide && selectedOption === null) || completing}
          accessibilityRole="button"
          accessibilityLabel={
            isQuizSlide
              ? !isAnswerChecked
                ? 'Check answer'
                : isAnswerCorrect
                ? 'Continue'
                : 'Try again'
              : 'Continue'
          }
          accessibilityState={{
            disabled: (isQuizSlide && selectedOption === null) || completing,
            busy: completing,
          }}
        >
          {completing ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.continueButtonText}>
              {isQuizSlide
                ? !isAnswerChecked
                  ? 'Check Answer'
                  : isAnswerCorrect
                  ? 'Continue'
                  : 'Try Again'
                : 'Continue'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8,
  },
  closeButton: { padding: 8, marginRight: 12 },
  closeButtonText: { fontSize: 20, fontWeight: '800' },
  progressContainer: { flex: 1 },
  progressBarBg: { height: 14, borderRadius: 7, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 7 },

  // Hint button
  hintButton: {
    marginLeft: 12, width: 38, height: 38, borderRadius: 19,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  hintEmoji: { fontSize: 18 },

  // Content
  contentCard: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  textSlide: { alignItems: 'center' },
  slideIcon: { fontSize: 70, marginBottom: 32 },
  textContent: { fontSize: 20, lineHeight: 30, fontWeight: '600', textAlign: 'center' },

  quizSlide: { alignItems: 'stretch' },
  quizTag: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginBottom: 12, textAlign: 'center' },
  quizQuestion: { fontSize: 22, fontWeight: '800', marginBottom: 24, textAlign: 'center', lineHeight: 28 },

  // Hint box
  hintBox: {
    borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 16,
  },
  hintBoxText: { fontSize: 13, fontWeight: '600', lineHeight: 18 },

  optionsList: { gap: 12 },
  optionButton: {
    borderWidth: 2, borderRadius: 16,
    paddingVertical: 18, paddingHorizontal: 20,
  },
  optionText: { fontSize: 16, fontWeight: '700' },

  // Footer
  actionFooter: { padding: 24, borderTopWidth: 1.5 },
  feedbackTextContainer: { marginBottom: 16 },
  feedbackTitle: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  feedbackDescription: { fontSize: 14, fontWeight: '500' },
  continueButton: {
    height: 54, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  continueButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  // Finish
  finishContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  cupEmoji: { fontSize: 100, marginBottom: 32 },
  finishTitle: { fontSize: 28, fontWeight: '800', marginBottom: 12 },
  finishSubtitle: { fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 40 },
  xpBadge: {
    paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: 24, marginBottom: 60, borderWidth: 1.5,
  },
  xpText: { fontSize: 20, fontWeight: '800' },
  finishButton: {
    width: '100%', height: 56, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  finishButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
