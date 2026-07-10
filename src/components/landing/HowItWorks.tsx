import { getTranslations } from 'next-intl/server';
import { Target, FlaskConical, TrendingUp } from 'lucide-react';
import { lines } from './lines';

const STEP_ICONS = [Target, FlaskConical, TrendingUp] as const;

type Step = { label: string; desc: string };

/**
 * HowItWorks — the three real beats of the shipped onboarding, rendered in code
 * (choose a life area / KPI → science-ranked habits → impact in numbers).
 * Built from copy + icons rather than app screenshots so it stays true through
 * the #2 / #61 UI rework.
 */
export async function HowItWorks() {
  const t = await getTranslations('marketing');
  const steps = t.raw('how.steps') as Step[];

  return (
    <section id="how" className="bg-background scroll-mt-8">
      <div className="container max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="grid lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] gap-10 md:gap-16 items-start">
          <div className="space-y-6 md:space-y-8">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-tight tracking-tight text-foreground">
              {lines(t('how.title'))}
            </h2>
            <blockquote className="border-l-2 border-primary/40 pl-4 italic font-serif text-base md:text-lg leading-relaxed text-foreground/80">
              {t('how.quote')}
            </blockquote>
          </div>

          <ol className="grid sm:grid-cols-3 gap-6 md:gap-8">
            {steps.map(({ label, desc }, i) => {
              const Icon = STEP_ICONS[i % STEP_ICONS.length];
              return (
                <li
                  key={i}
                  className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6"
                >
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden
                      className="inline-flex items-center justify-center size-10 rounded-full border border-primary text-primary"
                    >
                      <Icon className="size-5" />
                    </span>
                    <span className="text-sm font-semibold text-muted-foreground tabular-nums">
                      {i + 1} / {steps.length}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground leading-snug">
                    {label}
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    {desc}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
