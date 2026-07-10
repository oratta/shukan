import { getTranslations } from 'next-intl/server';
import { SmitchLogo } from '@/components/ui/smitch-logo';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { Hero } from '@/components/landing/Hero';
import { Problem } from '@/components/landing/Problem';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { ImpactAxes } from '@/components/landing/ImpactAxes';
import { Difference } from '@/components/landing/Difference';
import { Evidence } from '@/components/landing/Evidence';
import { Faq } from '@/components/landing/Faq';
import { Cta } from '@/components/landing/Cta';

export default async function MarketingPage() {
  const t = await getTranslations('marketing');

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="container max-w-6xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <SmitchLogo height={26} />
          <LocaleSwitcher />
        </div>
      </header>

      <Hero />
      <Problem />
      <HowItWorks />
      <ImpactAxes />
      <Difference />
      <Evidence />
      <Faq />
      <Cta />

      <footer className="bg-background border-t border-border">
        <div className="container max-w-6xl mx-auto px-4 md:px-8 py-8 text-xs text-muted-foreground">
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="font-semibold">Smitch</span>
            <span className="hidden sm:inline opacity-60">Switch your path.</span>
            <a href="/privacy" className="ml-auto hover:underline">
              {t('footer.privacy')}
            </a>
            <a href="/terms" className="hover:underline">
              {t('footer.terms')}
            </a>
            <a href="/tokushoho" className="hover:underline">
              {t('footer.tokushoho')}
            </a>
            <span>© Genetta Inc.</span>
          </nav>
        </div>
      </footer>
    </main>
  );
}
