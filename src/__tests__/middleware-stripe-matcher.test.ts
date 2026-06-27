import { describe, it, expect, vi } from 'vitest';

// change-A S9: Webhook bypasses auth middleware
// Tasks: 3.6
// The middleware matcher MUST NOT include any pattern matching /api/stripe/*,
// so unauthenticated Stripe webhook servers can reach /api/stripe/webhook.

vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({ auth: { getUser: async () => ({ data: { user: null } }) } }),
}));

import { config } from '@/middleware';

describe('middleware matcher excludes /api/stripe (S9)', () => {
  it('exposes a config.matcher array', () => {
    expect(Array.isArray(config.matcher)).toBe(true);
  });

  it('does not include /api/stripe/:path* or any /api/stripe pattern', () => {
    const patterns = config.matcher as string[];
    for (const p of patterns) {
      expect(p).not.toContain('/api/stripe');
      expect(p).not.toContain('/api/:path');
      // No root-level global catch-all that would swallow /api/stripe
      expect(p).not.toBe('/:path*');
      expect(p).not.toBe('/(.*)');
    }
  });

  it('does not match the webhook path against any matcher entry', () => {
    const patterns = config.matcher as string[];
    const webhookPath = '/api/stripe/webhook';
    // Convert the simplified Next matcher syntax to a test: a literal or :path* prefix
    const matchesWebhook = patterns.some((p) => {
      const base = p.replace(/\/:path\*$/, '');
      if (p.endsWith('/:path*')) return webhookPath === base || webhookPath.startsWith(base + '/');
      return webhookPath === p;
    });
    expect(matchesWebhook).toBe(false);
  });
});
