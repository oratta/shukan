import * as Sentry from "@sentry/nextjs";

Sentry.init({
  // DSN 未設定時（ローカル開発など）は送信しない no-op になる
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,

  // エラー監視が主目的。トレースは本番で 10% サンプリング
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,

  enabled: process.env.NODE_ENV === "production",
});
