import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * S13/S14: Remaining slot fetcher (change-B counter API contract).
 * Requirement: Remaining slot display shows live counts from the founding counter API.
 *
 * This HTTP fetcher is used ONLY by the client `/account` page (browser execution,
 * relative fetch needs no env). The `/founding` teaser now calls getFoundingCounts
 * directly server-side (D13). The fetcher always targets the relative path
 * `/api/founding/slots` (no absolute-URL / env resolution).
 * Contract: { founder50: { cap, claimed, remaining }, founder30: { cap, claimed, remaining } }
 * On any failure (network error, non-OK, malformed shape) it returns null so the
 * caller can omit numbers (no fake/stale values).
 */

const ORIGINAL_FETCH = global.fetch;

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  global.fetch = ORIGINAL_FETCH;
  vi.restoreAllMocks();
});

async function importFetcher() {
  const mod = await import('@/app/founding/slots');
  return mod.fetchRemainingSlots;
}

describe('S13: fetcher returns parsed slot counts on success', () => {
  it('maps a valid counter-API response to the contract shape', async () => {
    global.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        founder50: { cap: 50, claimed: 13, remaining: 37 },
        founder30: { cap: 200, claimed: 8, remaining: 192 },
      }),
    })) as unknown as typeof fetch;

    const fetchRemainingSlots = await importFetcher();
    const slots = await fetchRemainingSlots();

    expect(slots).not.toBeNull();
    expect(slots!.founder50.remaining).toBe(37);
    expect(slots!.founder30.remaining).toBe(192);
  });

  it('fetches the relative /api/founding/slots path (no absolute URL / env)', async () => {
    const calledUrls: unknown[] = [];
    const fetchSpy = vi.fn((url: unknown) => {
      calledUrls.push(url);
      return Promise.resolve({
        ok: true,
        json: async () => ({
          founder50: { cap: 50, claimed: 0, remaining: 50 },
          founder30: { cap: 200, claimed: 0, remaining: 200 },
        }),
      });
    });
    global.fetch = fetchSpy as unknown as typeof fetch;
    // Even if the legacy env vars are set, the fetcher must ignore them.
    const prevCounter = process.env.FOUNDING_COUNTER_API_URL;
    const prevApp = process.env.NEXT_PUBLIC_APP_URL;
    process.env.FOUNDING_COUNTER_API_URL = 'https://example.com/whatever';
    process.env.NEXT_PUBLIC_APP_URL = 'https://example.com';

    const fetchRemainingSlots = await importFetcher();
    await fetchRemainingSlots();

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(calledUrls[0]).toBe('/api/founding/slots');

    if (prevCounter === undefined) delete process.env.FOUNDING_COUNTER_API_URL;
    else process.env.FOUNDING_COUNTER_API_URL = prevCounter;
    if (prevApp === undefined) delete process.env.NEXT_PUBLIC_APP_URL;
    else process.env.NEXT_PUBLIC_APP_URL = prevApp;
  });
});

describe('S14: fetcher returns null on failure / unavailability', () => {
  it('returns null when fetch rejects', async () => {
    global.fetch = vi.fn(async () => {
      throw new Error('network down');
    }) as unknown as typeof fetch;

    const fetchRemainingSlots = await importFetcher();
    expect(await fetchRemainingSlots()).toBeNull();
  });

  it('returns null on a non-OK response', async () => {
    global.fetch = vi.fn(async () => ({
      ok: false,
      status: 404,
      json: async () => ({}),
    })) as unknown as typeof fetch;

    const fetchRemainingSlots = await importFetcher();
    expect(await fetchRemainingSlots()).toBeNull();
  });

  it('returns null on a malformed (missing tier) response', async () => {
    global.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ founder50: { cap: 50, claimed: 1, remaining: 49 } }),
    })) as unknown as typeof fetch;

    const fetchRemainingSlots = await importFetcher();
    expect(await fetchRemainingSlots()).toBeNull();
  });
});
