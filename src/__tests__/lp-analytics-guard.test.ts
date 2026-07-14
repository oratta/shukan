import { describe, it, expect, vi } from 'vitest';

/**
 * analytics.track() no-op guard (issue #58 AC).
 *
 * When NEXT_PUBLIC_POSTHOG_KEY is unset, instrumentation-client.ts never calls
 * posthog.init(), so `posthog.__loaded` stays falsy. track() must then be a
 * pure no-op: it may not throw and may not call posthog.capture(). This is what
 * keeps the new LP events safe in local dev and preview builds. Kept in its own
 * file (and not mocking @/lib/analytics) so it exercises the REAL module.
 */

const { capture } = vi.hoisted(() => ({ capture: vi.fn() }));

vi.mock('posthog-js', () => ({
  default: { __loaded: undefined, capture },
}));

import { track } from '@/lib/analytics';

describe('track() guard when PostHog is not initialized', () => {
  it('does not throw and does not capture', () => {
    expect(() => track('lp_cta_click', { location: 'masthead' })).not.toThrow();
    expect(() => track('waitlist_submitted', { source: 'founding-teaser' })).not.toThrow();
    expect(capture).not.toHaveBeenCalled();
  });
});
