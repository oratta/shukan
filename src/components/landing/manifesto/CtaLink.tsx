'use client';

import type { ReactNode } from 'react';
import { track } from '@/lib/analytics';

/**
 * Client wrapper for the LP's conversion CTAs (issue #58).
 *
 * The manifesto sections are Server Components, so they cannot attach a click
 * handler. This thin client component renders the same anchor but fires a
 * `lp_cta_click` event on click, tagged with the `location` of the CTA (which
 * section the visitor clicked from) and its `href` destination. That lets us
 * read the LP funnel per section — something posthog-js autocapture cannot do
 * reliably because `mask_all_element_attributes` strips href/text.
 *
 * `track()` is a safe no-op when PostHog is not initialized (no
 * NEXT_PUBLIC_POSTHOG_KEY), so this never throws in local/preview builds.
 */
export function CtaLink({
  href,
  location,
  className,
  children,
}: {
  href: string;
  /** Which CTA on the page — e.g. 'masthead', 'declaration', 'cta_primary'. */
  location: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      className={className}
      onClick={() => track('lp_cta_click', { location, href })}
    >
      {children}
    </a>
  );
}
