'use server';

import { getLocale, getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';

export type WaitlistState = {
  ok: boolean;
  message?: string;
};

const WAITLIST_SOURCE = 'founding-teaser';

// Server-side email validation (the strict layer; the DB CHECK is a looser net).
// Intentionally simple and permissive about valid addresses while rejecting
// obviously malformed input.
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/**
 * Waitlist signup Server Action (change-C design D3, fixed by D11).
 *
 * - Validates email format before any DB call.
 * - Persists via anon-key Supabase client with a bare `insert()`. A duplicate
 *   email raises a Postgres unique violation (code 23505) which we treat as
 *   success, neutralizing duplicates without leaking registration state.
 *
 *   We deliberately do NOT use `upsert({ ignoreDuplicates: true })`: PostgREST
 *   compiles that into `INSERT ... ON CONFLICT DO NOTHING`, which Postgres can
 *   only run if the caller can SELECT the conflicting row. The `waitlist` table
 *   gives anon no SELECT policy (email protection), so even a brand-new email
 *   fails with RLS error 42501. A bare insert avoids the conflict-read path.
 * - Records the visitor's current next-intl locale and a source identifier.
 * - All visitor-facing messages are localized.
 */
export async function submitWaitlist(
  _prevState: WaitlistState,
  formData: FormData
): Promise<WaitlistState> {
  const t = await getTranslations('founding.waitlist');
  const email = String(formData.get('email') ?? '').trim();

  if (!email || !EMAIL_RE.test(email)) {
    return { ok: false, message: t('errorInvalid') };
  }

  const locale = await getLocale();

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('waitlist')
      .insert({ email, locale, source: WAITLIST_SOURCE });

    // 23505 = unique_violation: the email is already on the waitlist. Treat it
    // as success so we neither error nor leak that the address is registered.
    if (error && error.code !== '23505') {
      return { ok: false, message: t('errorGeneric') };
    }
  } catch {
    return { ok: false, message: t('errorGeneric') };
  }

  return { ok: true, message: t('success') };
}
