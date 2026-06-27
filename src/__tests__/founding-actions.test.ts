import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * S7/S8/S9: Waitlist Server Action behavior.
 * Requirement: Waitlist signup persists email to Supabase.
 *
 * - Valid email: insert called with email + locale + source; success returned.
 * - Invalid email: no insert; localized validation error.
 * - Duplicate email: insert raises unique violation (Postgres code 23505),
 *   which is treated as success (same message as a first-time signup).
 *
 * NOTE (D11): the action uses a bare `.insert()` rather than
 * `.upsert({ ignoreDuplicates: true })`. PostgREST turns ignoreDuplicates into
 * `INSERT ... ON CONFLICT DO NOTHING`, which Postgres can only execute if the
 * caller can SELECT the conflicting row. `waitlist` intentionally gives anon no
 * SELECT policy (email protection), so even a brand-new email fails with RLS
 * error 42501. A bare insert succeeds (201) for new emails and fails with
 * 23505 for duplicates; we map 23505 to success to neutralize duplicates
 * without leaking registration state.
 *
 * Supabase client and next-intl/server are mocked.
 */

const insertMock = vi.fn();
const fromMock = vi.fn(() => ({ insert: insertMock }));
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
  insertMock.mockReset();
  fromMock.mockClear();
  createClientMock.mockClear();
  getLocaleMock.mockClear();
  getTranslationsMock.mockClear();
  insertMock.mockResolvedValue({ error: null });
});

function formDataWith(email: string): FormData {
  const fd = new FormData();
  fd.set('email', email);
  return fd;
}

describe('S7: Valid email is saved with locale and source', () => {
  it('inserts waitlist row with email, current locale, and a non-empty source; returns success', async () => {
    const submitWaitlist = await importAction();
    const result = await submitWaitlist({ ok: false }, formDataWith('user@example.com'));

    expect(fromMock).toHaveBeenCalledWith('waitlist');
    expect(insertMock).toHaveBeenCalledTimes(1);

    const [rows] = insertMock.mock.calls[0];
    const row = Array.isArray(rows) ? rows[0] : rows;
    expect(row.email).toBe('user@example.com');
    expect(row.locale).toBe('ja');
    expect(typeof row.source).toBe('string');
    expect(row.source.length).toBeGreaterThan(0);

    expect(result.ok).toBe(true);
  });
});

describe('S8: Invalid email is rejected before insert', () => {
  it('does not call insert and returns a localized validation error', async () => {
    const submitWaitlist = await importAction();
    const result = await submitWaitlist({ ok: false }, formDataWith('not-an-email'));

    expect(insertMock).not.toHaveBeenCalled();
    expect(result.ok).toBe(false);
    expect(typeof result.message).toBe('string');
    expect(result.message!.length).toBeGreaterThan(0);
  });

  it('rejects an empty email without inserting', async () => {
    const submitWaitlist = await importAction();
    const result = await submitWaitlist({ ok: false }, formDataWith(''));
    expect(insertMock).not.toHaveBeenCalled();
    expect(result.ok).toBe(false);
  });
});

describe('S9: Duplicate email is neutralized', () => {
  it('treats a unique-violation (23505) as success with the same message as a first-time signup', async () => {
    const submitWaitlist = await importAction();

    // First insert: succeeds (new email).
    insertMock.mockResolvedValueOnce({ error: null });
    const first = await submitWaitlist({ ok: false }, formDataWith('dup@example.com'));

    // Second insert: Postgres unique violation on email.
    insertMock.mockResolvedValueOnce({ error: { code: '23505', message: 'duplicate key value' } });
    const second = await submitWaitlist({ ok: false }, formDataWith('dup@example.com'));

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    expect(second.message).toBe(first.message);
  });
});

describe('Other DB errors are surfaced as a generic failure', () => {
  it('returns a generic error when insert fails with a non-23505 code', async () => {
    const submitWaitlist = await importAction();
    insertMock.mockResolvedValueOnce({ error: { code: '42501', message: 'rls violation' } });

    const result = await submitWaitlist({ ok: false }, formDataWith('blocked@example.com'));
    expect(result.ok).toBe(false);
    expect(typeof result.message).toBe('string');
    expect(result.message!.length).toBeGreaterThan(0);
  });
});
