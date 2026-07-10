/**
 * Outbound links from the marketing LP.
 *
 * The LP is served on the marketing host (www.s-mitch.com); the running app —
 * login, onboarding diagnosis, billing — lives on the app host (s-mitch.com).
 * Relative links on the marketing host would loop back to the LP, so the
 * primary "start the app" CTA must be an absolute URL to the app origin.
 *
 * Same convention already used by the previous LP CTA and by
 * src/app/layout.tsx / sitemap.ts (which hardcode the s-mitch.com origin).
 */
export const APP_URL = 'https://s-mitch.com';

/** Founding Member program — a public route on the app host. */
export const FOUNDING_URL = 'https://s-mitch.com/founding';
