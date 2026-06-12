import { getTranslations } from 'next-intl/server';
import { WaitlistForm } from './waitlist-form';
import { fetchRemainingSlots, type TierCount } from './slots';

type FaqItem = { q: string; a: string };

export default async function FoundingPage() {
  const t = await getTranslations('founding');
  const slots = await fetchRemainingSlots();
  const faqItems = (t.raw('faq.items') as FaqItem[]) ?? [];

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="mx-auto w-full max-w-2xl px-4 py-16 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {t('hero.eyebrow')}
        </p>
        <h1 className="text-2xl font-bold tracking-tight leading-snug">
          {t('hero.title')}
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {t('hero.subtitle')}
        </p>
      </section>

      {/* Tier benefits */}
      <section className="mx-auto w-full max-w-2xl px-4 py-12 space-y-6">
        <h2 className="text-lg font-semibold">{t('tiers.heading')}</h2>
        <div className="space-y-4">
          {renderTierCard({
            name: t('tiers.founder50.name'),
            discountLabel: t('tiers.founder50.discountLabel'),
            description: t('tiers.founder50.description'),
            capWording: t('tiers.founder50.capWording'),
            remainingLabel: t('tiers.remainingLabel'),
            soldOutLabel: t('tiers.soldOutLabel'),
            count: slots?.founder50 ?? null,
          })}
          {renderTierCard({
            name: t('tiers.founder30.name'),
            discountLabel: t('tiers.founder30.discountLabel'),
            description: t('tiers.founder30.description'),
            capWording: t('tiers.founder30.capWording'),
            remainingLabel: t('tiers.remainingLabel'),
            soldOutLabel: t('tiers.soldOutLabel'),
            count: slots?.founder30 ?? null,
          })}
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {t('tiers.note')}
        </p>
      </section>

      {/* CS-priority promise */}
      <section className="mx-auto w-full max-w-2xl px-4 py-12 space-y-3">
        <h2 className="text-lg font-semibold">{t('promise.heading')}</h2>
        <p className="text-sm leading-relaxed text-foreground">{t('promise.body')}</p>
      </section>

      {/* Waitlist form */}
      <section className="mx-auto w-full max-w-2xl px-4 py-12 space-y-4">
        <h2 className="text-lg font-semibold">{t('waitlist.heading')}</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {t('waitlist.description')}
        </p>
        <WaitlistForm />
      </section>

      {/* FAQ */}
      <section className="mx-auto w-full max-w-2xl px-4 py-12 space-y-6">
        <h2 className="text-lg font-semibold">{t('faq.heading')}</h2>
        <dl className="space-y-6">
          {faqItems.map((item, i) => (
            <div key={i} className="space-y-2">
              <dt className="text-sm font-semibold text-foreground">{item.q}</dt>
              <dd className="text-sm leading-relaxed text-muted-foreground">{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <footer className="mx-auto w-full max-w-2xl px-4 py-10 border-t border-border text-xs text-muted-foreground">
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <a href="/privacy" className="hover:underline">
            Privacy
          </a>
          <a href="/terms" className="hover:underline">
            Terms
          </a>
          <span className="ml-auto">© Genetta Inc.</span>
        </nav>
      </footer>
    </main>
  );
}

// Rendered inline (not as a nested component) so the section's text — including
// the discount labels and the live remaining count — is part of this tree.
function renderTierCard({
  name,
  discountLabel,
  description,
  capWording,
  remainingLabel,
  soldOutLabel,
  count,
}: {
  name: string;
  discountLabel: string;
  description: string;
  capWording: string;
  remainingLabel: string;
  soldOutLabel: string;
  count: TierCount | null;
}) {
  return (
    <div className="rounded-2xl border border-border p-5 space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-base font-semibold">{name}</h3>
        <span className="text-sm font-semibold text-primary">{discountLabel}</span>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      <p className="text-xs text-muted-foreground">{capWording}</p>
      {/* Remaining count: shown only when live API data is available. Never a literal. */}
      {count ? (
        <p className="text-sm font-medium text-foreground">
          {count.remaining > 0
            ? `${remainingLabel}: ${count.remaining}`
            : soldOutLabel}
        </p>
      ) : null}
    </div>
  );
}
