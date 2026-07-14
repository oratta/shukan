import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * LP PostHog instrumentation (issue #58) — CTA click path.
 *
 * The vitest environment is `node` (no DOM), so instead of a real click we call
 * the client component as a plain function, read the `onClick` handler off the
 * returned element, and invoke it — the same tree-walk style the marketing-page
 * / paywall-gate tests use. This asserts the contract the AC cares about: a CTA
 * click calls `track('lp_cta_click', …)`. The `track()` no-op guard is verified
 * separately in lp-analytics-guard.test.ts (it must import the real module,
 * which the analytics mock below would otherwise shadow).
 */

vi.mock('@/lib/analytics', () => ({ track: vi.fn() }));

import { track } from '@/lib/analytics';
import { CtaLink } from '@/components/landing/manifesto/CtaLink';
import type { ReactElement } from 'react';

const trackMock = vi.mocked(track);

describe('CtaLink → lp_cta_click', () => {
  beforeEach(() => trackMock.mockClear());

  it('fires track("lp_cta_click") with location + href when clicked', () => {
    const el = CtaLink({
      href: '/founding',
      location: 'cta_primary',
      className: 'btn',
      children: 'Join',
    }) as ReactElement<{ onClick: () => void; href: string }>;

    // Nothing captured until the click handler runs.
    expect(trackMock).not.toHaveBeenCalled();
    expect(el.props.href).toBe('/founding');

    el.props.onClick();

    expect(trackMock).toHaveBeenCalledTimes(1);
    expect(trackMock).toHaveBeenCalledWith('lp_cta_click', {
      location: 'cta_primary',
      href: '/founding',
    });
  });

  it('tags each CTA with its own location', () => {
    const el = CtaLink({
      href: 'https://s-mitch.com',
      location: 'cta_secondary',
      children: 'Open app',
    }) as ReactElement<{ onClick: () => void }>;

    el.props.onClick();

    expect(trackMock).toHaveBeenCalledWith('lp_cta_click', {
      location: 'cta_secondary',
      href: 'https://s-mitch.com',
    });
  });
});
