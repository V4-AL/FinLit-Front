import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { apiService, Subscription, ModuleAccessResponse } from '../services/api';
import { useAuth } from './AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────

type SubscriptionContextType = {
  subscription: Subscription | null;
  isSubscribed: boolean;
  isLoading: boolean;
  /** Check if the user can access a specific module. Returns cached result when available. */
  checkModuleAccess: (moduleId: number) => Promise<ModuleAccessResponse>;
  /** Kick off a Paystack payment session. Returns the authorization URL. */
  initializePayment: () => Promise<string | null>;
  /** Buy a hint with available points. Refreshes subscription state. */
  buyHint: () => Promise<boolean>;
  /** Buy a life for a module. Refreshes subscription state. */
  buyLife: (moduleId: number) => Promise<boolean>;
  /** Spend a life to unlock a module. Returns true on success. */
  useLife: (moduleId: number) => Promise<boolean>;
  /** Force-refresh subscription status from the backend. */
  refresh: () => Promise<void>;
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isSubscribed = subscription?.status === 'ACTIVE';

  // Fetch status whenever a user logs in
  const refresh = useCallback(async () => {
    if (!currentUser) {
      setSubscription(null);
      return;
    }
    try {
      setIsLoading(true);
      const sub = await apiService.getSubscriptionStatus();
      setSubscription(sub);
    } catch {
      // Non-fatal — app works in degraded mode if subscription fetch fails
      setSubscription(null);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // ── Per-module access check ──────────────────────────────────────────────────

  const checkModuleAccess = useCallback(
    async (moduleId: number): Promise<ModuleAccessResponse> => {
      if (isSubscribed) return { hasAccess: true };
      try {
        return await apiService.checkModuleAccess(moduleId);
      } catch {
        // Default open if backend unreachable, to avoid blocking offline use
        return { hasAccess: true };
      }
    },
    [isSubscribed]
  );

  // ── Payment ──────────────────────────────────────────────────────────────────

const initializePayment = useCallback(async (): Promise<string | null> => {
  try {
    const result = await apiService.initializePayment();
    console.log('PAYSTACK INIT RESULT:', result);
    return result.authorization_url ?? result.authorizationUrl ?? null;
  } catch (err) {
    console.log('PAYSTACK INIT FAILED:', err);
    return null;
  }
}, []);
  // ── Hint ─────────────────────────────────────────────────────────────────────

  const buyHint = useCallback(async (): Promise<boolean> => {
    try {
      await apiService.buyHint();
      await refresh();
      return true;
    } catch {
      return false;
    }
  }, [refresh]);

  // ── Lives ────────────────────────────────────────────────────────────────────

  const buyLife = useCallback(
    async (moduleId: number): Promise<boolean> => {
      try {
        await apiService.buyLife(moduleId);
        await refresh();
        return true;
      } catch {
        return false;
      }
    },
    [refresh]
  );

  const useLife = useCallback(
    async (moduleId: number): Promise<boolean> => {
      try {
        await apiService.useLife(moduleId);
        return true;
      } catch {
        return false;
      }
    },
    []
  );

  const value = useMemo(
    () => ({
      subscription,
      isSubscribed,
      isLoading,
      checkModuleAccess,
      initializePayment,
      buyHint,
      buyLife,
      useLife,
      refresh,
    }),
    [subscription, isSubscribed, isLoading, checkModuleAccess, initializePayment, buyHint, buyLife, useLife, refresh]
  );

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) throw new Error('useSubscription must be used within a SubscriptionProvider');
  return context;
}
