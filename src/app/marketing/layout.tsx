import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Smitch - Switch your path',
  description: 'Evidence-based life path builder.',
};

export default function MarketingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <div lang="ja">{children}</div>;
}
