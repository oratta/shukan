import { describe, it, expect, vi, beforeEach } from 'vitest';

// change-B S12: Anonymous client fetches aggregate counts
// change-B S13: Counter response shape is the cross-change contract
// change-B S14: Counter response is short-cached (10-30s)
// change-B S15: Counter reflects a consumed slot
// Tasks: 4.1, 4.2, 4.3

vi.mock('server-only', () => ({}));

const getFoundingCountsMock = vi.fn();
vi.mock('@/lib/supabase/founding-admin', () => ({
  getFoundingCounts: (...a: unknown[]) => getFoundingCountsMock(...a),
}));

beforeEach(() => {
  getFoundingCountsMock.mockReset();
});

import { GET } from '@/app/api/founding/slots/route';

describe('GET /api/founding/slots (S12/S13/S14)', () => {
  it('S13: returns the cross-change contract shape', async () => {
    getFoundingCountsMock.mockResolvedValue({
      founder50: { cap: 50, claimed: 10, remaining: 40 },
      founder30: { cap: 200, claimed: 5, remaining: 195 },
    });
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({
      founder50: { cap: 50, claimed: 10, remaining: 40 },
      founder30: { cap: 200, claimed: 5, remaining: 195 },
    });
  });

  it('S12: response carries no personal data (only cap/claimed/remaining keys)', async () => {
    getFoundingCountsMock.mockResolvedValue({
      founder50: { cap: 50, claimed: 10, remaining: 40 },
      founder30: { cap: 200, claimed: 5, remaining: 195 },
    });
    const res = await GET();
    const body = await res.json();
    const serialized = JSON.stringify(body);
    expect(serialized).not.toMatch(/user_id|userId|email|claimed_at/i);
    expect(Object.keys(body.founder50).sort()).toEqual(['cap', 'claimed', 'remaining']);
    expect(Object.keys(body.founder30).sort()).toEqual(['cap', 'claimed', 'remaining']);
  });

  it('S14: sets a Cache-Control revalidation window between 10 and 30 seconds', async () => {
    getFoundingCountsMock.mockResolvedValue({
      founder50: { cap: 50, claimed: 0, remaining: 50 },
      founder30: { cap: 200, claimed: 0, remaining: 200 },
    });
    const res = await GET();
    const cacheControl = res.headers.get('cache-control') ?? '';
    const sMaxage = Number(/s-maxage=(\d+)/.exec(cacheControl)?.[1]);
    expect(sMaxage).toBeGreaterThanOrEqual(10);
    expect(sMaxage).toBeLessThanOrEqual(30);
    expect(cacheControl).toMatch(/stale-while-revalidate=\d+/);
  });

  it('S15: a consumed slot lowers the remaining count in the response', async () => {
    getFoundingCountsMock.mockResolvedValueOnce({
      founder50: { cap: 50, claimed: 10, remaining: 40 },
      founder30: { cap: 200, claimed: 0, remaining: 200 },
    });
    const before = await (await GET()).json();
    expect(before.founder50.remaining).toBe(40);

    getFoundingCountsMock.mockResolvedValueOnce({
      founder50: { cap: 50, claimed: 11, remaining: 39 },
      founder30: { cap: 200, claimed: 0, remaining: 200 },
    });
    const after = await (await GET()).json();
    expect(after.founder50.remaining).toBe(39);
  });

  it('returns 503 without leaking detail if the aggregate fetch fails', async () => {
    getFoundingCountsMock.mockRejectedValue(new Error('db down'));
    const res = await GET();
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(JSON.stringify(body)).not.toMatch(/db down/);
  });
});
