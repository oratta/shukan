import { describe, it, expect, vi, beforeEach } from 'vitest';

// Feedback D14: GET /api/founding/membership.
// Authenticated inside the handler via supabase.auth.getUser() — the SAME authz as
// /api/stripe/checkout. The middleware matcher is NOT extended. Returns
// { tier: 'founder_50' | 'founder_30' | null } for the caller's own membership.

const getUserMock = vi.fn();
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({ auth: { getUser: getUserMock } }),
}));

const getFoundingMembershipForUserMock = vi.fn();
vi.mock('@/lib/supabase/founding-admin', () => ({
  getFoundingMembershipForUser: (...a: unknown[]) => getFoundingMembershipForUserMock(...a),
}));

beforeEach(() => {
  getUserMock.mockReset();
  getFoundingMembershipForUserMock.mockReset();
});

import { GET } from '@/app/api/founding/membership/route';

describe('GET /api/founding/membership (D14)', () => {
  it('returns 401 when there is no authenticated user', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });
    const res = await GET();
    expect(res.status).toBe(401);
    expect(getFoundingMembershipForUserMock).not.toHaveBeenCalled();
  });

  it('returns { tier: null } for an authenticated user without a membership', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    getFoundingMembershipForUserMock.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ tier: null });
    expect(getFoundingMembershipForUserMock).toHaveBeenCalledWith('user-1');
  });

  it('returns the locked tier for an authenticated member', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'user-2' } } });
    getFoundingMembershipForUserMock.mockResolvedValue('founder_30');
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ tier: 'founder_30' });
  });

  it('does not leak personal data beyond the tier field', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'user-3' } } });
    getFoundingMembershipForUserMock.mockResolvedValue('founder_50');
    const res = await GET();
    const body = await res.json();
    expect(Object.keys(body)).toEqual(['tier']);
  });
});
