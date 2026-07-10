import { getTranslations } from 'next-intl/server';

type FaqItem = { q: string; a: string };

/**
 * Faq — honest answers. Covers pricing, evidence honesty, differentiation,
 * streaks, cancellation, and platform. Uses native <details> so it works
 * without client JS.
 */
export async function Faq() {
  const t = await getTranslations('marketing');
  const items = t.raw('faq.items') as FaqItem[];

  return (
    <section className="bg-background">
      <div className="container max-w-3xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-center leading-tight tracking-tight text-foreground mb-10 md:mb-16">
          {t('faq.title')}
        </h2>

        <ul className="divide-y divide-border border-y border-border">
          {items.map(({ q, a }, i) => (
            <li key={i}>
              <details className="group">
                <summary className="flex cursor-pointer items-center justify-between gap-4 py-5 text-base md:text-lg font-semibold text-foreground list-none [&::-webkit-details-marker]:hidden">
                  <span>{q}</span>
                  <span
                    aria-hidden
                    className="text-muted-foreground transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="pb-5 -mt-1 text-sm md:text-base text-muted-foreground leading-relaxed">
                  {a}
                </p>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
