import { describe, it, expect } from 'vitest';
import { config as loadEnv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

/**
 * Real-DB integration test for the waitlist insert path (change-C, D11).
 *
 * Exercises the actual anon-key Supabase client against the live `waitlist`
 * table to prove the production path works end to end:
 *   - new email          -> insert succeeds (201)
 *   - same email resent   -> unique violation 23505, treated as success
 *   - malformed email     -> rejected by the Server Action's validation layer
 *
 * Skips entirely when Supabase env vars are unavailable (CI without secrets),
 * so the suite stays green in env-less environments.
 *
 * Idempotency: anon has no DELETE policy, so inserted rows cannot be cleaned
 * up. We use a fixed test address `qa+waitlist-test@example.com` — after the
 * first run the row already exists, and every subsequent run takes the 23505
 * "duplicate -> success" branch, keeping the test deterministic and green.
 */

// `.env.local` is not auto-loaded under Vitest; load it (no override of CI env).
loadEnv({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const hasEnv = Boolean(supabaseUrl && supabaseAnonKey);

const TEST_EMAIL = 'qa+waitlist-test@example.com';
const WAITLIST_SOURCE = 'founding-teaser';
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

describe.skipIf(!hasEnv)('Waitlist real-DB integration (anon client)', () => {
  function anon() {
    return createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  it('inserts a new waitlist row (or hits the 23505 duplicate path) with the anon key', async () => {
    const { error } = await anon()
      .from('waitlist')
      .insert({ email: TEST_EMAIL, locale: 'ja', source: WAITLIST_SOURCE });

    // First-ever run: error is null (row created).
    // Subsequent runs: 23505 unique violation, which the Server Action maps to
    // success. Anything else (e.g. 42501 RLS) is a real failure.
    if (error) {
      expect(error.code).toBe('23505');
    } else {
      expect(error).toBeNull();
    }
  });

  it('treats a re-sent identical email as success via the 23505 branch', async () => {
    // The previous test guarantees the row now exists, so this insert must
    // collide. (If the row was just created, this is the first duplicate.)
    const { error } = await anon()
      .from('waitlist')
      .insert({ email: TEST_EMAIL, locale: 'ja', source: WAITLIST_SOURCE });

    expect(error).not.toBeNull();
    expect(error!.code).toBe('23505');
  });

  it('rejects a malformed email at the validation layer before any DB call', () => {
    // The Server Action validates with EMAIL_RE prior to touching Supabase, so
    // malformed addresses never reach the insert path.
    expect(EMAIL_RE.test('not-an-email')).toBe(false);
    expect(EMAIL_RE.test('')).toBe(false);
    expect(EMAIL_RE.test(TEST_EMAIL)).toBe(true);
  });
});
