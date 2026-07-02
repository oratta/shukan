/**
 * Subscriptions read access (change-A).
 *
 * Mirrors the habits.ts snake_case<->camelCase mapping convention. Reads go
 * through the anon/authenticated client, so RLS limits results to the requesting
 * user's own row (spec S12). Webhook writes live in `subscriptions-admin.ts`
 * (service role, server-only).
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Plan } from '@/lib/billing/config';
import type { SubscriptionState, SubscriptionStatus } from '@/lib/billing/entitlement';
import { createClient } from './client';

export interface SubscriptionRecord extends SubscriptionState {
  id: string;
  userId: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  cancelAtPeriodEnd: boolean;
}

export interface SubscriptionRow {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: string;
  plan: string | null;
  trial_end: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

export function rowToSubscription(row: SubscriptionRow): SubscriptionRecord {
  return {
    id: row.id,
    userId: row.user_id,
    stripeCustomerId: row.stripe_customer_id,
    stripeSubscriptionId: row.stripe_subscription_id,
    status: row.status as SubscriptionStatus,
    plan: (row.plan as Plan) ?? null,
    trialEnd: row.trial_end,
    currentPeriodEnd: row.current_period_end,
    cancelAtPeriodEnd: row.cancel_at_period_end,
  };
}

/**
 * Reads the current user's subscription row. With RLS, the anon/authenticated
 * client can only see the caller's own row, so no explicit user filter is needed
 * for security — we still pass `user_id` for an unambiguous single-row read.
 *
 * Server callers (route handlers) MUST pass their cookie-bound server client —
 * the default browser client has no auth session on the server, so RLS would
 * silently return zero rows.
 */
export async function getSubscriptionForUser(
  userId: string,
  client?: SupabaseClient
): Promise<SubscriptionRecord | null> {
  const supabase = client ?? createClient();
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return rowToSubscription(data as SubscriptionRow);
}
