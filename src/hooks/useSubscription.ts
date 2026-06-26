'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import {
  getSubscriptionForUser,
  type SubscriptionRecord,
} from '@/lib/supabase/subscriptions';
import { isEntitled } from '@/lib/billing/entitlement';

interface UseSubscriptionResult {
  subscription: SubscriptionRecord | null;
  entitled: boolean;
  loading: boolean;
}

/**
 * Reads the current user's subscription from Supabase (the source of truth,
 * design D4) and derives entitlement. UI never queries Stripe directly.
 */
export function useSubscription(): UseSubscriptionResult {
  const { user, loading: authLoading } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (authLoading) return;

    const userId = user?.id;
    const load = userId
      ? getSubscriptionForUser(userId).catch(() => null)
      : Promise.resolve(null);

    load.then((sub) => {
      if (cancelled) return;
      setSubscription(sub);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  return {
    subscription,
    entitled: isEntitled(subscription),
    loading: loading || authLoading,
  };
}
