import { describe, it, expect, vi, beforeEach } from 'vitest';

// Feedback D14: getFoundingMembershipForUser — read the caller's own founding tier
// from founding_memberships via the service-role admin client. Authorization is the
// route handler's job (it passes the auth.getUser() id); this getter only reads the
// row for the given user_id.

vi.mock('server-only', () => ({}));

// supabase-js admin client mock: .from(table).select(cols).eq(col,val).maybeSingle()
const maybeSingleMock = vi.fn();
const eqMock = vi.fn<(col: string, val: string) => { maybeSingle: typeof maybeSingleMock }>();
const selectMock = vi.fn<(cols: string) => { eq: typeof eqMock }>();
const fromMock = vi.fn<(table: string) => { select: typeof selectMock }>();

eqMock.mockReturnValue({ maybeSingle: maybeSingleMock });
selectMock.mockReturnValue({ eq: eqMock });
fromMock.mockReturnValue({ select: selectMock });

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({ from: (table: string) => fromMock(table), rpc: vi.fn() }),
}));

beforeEach(() => {
  maybeSingleMock.mockReset();
  eqMock.mockClear();
  selectMock.mockClear();
  fromMock.mockClear();
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service_role_key';
});

import { getFoundingMembershipForUser } from '@/lib/supabase/founding-admin';

describe('getFoundingMembershipForUser (D14)', () => {
  it('returns the tier from the founding_memberships row for the user', async () => {
    maybeSingleMock.mockResolvedValue({ data: { tier: 'founder_50' }, error: null });

    const tier = await getFoundingMembershipForUser('user-1');

    expect(fromMock).toHaveBeenCalledWith('founding_memberships');
    expect(eqMock).toHaveBeenCalledWith('user_id', 'user-1');
    expect(tier).toBe('founder_50');
  });

  it('returns null when the user has no membership row', async () => {
    maybeSingleMock.mockResolvedValue({ data: null, error: null });
    const tier = await getFoundingMembershipForUser('user-2');
    expect(tier).toBeNull();
  });

  it('throws when the query errors', async () => {
    maybeSingleMock.mockResolvedValue({ data: null, error: { message: 'boom' } });
    await expect(getFoundingMembershipForUser('user-3')).rejects.toThrow();
  });
});
