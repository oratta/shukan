import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Smitch — Switch your path.',
  description:
    'エビデンスベースのライフパスビルダー。「なりたい自分」に向かって、科学が習慣を導く。',
};

export default function MarketingLayout({
  children,
}: {
  children: ReactNode;
}) {
  // NOTE: <html> / <body> are provided by the root layout (src/app/layout.tsx).
  // This wrapper only sets the language on the LP subtree so screen readers and
  // search engines see ja content (D8-3).
  return (
    <div lang="ja" className="min-h-screen bg-background text-foreground">
      {children}
    </div>
  );
}
