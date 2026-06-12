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
 * Waitlist signup Server Action (change-C design D3).
 *
 * - Validates email format before any DB call.
 * - Persists via anon-key Supabase client with upsert(onConflict: 'email',
 *   ignoreDuplicates: true) so duplicate emails are neutralized (no error, no
 *   info leak, no extra row).
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
    const { error } = await supabase.from('waitlist').upsert(
      { email, locale, source: WAITLIST_SOURCE },
      { onConflict: 'email', ignoreDuplicates: true }
    );

    if (error) {
      return { ok: false, message: t('errorGeneric') };
    }
  } catch {
    return { ok: false, message: t('errorGeneric') };
  }

  return { ok: true, message: t('success') };
}
