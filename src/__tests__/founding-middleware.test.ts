import { describe, it, expect, vi } from 'vitest';

/**
 * S4 (change-C): Middleware matcher is unchanged.
 * Requirement: Founding teaser page is publicly accessible without authentication.
 *
 * `/founding` must stay OUTSIDE the middleware matcher so no Supabase session
 * check or `/login` redirect applies. We assert the exported config.matcher does
 * not include any entry that would match `/founding`.
 */

vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({ auth: { getUser: vi.fn() } }),
}));

import { config } from '@/middleware';

describe('S4: Middleware matcher does not include /founding', () => {
  it('config.matcher has no entry matching /founding', () => {
    const matcher = config.matcher as string[];
    expect(Array.isArray(matcher)).toBe(true);

    // No literal /founding entry
    expect(matcher.some((m) => m.includes('/founding'))).toBe(false);

    // None of the path patterns would match the /founding pathname.
    const matchesFounding = (pattern: string): boolean => {
      // Convert Next.js matcher syntax (`:path*`) to a loose regex.
      const regexStr =
        '^' +
        pattern
          .replace(/\/:path\*/g, '(?:/.*)?')
          .replace(/\/:[^/]+/g, '/[^/]+') +
        '$';
      return new RegExp(regexStr).test('/founding');
    };
    for (const pattern of matcher) {
      expect(matchesFounding(pattern), `matcher "${pattern}" must not match /founding`).toBe(false);
    }
  });
});
