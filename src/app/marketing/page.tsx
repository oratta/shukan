import {
  ctaLabel,
  footerCredit,
  heroSubcopy,
  problemText,
  solutionText,
  tagline,
} from './copy';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://s-mitch.com';

export default function MarketingPage() {
  const loginHref = `${APP_URL}/login`;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto w-full max-w-2xl px-4 py-16 space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">{tagline}</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {heroSubcopy}
        </p>
        <a
          href={loginHref}
          className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          {ctaLabel}
        </a>
      </section>

      <section className="mx-auto w-full max-w-2xl px-4 py-12 space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">これで意味があるのか、と感じたことは？</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{problemText}</p>
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">「なりたい自分」から、科学が習慣を導く。</h2>
          <p className="text-sm leading-relaxed text-foreground">{solutionText}</p>
        </div>
      </section>

      <footer className="mx-auto w-full max-w-2xl px-4 py-10 border-t border-border text-xs text-muted-foreground">
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <a href="/privacy" className="hover:underline">
            Privacy
          </a>
          <a href="/terms" className="hover:underline">
            Terms
          </a>
          <span className="ml-auto">{footerCredit}</span>
        </nav>
      </footer>
    </main>
  );
}
