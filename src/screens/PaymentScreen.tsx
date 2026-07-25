import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useAuth } from '../contexts/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────

type Plan = {
  id: string;
  emoji: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlight: boolean;
  requiresPayment: boolean;
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const PLANS: Plan[] = [
  {
    id: 'free',
    emoji: '🌱',
    name: 'Starter',
    price: 'Free',
    period: 'forever',
    description: 'Perfect to get started with your financial journey.',
    features: ['5 lessons per month', 'Basic XP & streaks', 'Progress tracking'],
    highlight: false,
    requiresPayment: false,
  },
  {
    id: 'pro',
    emoji: '🚀',
    name: 'Pro',
    price: '$4.99',
    period: 'per month',
    description: 'Unlock your full financial potential with unlimited access.',
    features: [
      'Unlimited lessons',
      'Advanced quiz challenges',
      'Detailed progress insights',
      'Offline access',
      'Priority support',
    ],
    highlight: true,
    requiresPayment: true,
  },
  {
    id: 'annual',
    emoji: '💎',
    name: 'Annual',
    price: '$39.99',
    period: 'per year',
    description: 'Best value — save 33% compared to monthly Pro.',
    features: [
      'Everything in Pro',
      '2 months free',
      'Early feature access',
      'Exclusive badges',
    ],
    highlight: false,
    requiresPayment: true,
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function PlanCard({
  plan,
  selected,
  onSelect,
  colors,
}: {
  plan: Plan;
  selected: boolean;
  onSelect: () => void;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  const cardBg = selected ? colors.accentLight : colors.surface;
  const cardBorder = selected ? colors.accent : colors.border;

  return (
    <TouchableOpacity
      style={[styles.planCard, { backgroundColor: cardBg, borderColor: cardBorder, borderWidth: selected ? 2 : 1 }]}
      onPress={onSelect}
      activeOpacity={0.85}
      accessibilityRole="radio"
      accessibilityLabel={`${plan.name} plan, ${plan.price} ${plan.period}`}
      accessibilityState={{ selected }}
    >
      {plan.highlight && (
        <View style={[styles.popularBadge, { backgroundColor: colors.accent }]}>
          <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
        </View>
      )}
      <View style={styles.planTop}>
        <Text style={styles.planEmoji} accessible={false}>{plan.emoji}</Text>
        <View style={styles.planMeta}>
          <Text style={[styles.planName, { color: colors.text }]}>{plan.name}</Text>
          <View style={styles.planPriceRow}>
            <Text style={[styles.planPrice, { color: selected ? colors.accentDark : colors.text }]}>
              {plan.price}
            </Text>
            <Text style={[styles.planPeriod, { color: colors.textSecondary }]}>
              {' '}{plan.period}
            </Text>
          </View>
        </View>
        <View style={[styles.radioCircle, { borderColor: selected ? colors.accent : colors.border }]}>
          {selected && <View style={[styles.radioDot, { backgroundColor: colors.accent }]} />}
        </View>
      </View>

      <Text style={[styles.planDescription, { color: colors.textSecondary }]}>{plan.description}</Text>

      <View style={[styles.featuresSeparator, { backgroundColor: colors.border }]} />

      {plan.features.map(f => (
        <View key={f} style={styles.featureRow}>
          <Text style={[styles.featureCheck, { color: colors.accent }]} accessible={false}>✓</Text>
          <Text style={[styles.featureText, { color: colors.textSecondary }]}>{f}</Text>
        </View>
      ))}
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function PaymentScreen() {
  const { colors } = useTheme();
  const { currentUser } = useAuth();
  const { subscription, isSubscribed, initializePayment, refresh } = useSubscription();

  const [selectedPlanId, setSelectedPlanId] = useState<string>('pro');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentLaunched, setPaymentLaunched] = useState(false);

  const selectedPlan = PLANS.find(p => p.id === selectedPlanId)!;

  // ── Handle CTA press ──────────────────────────────────────────────────────────

  async function handlePay() {
    setError('');

    // Free plan — nothing to do
    if (!selectedPlan.requiresPayment) {
      setPaymentLaunched(true);
      return;
    }

    setLoading(true);
    try {
      const url = await initializePayment();
      if (url) {
        await Linking.openURL(url);
        setPaymentLaunched(true);
        // Refresh subscription status after returning from browser
        await refresh();
      } else {
        setError('Could not start payment. Please try again.');
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  // ── Already subscribed state ──────────────────────────────────────────────────

  if (isSubscribed) {
    const expiry = subscription?.expiryDate
      ? new Date(subscription.expiryDate).toLocaleDateString()
      : null;

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Upgrade Plan 💳</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Manage your subscription</Text>
        </View>
        <View style={styles.activeContainer}>
          <View style={[styles.activeCircle, { backgroundColor: colors.xpBadgeBg, borderColor: colors.xpBadgeBorder }]}>
            <Text style={styles.activeEmoji}>🎉</Text>
          </View>
          <Text style={[styles.activeTitle, { color: colors.text }]}>You're a Pro! 🚀</Text>
          <Text style={[styles.activeSubtitle, { color: colors.textSecondary }]}>
            Your Pro subscription is active.{expiry ? `\nRenews on ${expiry}.` : ''}
          </Text>
          <View style={[styles.activeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {[
              { emoji: '✅', label: 'Unlimited lessons' },
              { emoji: '🏆', label: 'Full leaderboard access' },
              { emoji: '💡', label: 'Hints & lives unlocked' },
              { emoji: '📊', label: 'Detailed progress insights' },
            ].map(f => (
              <View key={f.label} style={styles.activeFeatureRow}>
                <Text style={styles.activeFeatureEmoji} accessible={false}>{f.emoji}</Text>
                <Text style={[styles.activeFeatureText, { color: colors.textSecondary }]}>{f.label}</Text>
              </View>
            ))}
          </View>
          <Text style={[styles.manageNote, { color: colors.textMuted }]}>
            To cancel, manage your subscription through Paystack or contact support.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Payment launched success ──────────────────────────────────────────────────

  if (paymentLaunched && !selectedPlan.requiresPayment) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.activeContainer}>
          <View style={[styles.activeCircle, { backgroundColor: colors.xpBadgeBg, borderColor: colors.xpBadgeBorder }]}>
            <Text style={styles.activeEmoji}>🌱</Text>
          </View>
          <Text style={[styles.activeTitle, { color: colors.text }]}>You're all set!</Text>
          <Text style={[styles.activeSubtitle, { color: colors.textSecondary }]}>
            Welcome to finlit, {currentUser?.username}! Start your first lesson to earn XP.
          </Text>
          <TouchableOpacity
            style={[styles.ctaButton, { backgroundColor: colors.accent }]}
            onPress={() => setPaymentLaunched(false)}
            accessibilityRole="button"
          >
            <Text style={styles.ctaButtonText}>View Plans</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Payment launched — awaiting verification ──────────────────────────────────

  if (paymentLaunched) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.activeContainer}>
          <View style={[styles.activeCircle, { backgroundColor: colors.xpBadgeBg, borderColor: colors.xpBadgeBorder }]}>
            <Text style={styles.activeEmoji}>⏳</Text>
          </View>
          <Text style={[styles.activeTitle, { color: colors.text }]}>Verifying Payment…</Text>
          <Text style={[styles.activeSubtitle, { color: colors.textSecondary }]}>
            Complete the payment in your browser. Come back here once done — your subscription will activate automatically.
          </Text>
          <TouchableOpacity
            style={[styles.ctaButton, { backgroundColor: colors.accent }]}
            onPress={async () => {
              setLoading(true);
              await refresh();
              setLoading(false);
              setPaymentLaunched(false);
            }}
            disabled={loading}
            accessibilityRole="button"
          >
            {loading
              ? <ActivityIndicator color="#FFFFFF" size="small" />
              : <Text style={styles.ctaButtonText}>Check Status</Text>
            }
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Main plan selection ───────────────────────────────────────────────────────

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Upgrade Plan 💳</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          Unlock unlimited financial learning
        </Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Plans ─────────────────────────────────────────────────────── */}
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>CHOOSE PLAN</Text>

          {PLANS.map(plan => (
            <PlanCard
              key={plan.id}
              plan={plan}
              selected={selectedPlanId === plan.id}
              onSelect={() => setSelectedPlanId(plan.id)}
              colors={colors}
            />
          ))}

          {/* ── Paystack trust notice (paid plans only) ──────────────────── */}
          {selectedPlan.requiresPayment && (
            <View style={[styles.paystackNotice, { backgroundColor: colors.xpBadgeBg, borderColor: colors.xpBadgeBorder }]}>
              <Text style={styles.paystackEmoji} accessible={false}>🔒</Text>
              <Text style={[styles.paystackText, { color: colors.accentDark }]}>
                Payments are processed securely via{' '}
                <Text style={{ fontWeight: '800' }}>Paystack</Text>. You'll be redirected to complete checkout in your browser.
              </Text>
            </View>
          )}

          {/* ── Order summary ─────────────────────────────────────────────── */}
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>ORDER SUMMARY</Text>
          <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Plan</Text>
              <View style={styles.summaryValueRow}>
                <Text style={styles.summaryPlanEmoji} accessible={false}>{selectedPlan.emoji}</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>{selectedPlan.name}</Text>
              </View>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Billing</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{selectedPlan.period}</Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryTotalLabel, { color: colors.text }]}>Total</Text>
              <Text style={[styles.summaryTotal, { color: colors.accent }]}>{selectedPlan.price}</Text>
            </View>
          </View>

          {/* ── Error ─────────────────────────────────────────────────────── */}
          {error ? (
            <Text
              style={[styles.errorText, { color: colors.errorText }]}
              accessibilityRole="alert"
              accessibilityLiveRegion="polite"
            >
              {error}
            </Text>
          ) : null}

          {/* ── CTA ───────────────────────────────────────────────────────── */}
          <TouchableOpacity
            style={[styles.ctaButton, { backgroundColor: loading ? colors.border : colors.accent }]}
            onPress={handlePay}
            disabled={loading}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={
              selectedPlan.requiresPayment
                ? `Pay ${selectedPlan.price} via Paystack`
                : 'Get started for free'
            }
            accessibilityState={{ disabled: loading, busy: loading }}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={[styles.ctaButtonText, { color: loading ? colors.textMuted : '#FFFFFF' }]}>
                {selectedPlan.requiresPayment
                  ? `Pay ${selectedPlan.price} via Paystack →`
                  : 'Get Started Free 🌱'}
              </Text>
            )}
          </TouchableOpacity>

          <Text style={[styles.termsText, { color: colors.textMuted }]}>
            By continuing you agree to our{' '}
            <Text style={{ color: colors.accent }}>Terms of Service</Text> and{' '}
            <Text style={{ color: colors.accent }}>Privacy Policy</Text>.
            Cancel anytime.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 24, fontWeight: '800' },
  headerSubtitle: { fontSize: 14, fontWeight: '500', marginTop: 4 },

  scrollContainer: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 48 },

  sectionTitle: {
    fontSize: 12, fontWeight: '800', textTransform: 'uppercase',
    letterSpacing: 1, marginBottom: 12, paddingLeft: 4,
  },

  // Plan cards
  planCard: {
    borderRadius: 24, padding: 20, marginBottom: 12, position: 'relative',
  },
  popularBadge: {
    position: 'absolute', top: -1, right: 20,
    paddingHorizontal: 10, paddingVertical: 4,
    borderBottomLeftRadius: 8, borderBottomRightRadius: 8,
  },
  popularBadgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  planTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  planEmoji: { fontSize: 30, marginRight: 14 },
  planMeta: { flex: 1 },
  planName: { fontSize: 16, fontWeight: '800' },
  planPriceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 2 },
  planPrice: { fontSize: 20, fontWeight: '800' },
  planPeriod: { fontSize: 13, fontWeight: '500' },
  radioCircle: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  radioDot: { width: 11, height: 11, borderRadius: 6 },
  planDescription: { fontSize: 13, fontWeight: '500', lineHeight: 18, marginBottom: 12 },
  featuresSeparator: { height: 1, marginBottom: 12 },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  featureCheck: { fontSize: 13, fontWeight: '800', marginRight: 8 },
  featureText: { fontSize: 13, fontWeight: '500' },

  // Paystack notice
  paystackNotice: {
    flexDirection: 'row', alignItems: 'flex-start',
    borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 28,
  },
  paystackEmoji: { fontSize: 16, marginRight: 10, marginTop: 1 },
  paystackText: { fontSize: 13, fontWeight: '500', flex: 1, lineHeight: 18 },

  // Summary
  summaryCard: {
    borderRadius: 24, borderWidth: 1, paddingHorizontal: 20, marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 16,
  },
  summaryValueRow: { flexDirection: 'row', alignItems: 'center' },
  summaryPlanEmoji: { fontSize: 16, marginRight: 6 },
  summaryLabel: { fontSize: 14, fontWeight: '600' },
  summaryValue: { fontSize: 14, fontWeight: '700' },
  summaryDivider: { height: 1 },
  summaryTotalLabel: { fontSize: 16, fontWeight: '800' },
  summaryTotal: { fontSize: 20, fontWeight: '800' },

  // Error
  errorText: { fontSize: 14, fontWeight: '600', textAlign: 'center', marginBottom: 16 },

  // CTA
  ctaButton: {
    height: 56, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  ctaButtonText: { fontSize: 16, fontWeight: '800' },

  // Terms
  termsText: { fontSize: 12, fontWeight: '500', textAlign: 'center', lineHeight: 18 },

  // Active / success states
  activeContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32,
  },
  activeCircle: {
    width: 96, height: 96, borderRadius: 48, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  activeEmoji: { fontSize: 48 },
  activeTitle: { fontSize: 26, fontWeight: '800', marginBottom: 12, textAlign: 'center' },
  activeSubtitle: {
    fontSize: 15, fontWeight: '500', textAlign: 'center', lineHeight: 22, marginBottom: 32,
  },
  activeCard: {
    width: '100%', borderRadius: 20, borderWidth: 1,
    padding: 20, marginBottom: 24,
  },
  activeFeatureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  activeFeatureEmoji: { fontSize: 18, marginRight: 12 },
  activeFeatureText: { fontSize: 14, fontWeight: '600' },
  manageNote: { fontSize: 12, fontWeight: '500', textAlign: 'center', lineHeight: 18 },
});
