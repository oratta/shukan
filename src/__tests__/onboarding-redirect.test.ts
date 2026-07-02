import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- next/navigation redirect mock（throw して制御を奪う next の挙動を模す） ---
const redirectMock = vi.fn((path: string) => {
  throw new Error(`__REDIRECT__:${path}`);
});
vi.mock('next/navigation', () => ({
  redirect: (path: string) => redirectMock(path),
}));

// --- supabase server client mock ---
const getUserMock = vi.fn();
const maybeSingleMock = vi.fn();
const createServerClientMock = vi.fn(() => ({
  auth: { getUser: getUserMock },
  from: () => ({
    select: () => ({ maybeSingle: maybeSingleMock }),
  }),
}));
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => createServerClientMock(),
}));

import { resolveOnboardingRedirect, resolveAppRedirect } from '@/lib/onboarding-guard';

beforeEach(() => {
  redirectMock.mockClear();
  getUserMock.mockReset();
  maybeSingleMock.mockReset();
  createServerClientMock.mockClear();
});

async function catchRedirect(fn: () => Promise<unknown>): Promise<string | null> {
  try {
    await fn();
    return null;
  } catch (e) {
    const msg = (e as Error).message;
    if (msg.startsWith('__REDIRECT__:')) return msg.replace('__REDIRECT__:', '');
    throw e;
  }
}

// --- /onboarding レイアウトのガード ---
describe('resolveOnboardingRedirect — /onboarding layout', () => {
  it('C-S4: 未ログインなら /login にリダイレクト', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });
    const dest = await catchRedirect(() => resolveOnboardingRedirect());
    expect(dest).toBe('/login');
  });

  it('C-S3/C-S15: profile 作成済みなら / にリダイレクト', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    maybeSingleMock.mockResolvedValue({ data: { user_id: 'u1' }, error: null });
    const dest = await catchRedirect(() => resolveOnboardingRedirect());
    expect(dest).toBe('/');
  });

  it('未作成ユーザーはリダイレクトせず onboarding を表示できる', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    maybeSingleMock.mockResolvedValue({ data: null, error: null });
    const dest = await catchRedirect(() => resolveOnboardingRedirect());
    expect(dest).toBeNull();
    expect(redirectMock).not.toHaveBeenCalled();
  });
});

// --- (app) レイアウトのガード ---
describe('resolveAppRedirect — (app) layout', () => {
  it('C-S1/C-S2: ログイン済み＋profile 未作成なら /onboarding にリダイレクト', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    maybeSingleMock.mockResolvedValue({ data: null, error: null });
    const dest = await catchRedirect(() => resolveAppRedirect());
    expect(dest).toBe('/onboarding');
  });

  it('profile 作成済みならリダイレクトしない', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    maybeSingleMock.mockResolvedValue({ data: { user_id: 'u1' }, error: null });
    const dest = await catchRedirect(() => resolveAppRedirect());
    expect(dest).toBeNull();
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it('未ログインは (app) では何もしない（middleware が /login を担う）', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });
    const dest = await catchRedirect(() => resolveAppRedirect());
    expect(dest).toBeNull();
    expect(redirectMock).not.toHaveBeenCalled();
  });
});
