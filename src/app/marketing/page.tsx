import { getTranslations } from 'next-intl/server';
import { AxisLegend } from '@/components/landing/clarity/AxisLegend';
import { ConfidenceDistribution } from '@/components/landing/clarity/ConfidenceDistribution';
import { CumulativeChart } from '@/components/landing/clarity/CumulativeChart';
import { Cta } from '@/components/landing/clarity/Cta';
import { HabitTable } from '@/components/landing/clarity/HabitTable';
import { Hero } from '@/components/landing/clarity/Hero';
import { Masthead } from '@/components/landing/clarity/Masthead';
import { MethodNote } from '@/components/landing/clarity/MethodNote';
import { References } from '@/components/landing/clarity/References';

export default async function MarketingPage() {
  const t = await getTranslations('marketing');

  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <Masthead />
      <Hero />
      <AxisLegend />
      <HabitTable />
      <CumulativeChart />
      <ConfidenceDistribution />
      <MethodNote />
      <References />
      <Cta />

      <footer className="border-t border-zinc-200">
        <div className="mx-auto w-full max-w-5xl px-6 py-10 md:px-8">
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-zinc-500">
            <span className="font-semibold text-zinc-900">Smitch</span>
            <span className="hidden sm:inline">{t('footer.tagline')}</span>
            <a href="/privacy" className="ml-auto hover:text-zinc-900">
              {t('footer.privacy')}
            </a>
            <a href="/terms" className="hover:text-zinc-900">
              {t('footer.terms')}
            </a>
            <span>{t('footer.credit')}</span>
          </nav>
        </div>
      </footer>
    </main>
  );
}
