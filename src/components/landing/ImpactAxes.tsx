import { getTranslations } from 'next-intl/server';
import { HeartPulse, Smile, PiggyBank, Coins } from 'lucide-react';
import { lines } from './lines';

const AXIS_ICONS = [HeartPulse, Smile, PiggyBank, Coins] as const;

type Axis = { label: string; desc: string };

/**
 * ImpactAxes — the four KPI axes the app actually computes (health / mood /
 * cost / income). We show the axes and what they mean, but deliberately show NO
 * fabricated per-user numbers. The 景表法 note (#39) makes the "estimate, varies,
 * not guaranteed" framing explicit and adjacent to the claim.
 */
export async function ImpactAxes() {
  const t = await getTranslations('marketing');
  const axes = t.raw('impact.axes') as Axis[];

  return (
    <section className="bg-background">
      <div className="container max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-center leading-tight tracking-tight text-foreground mb-10 md:mb-16">
          {lines(t('impact.title'))}
        </h2>

        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {axes.map(({ label, desc }, i) => {
            const Icon = AXIS_ICONS[i % AXIS_ICONS.length];
            return (
              <li
                key={i}
                className="flex flex-col items-center text-center gap-3 rounded-lg border border-border bg-card p-6"
              >
                <span
                  aria-hidden
                  className="inline-flex items-center justify-center size-12 rounded-full bg-primary/10 text-primary"
                >
                  <Icon className="size-6" />
                </span>
                <h3 className="text-base md:text-lg font-semibold text-foreground leading-snug">
                  {label}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </li>
            );
          })}
        </ul>

        <p className="mt-8 md:mt-10 text-center text-xs md:text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          {t('impact.note')}
        </p>
      </div>
    </section>
  );
}
