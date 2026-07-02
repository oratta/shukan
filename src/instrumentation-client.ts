import * as Sentry from "@sentry/nextjs";
import posthog from 'posthog-js';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,

  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,

  integrations: [Sentry.replayIntegration()],

  // 通常セッションは記録せず、エラー発生セッションのみ Replay を送る
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,

  enabled: process.env.NODE_ENV === "production",
});

// App Router のルーター遷移を計測
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

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
