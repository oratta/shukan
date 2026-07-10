import Image from 'next/image';
import { Clock, Smartphone, Target } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { lines } from './lines';

const ICONS = [Clock, Smartphone, Target] as const;

/**
 * Problem — streak fatigue. A real user emotion, compressed to a short beat.
 * This is empathy, not a product claim, so no numbers or fabricated proof.
 */
export async function Problem() {
  const t = await getTranslations('marketing');
  const bullets = t.raw('problem.bullets') as string[];

  return (
    <section className="bg-background">
      <div className="container max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-tight tracking-tight text-foreground mb-10 md:mb-16">
          {lines(t('problem.title'))}
        </h2>

        <div className="grid lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] gap-8 md:gap-12 items-center">
          <ul className="space-y-6 md:space-y-8">
            {bullets.map((text, i) => {
              const Icon = ICONS[i % ICONS.length];
              return (
                <li key={i} className="flex items-start gap-4 md:gap-5">
                  <span
                    aria-hidden
                    className="flex-shrink-0 inline-flex items-center justify-center size-10 md:size-12 rounded-full border border-border text-foreground/70"
                  >
                    <Icon className="size-5 md:size-6" />
                  </span>
                  <p className="text-base md:text-lg leading-relaxed text-foreground pt-1.5 md:pt-2">
                    {text}
                  </p>
                </li>
              );
            })}
          </ul>

          <div className="relative aspect-[649/948] rounded-md overflow-hidden">
            <Image
              src="/landing/photo-problem-woman.png"
              alt=""
              aria-hidden
              fill
              sizes="(min-width: 1024px) 420px, 100vw"
              className="object-cover object-center"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
