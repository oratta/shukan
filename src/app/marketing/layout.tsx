import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import type { ReactNode } from 'react';

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
  // search engines see the served locale (D8-3). The copy now comes from the
  // next-intl `marketing` namespace, so the language follows the locale cookie
  // rather than being pinned to ja.
  const locale = await getLocale();

  return (
    <div lang={locale} className="min-h-screen bg-[#0A0A0A]">
      {children}
    </div>
  );
}
