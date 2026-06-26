import 'server-only';

/**
 * Service-role writes for billing state (change-A, design D4).
 *
 * This module is server-only (`import 'server-only'` blocks client-bundle
 * inclusion). It uses the Supabase service role key, which bypasses RLS, and is
 * the ONLY write path for the `subscriptions` and `stripe_events` tables. The
 * webhook handler and the card-free trial start are the only callers.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Plan } from '@/lib/billing/config';
import type { SubscriptionStatus } from '@/lib/billing/entitlement';

let cached: SupabaseClient | null = null;

function admin(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for service-role billing writes.'
    );
  }
  cached = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return cached;
}

// --- Idempotency (design D2) ---

export async function isEventProcessed(eventId: string): Promise<boolean> {
  const { data, error } = await admin()
    .from('stripe_events')
    .select('event_id')
    .eq('event_id', eventId)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

export async function markEventProcessed(eventId: string, type: string): Promise<void> {
  const { error } = await admin()
    .from('stripe_events')
    .upsert({ event_id: eventId, type }, { onConflict: 'event_id' });
  if (error) throw error;
}

// --- subscriptions writes ---

export interface UpsertSubscriptionInput {
  userId: string;
  status: SubscriptionStatus;
  plan: Plan;
  stripeCustomerId: string;
  stripeSubscriptionId: string | null;
  currentPeriodEnd: string | null;
}

export async function upsertSubscriptionFromEvent(
  input: UpsertSubscriptionInput
): Promise<void> {
  const { error } = await admin()
    .from('subscriptions')
    .upsert(
      {
        user_id: input.userId,
        status: input.status,
        plan: input.plan,
        stripe_customer_id: input.stripeCustomerId,
        stripe_subscription_id: input.stripeSubscriptionId,
        current_period_end: input.currentPeriodEnd,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );
  if (error) throw error;
}

export interface SubscriptionPatch {
  status?: SubscriptionStatus;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: boolean;
}

export async function updateSubscriptionByStripeId(
  stripeSubscriptionId: string,
  patch: SubscriptionPatch
): Promise<void> {
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.currentPeriodEnd !== undefined) row.current_period_end = patch.currentPeriodEnd;
  if (patch.cancelAtPeriodEnd !== undefined) row.cancel_at_period_end = patch.cancelAtPeriodEnd;

  const { error } = await admin()
    .from('subscriptions')
    .update(row)
    .eq('stripe_subscription_id', stripeSubscriptionId);
  if (error) throw error;
}

// --- trial start (card-free, design D3) ---

export interface InsertTrialInput {
  userId: string;
  status: 'trialing';
  trialEnd: string;
}

export async function insertTrialRow(input: InsertTrialInput): Promise<void> {
  const { error } = await admin()
    .from('subscriptions')
    .upsert(
      {
        user_id: input.userId,
        status: input.status,
        trial_end: input.trialEnd,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );
  if (error) throw error;
}
