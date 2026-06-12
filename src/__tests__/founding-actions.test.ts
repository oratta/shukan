import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * S7/S8/S9: Waitlist Server Action behavior.
 * Requirement: Waitlist signup persists email to Supabase.
 *
 * - Valid email: upsert called with email + locale + source; success returned.
 * - Invalid email: no insert/upsert; localized validation error.
 * - Duplicate email: upsert with ignoreDuplicates -> same success message.
 *
 * Supabase client and next-intl/server are mocked.
 */

const upsertMock = vi.fn();
const fromMock = vi.fn(() => ({ upsert: upsertMock }));
const createClientMock = vi.fn(async () => ({ from: fromMock }));

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => createClientMock(),
}));

const getLocaleMock = vi.fn(async () => 'ja');
const getTranslationsMock = vi.fn(async () => {
  // returns a t() that yields the key path so tests can distinguish messages
  return (key: string) => `founding.waitlist.${key}`;
});

vi.mock('next-intl/server', () => ({
  getLocale: () => getLocaleMock(),
  getTranslations: (...args: unknown[]) => getTranslationsMock(...(args as [])),
}));

async function importAction() {
  const mod = await import('@/app/founding/actions');
  return mod.submitWaitlist;
}

beforeEach(() => {
  upsertMock.mockReset();
  fromMock.mockClear();
  createClientMock.mockClear();
  getLocaleMock.mockClear();
  getTranslationsMock.mockClear();
  upsertMock.mockResolvedValue({ error: null });
});

function formDataWith(email: string): FormData {
  const fd = new FormData();
  fd.set('email', email);
  return fd;
}

describe('S7: Valid email is saved with locale and source', () => {
  it('upserts waitlist row with email, current locale, and a non-empty source; returns success', async () => {
    const submitWaitlist = await importAction();
    const result = await submitWaitlist({ ok: false }, formDataWith('user@example.com'));

    expect(fromMock).toHaveBeenCalledWith('waitlist');
    expect(upsertMock).toHaveBeenCalledTimes(1);

    const [rows, options] = upsertMock.mock.calls[0];
    const row = Array.isArray(rows) ? rows[0] : rows;
    expect(row.email).toBe('user@example.com');
    expect(row.locale).toBe('ja');
    expect(typeof row.source).toBe('string');
    expect(row.source.length).toBeGreaterThan(0);

    // upsert must neutralize duplicates
    expect(options).toMatchObject({ onConflict: 'email', ignoreDuplicates: true });

    expect(result.ok).toBe(true);
  });
});

describe('S8: Invalid email is rejected before insert', () => {
  it('does not call upsert and returns a localized validation error', async () => {
    const submitWaitlist = await importAction();
    const result = await submitWaitlist({ ok: false }, formDataWith('not-an-email'));

    expect(upsertMock).not.toHaveBeenCalled();
    expect(result.ok).toBe(false);
    expect(typeof result.message).toBe('string');
    expect(result.message!.length).toBeGreaterThan(0);
  });

  it('rejects an empty email without inserting', async () => {
    const submitWaitlist = await importAction();
    const result = await submitWaitlist({ ok: false }, formDataWith(''));
    expect(upsertMock).not.toHaveBeenCalled();
    expect(result.ok).toBe(false);
  });
});

describe('S9: Duplicate email is neutralized', () => {
  it('returns the same success result even when the email already exists (ignoreDuplicates)', async () => {
    const submitWaitlist = await importAction();

    const first = await submitWaitlist({ ok: false }, formDataWith('dup@example.com'));
    const second = await submitWaitlist({ ok: false }, formDataWith('dup@example.com'));

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    expect(second.message).toBe(first.message);

    // Both calls used ignoreDuplicates upsert semantics
    for (const call of upsertMock.mock.calls) {
      expect(call[1]).toMatchObject({ onConflict: 'email', ignoreDuplicates: true });
    }
  });
});
