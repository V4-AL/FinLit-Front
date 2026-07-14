import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { apiService, Lesson } from '../services/api';
import { useProgress } from '../contexts/ProgressContext';
type LessonScreenRouteProp = RouteProp<RootStackParamList, 'Lesson'>;
interface ContentBlock {
  type: 'text' | 'quiz';
  value?: string;
  question?: string;
  options?: string[];
  answer?: number;
}
export default function LessonScreen() {
  const route = useRoute<LessonScreenRouteProp>();
  const navigation = useNavigation();
  const { lessonId, lessonTitle } = route.params;
  const { completeLesson } = useProgress();
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
      setCurrentSlide(currentSlide + 1);
      setSelectedOption(null);
      setIsAnswerChecked(false);
    } else {
      // Complete lesson & play visual XP animation
      setIsFinished(true);
      await completeLesson(lessonId);
      
      Animated.spring(xpScaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 6,
        useNativeDriver: true,
      }).start();
    }
  };
  const handleQuit = () => {
    navigation.goBack();
  };
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }
  // Completion screen layout
  if (isFinished) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.finishContainer}>
          <Text style={styles.cupEmoji}>🏆</Text>
          <Text style={styles.finishTitle}>Lesson Complete!</Text>
          <Text style={styles.finishSubtitle}>You are one step closer to financial freedom.</Text>
          <Animated.View style={[styles.xpBadge, { transform: [{ scale: xpScaleAnim }] }]}>
            <Text style={styles.xpText}>⭐ +10 XP</Text>
          </Animated.View>
          <TouchableOpacity style={styles.finishButton} onPress={handleQuit}>
            <Text style={styles.finishButtonText}>Return to Journey</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header & Progress Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleQuit} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
          </View>
        </View>
      </View>
      {/* Main Slide Content Card */}
      <View style={styles.contentCard}>
        {activeSlide.type === 'text' ? (
          <View style={styles.textSlide}>
            <Text style={styles.slideIcon}>📖</Text>
            <Text style={styles.textContent}>{activeSlide.value}</Text>
          </View>
        ) : (
          <View style={styles.quizSlide}>
            <Text style={styles.quizTag}>QUIZ CHALLENGE</Text>
            <Text style={styles.quizQuestion}>{activeSlide.question}</Text>
            
            <View style={styles.optionsList}>
              {activeSlide.options?.map((option, index) => {
                const isSelected = selectedOption === index;
                const showCorrect = isAnswerChecked && index === activeSlide.answer;
                const showWrong = isAnswerChecked && isSelected && !isAnswerCorrect;
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionButton,
                      isSelected ? styles.optionSelected : null,
                      showCorrect ? styles.optionCorrect : null,
                      showWrong ? styles.optionWrong : null,
                    ]}
                    onPress={() => !isAnswerChecked && setSelectedOption(index)}
                    activeOpacity={isAnswerChecked ? 1 : 0.7}
                  >
                    <Text style={[
                      styles.optionText,
                      isSelected ? styles.optionTextSelected : null,
                      showCorrect || showWrong ? styles.optionTextState : null
                    ]}>
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
        isAnswerChecked ? (isAnswerCorrect ? styles.footerCorrect : styles.footerWrong) : null
      ]}>
        {isAnswerChecked && (
          <View style={styles.feedbackTextContainer}>
            <Text style={[
              styles.feedbackTitle,
              isAnswerCorrect ? styles.feedbackCorrectText : styles.feedbackWrongText
            ]}>
              {isAnswerCorrect ? '🎉 Correct!' : '❌ Incorrect'}
            </Text>
            <Text style={styles.feedbackDescription}>
              {isAnswerCorrect 
                ? 'Awesome job! Keep compounding your knowledge.' 
                : 'Double check the choices and try again!'}
            </Text>
          </View>
        )}
        <TouchableOpacity
          style={[
            styles.continueButton,
            activeSlide.type === 'quiz' && selectedOption === null ? styles.buttonDisabled : null,
            isAnswerChecked ? (isAnswerCorrect ? styles.buttonCorrect : styles.buttonWrong) : null
          ]}
          onPress={handleContinue}
          disabled={activeSlide.type === 'quiz' && selectedOption === null}
        >
          <Text style={[
            styles.continueButtonText,
            isAnswerChecked && isAnswerCorrect ? styles.buttonTextCorrect : null
          ]}>
            {activeSlide.type === 'quiz' 
              ? (!isAnswerChecked ? 'Check Answer' : (isAnswerCorrect ? 'Continue' : 'Try Again'))
              : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    color: '#9CA3AF',
  },
  progressContainer: {
    flex: 1,
  },
  progressBarBg: {
    height: 14,
    backgroundColor: '#E5E7EB',
    borderRadius: 7,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
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
    color: '#1F2937',
    fontWeight: '600',
    textAlign: 'center',
  },
  quizSlide: {
    alignItems: 'stretch',
  },
  quizTag: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 12,
    textAlign: 'center',
  },
  quizQuestion: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 28,
  },
  optionsList: {
    gap: 12,
  },
  optionButton: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
  },
  optionSelected: {
    borderColor: '#3B82F6', // Blue highlight when selected
    backgroundColor: '#EFF6FF',
  },
  optionCorrect: {
    borderColor: '#10B981', // Green for correct
    backgroundColor: '#ECFDF5',
  },
  optionWrong: {
    borderColor: '#EF4444', // Red for wrong
    backgroundColor: '#FEF2F2',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4B5563',
  },
  optionTextSelected: {
    color: '#1D4ED8',
  },
  optionTextState: {
    color: '#1F2937',
  },
  actionFooter: {
    padding: 24,
    borderTopWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  footerCorrect: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  footerWrong: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  feedbackTextContainer: {
    marginBottom: 16,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  feedbackCorrectText: {
    color: '#065F46',
  },
  feedbackWrongText: {
    color: '#991B1B',
  },
  feedbackDescription: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  continueButton: {
    height: 54,
    backgroundColor: '#10B981',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  buttonCorrect: {
    backgroundColor: '#10B981',
  },
  buttonWrong: {
    backgroundColor: '#EF4444',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonTextCorrect: {
    color: '#FFFFFF',
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
    color: '#1F2937',
    marginBottom: 12,
  },
  finishSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  xpBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    marginBottom: 60,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
  },
  xpText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#B45309',
  },
  finishButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#10B981',
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
