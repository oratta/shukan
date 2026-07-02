import * as Sentry from "@sentry/nextjs";

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
