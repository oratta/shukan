import type { Metadata } from 'next';
import type { ReactNode } from 'react';

const TITLE = 'Founding Members — Smitch';
const DESCRIPTION =
  'Join Smitch early as a Founding Member and keep a permanent discount. Quiet, honest, no fake urgency.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
};

export default function FoundingLayout({ children }: { children: ReactNode }) {
  // <html> / <body> are provided by the root layout (src/app/layout.tsx).
  return (
    <div className="min-h-screen bg-background text-foreground">{children}</div>
  );
}
