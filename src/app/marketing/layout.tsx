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
  // <html> / <body> come from the root layout (src/app/layout.tsx). This wrapper
  // sets the language on the LP subtree from the active next-intl locale so
  // screen readers and search engines see the right language (the LP is now
  // fully ja/en, toggled via the LocaleSwitcher / `locale` cookie).
  const locale = await getLocale();
  return <div lang={locale}>{children}</div>;
}
