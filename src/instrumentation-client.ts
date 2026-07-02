import posthog from 'posthog-js';

// Anonymous analytics (issue #17). No-op when the key is not configured
// (local dev without PostHog, preview builds, etc.).
const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;

if (key) {
  posthog.init(key, {
    api_host: '/ingest',
    ui_host: process.env.NEXT_PUBLIC_POSTHOG_UI_HOST || 'https://us.posthog.com',
    defaults: '2025-05-24', // capture_pageview: 'history_change' — App Router SPA navigation
    person_profiles: 'identified_only',
    // Keep measurement anonymous: never capture on-screen text (habit names, notes)
    mask_all_text: true,
    mask_all_element_attributes: true,
  });
}
