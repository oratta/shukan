import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { getLocale } from 'next-intl/server';

const TITLE = 'Smitch — Switch your path.';
const DESCRIPTION =
  'エビデンスベースのライフパスビルダー。「なりたい自分」に向かって、科学が習慣を導く。';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  // metadataBase makes relative image paths absolute in og:image / twitter:image (D3).
  metadataBase: new URL('https://www.s-mitch.com'),
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/',
    images: ['/og-image.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/og-image.png'],
  },
};

export default async function MarketingLayout({
  children,
}: {
  children: ReactNode;
}) {
  // NOTE: <html> / <body> are provided by the root layout (src/app/layout.tsx).
  // This wrapper only sets the language on the LP subtree so screen readers and
  // search engines see the rendered locale (D8-3).
  //
  // The LP is a permanently light surface: it opts out of the app's dark theme by
  // pinning its own colours instead of inheriting the semantic tokens.
  const locale = await getLocale();

  return (
    <div lang={locale} className="min-h-screen bg-white text-zinc-900">
      {children}
    </div>
  );
}
