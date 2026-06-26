/**
 * Card-free trial start (change-A, design D3).
 *
 * Starting a trial creates a `subscriptions` row with `status: trialing` and
 * `trial_end = now + configured days`, WITHOUT creating any Stripe object or
 * requiring payment details. The trial lives entirely in the DB; entitlement is
 * evaluated from `trial_end` (see entitlement.ts).
 */

import { getTrialDays } from './config';
import { insertTrialRow } from '@/lib/supabase/subscriptions-admin';

export async function startTrial(userId: string, now: Date = new Date()): Promise<void> {
  const days = getTrialDays();
  const trialEnd = new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
  await insertTrialRow({ userId, status: 'trialing', trialEnd });
}
