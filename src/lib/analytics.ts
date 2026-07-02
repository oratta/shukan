'use client';

import posthog from 'posthog-js';

/**
 * Anonymous product analytics (issue #17).
 *
 * All capture goes through this module so the rest of the app never
 * imports posthog-js directly. Every function is a safe no-op when
 * PostHog is not initialized (NEXT_PUBLIC_POSTHOG_KEY unset).
 *
 * Privacy rules:
 * - identify only with the Supabase user id (opaque UUID) — no email/name
 * - never send free text (habit names, notes, reflection comments)
 */

export type AnalyticsEvent =
  | 'habit_created'
  | 'habit_updated'
  | 'habit_archived'
  | 'habit_deleted'
  | 'habit_status_set'
  | 'quit_daily_done'
  | 'urge_flow_started'
  | 'urge_flow_completed'
  | 'rocket_used'
  | 'reflection_saved';

function ready(): boolean {
  return typeof window !== 'undefined' && !!posthog.__loaded;
}

export function track(
  event: AnalyticsEvent,
  properties?: Record<string, string | number | boolean | null>
): void {
  if (!ready()) return;
  posthog.capture(event, properties);
}

export function identifyUser(userId: string): void {
  if (!ready()) return;
  if (posthog.get_distinct_id() === userId) return;
  posthog.identify(userId);
}

export function resetAnalytics(): void {
  if (!ready()) return;
  posthog.reset();
}
