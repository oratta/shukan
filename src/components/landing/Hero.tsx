import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { lines } from './lines';
import { APP_URL } from './links';

/**
 * Hero — the promise. Evidence chooses the habits; the goal is who you become.
 *
 * No app-screenshot mock here: the running onboarding/home UI is being reworked
 * (#2 / #61), so any screenshot would misrepresent the product and go stale.
 * We keep an editorial people photo (not an app screen) for warmth, and let the
 * headline + trust line carry the positioning.
 */
export async function Hero() {
  const t = await getTranslations('marketing');

  return (
    <section className="bg-background">
      <div className="container max-w-6xl mx-auto px-4 md:px-8 pt-4 md:pt-8 pb-16 md:pb-24">
        <div className="grid lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)] gap-8 md:gap-12 items-center">
          <div className="space-y-6 md:space-y-8">
            <p className="text-xs md:text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              {t('hero.eyebrow')}
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-tight tracking-tight text-foreground">
              {lines(t('hero.title'))}
            </h1>
            <p className="text-base md:text-lg text-foreground/80 leading-relaxed">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button size="lg" asChild>
                <a href={APP_URL}>{t('hero.ctaPrimary')}</a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#how">{t('hero.ctaSecondary')}</a>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground pt-2">{t('hero.trust')}</p>
          </div>

          <div className="relative aspect-[7/6] lg:aspect-[6/5] order-first lg:order-none">
            <Image
              src="/landing/photo-hero-man.png"
              alt=""
              aria-hidden
              fill
              sizes="(min-width: 1024px) 560px, 100vw"
              className="object-cover object-center rounded-md"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
