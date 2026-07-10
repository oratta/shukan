import { getTranslations } from 'next-intl/server';
import { lines } from './lines';
import { APP_URL, FOUNDING_URL } from './links';

/**
 * Cta — the close, aligned with reality.
 *
 * The old LP showed a "coming soon" waitlist form that saved nothing and called
 * the live product a "Concept Prototype". The app is in fact live (Stripe +
 * Founding). So the primary CTA opens the real app, and the honest early-adopter
 * substitute for a (removed) fabricated testimonial is the real Founding Member
 * program, whose waitlist persists to Supabase on /founding.
 */
export async function Cta() {
  const t = await getTranslations('marketing');

  return (
    <section id="cta" className="bg-primary text-primary-foreground">
      <div className="container max-w-3xl mx-auto px-4 md:px-8 py-16 md:py-24 text-center space-y-8">
        <h2 className="font-serif text-3xl md:text-5xl leading-tight tracking-tight">
          {lines(t('cta.title'))}
        </h2>
        <p className="text-base md:text-lg opacity-80 leading-relaxed">{t('cta.body')}</p>

        <div className="pt-2">
          <a
            href={APP_URL}
            className="inline-flex items-center justify-center rounded-md bg-primary-foreground px-8 py-3 text-sm font-semibold text-primary hover:opacity-90 transition"
          >
            {t('cta.ctaPrimary')}
          </a>
        </div>

        <div className="pt-8 mt-4 border-t border-primary-foreground/20 space-y-3">
          <p className="text-sm font-semibold uppercase tracking-widest opacity-90">
            {t('cta.foundingHeading')}
          </p>
          <p className="text-sm opacity-80 leading-relaxed max-w-xl mx-auto">
            {t('cta.foundingBody')}
          </p>
          <a
            href={FOUNDING_URL}
            className="inline-flex items-center justify-center rounded-md border border-primary-foreground/30 bg-transparent px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-foreground/10 transition"
          >
            {t('cta.foundingCta')} →
          </a>
        </div>
      </div>
    </section>
  );
}
