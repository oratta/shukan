"use client";

import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";
import { useEffect } from "react";

// ルートレイアウトごと落ちた場合の最終フォールバック。
// レイアウトを置き換えるため html/body を自前でレンダリングする必要がある。
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        {/* App Router はステータスコードを公開しないため 0 を渡して汎用表示にする */}
        <NextError statusCode={0} />
      </body>
    </html>
  );
}
