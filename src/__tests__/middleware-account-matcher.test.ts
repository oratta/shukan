import { describe, it, expect, vi } from 'vitest';

// billing-integration D8: /account is in the (app) route group and needs the
// same authenticated protection as /settings. The middleware matcher is an
// explicit allowlist, so /account must be added to it. This test guards both
// that addition and that the existing protected paths remain covered.

vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({ auth: { getUser: async () => ({ data: { user: null } }) } }),
}));

import { config } from '@/middleware';

function matches(pathname: string, patterns: string[]): boolean {
  return patterns.some((p) => {
    if (p.endsWith('/:path*')) {
      const base = p.replace(/\/:path\*$/, '');
      return pathname === base || pathname.startsWith(base + '/');
    }
    return pathname === p;
  });
}

describe('middleware matcher protects /account (billing-integration)', () => {
  const patterns = config.matcher as string[];

  it('includes an /account allowlist entry', () => {
    expect(matches('/account', patterns)).toBe(true);
  });

  it('protects /account sub-paths (e.g. ?upgrade= deep links resolve under /account)', () => {
    expect(matches('/account/anything', patterns)).toBe(true);
  });

  it('keeps existing protected paths (/settings, /, /stats, /discover)', () => {
    expect(matches('/settings', patterns)).toBe(true);
    expect(matches('/stats', patterns)).toBe(true);
    expect(matches('/discover', patterns)).toBe(true);
    expect(matches('/', patterns)).toBe(true);
  });

  it('still excludes /api/stripe/* (webhook must bypass auth — change-A S9)', () => {
    expect(matches('/api/stripe/webhook', patterns)).toBe(false);
  });
});
