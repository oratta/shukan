import { getTranslations } from 'next-intl/server';
import { Check, Minus } from 'lucide-react';
import { lines } from './lines';

type Row = { other: string; smitch: string };

/**
 * Difference — the positioning contrast from product-concept.md ("continue" apps
 * vs Smitch). This is a genuine positioning claim, not fabricated data.
 */
export async function Difference() {
  const t = await getTranslations('marketing');
  const rows = t.raw('difference.rows') as Row[];

  return (
    <section className="bg-background">
      <div className="container max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-center leading-tight tracking-tight text-foreground mb-10 md:mb-16">
          {lines(t('difference.title'))}
        </h2>

        <div className="max-w-3xl mx-auto overflow-hidden rounded-lg border border-border">
          <div className="grid grid-cols-2 text-sm font-semibold">
            <div className="bg-muted px-4 py-3 text-muted-foreground">
              {t('difference.colOther')}
            </div>
            <div className="bg-primary px-4 py-3 text-primary-foreground">
              {t('difference.colSmitch')}
            </div>
          </div>
          <ul>
            {rows.map(({ other, smitch }, i) => (
              <li key={i} className="grid grid-cols-2 border-t border-border">
                <div className="flex items-start gap-2 px-4 py-4 text-sm text-muted-foreground">
                  <Minus aria-hidden className="size-4 mt-0.5 flex-shrink-0 opacity-60" />
                  <span>{other}</span>
                </div>
                <div className="flex items-start gap-2 px-4 py-4 text-sm text-foreground bg-primary/5">
                  <Check aria-hidden className="size-4 mt-0.5 flex-shrink-0 text-primary" />
                  <span>{smitch}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
