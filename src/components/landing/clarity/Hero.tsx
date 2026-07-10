import { getTranslations } from 'next-intl/server';
import { getCorpusFigures } from '@/lib/marketing/evidence-figures';
import { formatInt } from '@/lib/marketing/format';

export async function Hero() {
  const t = await getTranslations('marketing');
  const corpus = getCorpusFigures();

  const figures: Array<{ value: string; label: string }> = [
    { value: formatInt(corpus.articleCount), label: t('figures.articlesLabel') },
    { value: formatInt(corpus.sourceCount), label: t('figures.sourcesLabel') },
    { value: formatInt(corpus.axisCount), label: t('figures.axesLabel') },
    { value: formatInt(corpus.confidence.high), label: t('figures.highConfidenceLabel') },
  ];

  return (
    <section className="mx-auto w-full max-w-5xl px-6 pt-24 pb-24 md:px-8 md:pt-32 md:pb-32">
      <p className="text-xs font-medium tracking-[0.2em] text-zinc-500 uppercase">
        {t('hero.eyebrow')}
      </p>

      <h1 className="mt-8 max-w-3xl text-4xl leading-[1.15] font-semibold tracking-tight text-balance text-zinc-900 md:text-5xl lg:text-6xl">
        {t('hero.title')}
      </h1>

      <p className="mt-8 max-w-2xl text-lg leading-relaxed text-zinc-600">{t('hero.lede')}</p>

      <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4">
        <a
          href="/founding"
          className="inline-flex items-center rounded-sm bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
        >
          {t('hero.ctaPrimary')}
        </a>
        <a
          href="#method"
          className="text-sm font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-4 transition-colors hover:decoration-zinc-900"
        >
          {t('hero.ctaSecondary')}
        </a>
      </div>

      <dl className="mt-20 grid grid-cols-2 gap-x-8 gap-y-10 border-t border-zinc-200 pt-10 md:grid-cols-4">
        {figures.map((figure) => (
          <div key={figure.label}>
            <dt className="text-xs leading-relaxed text-zinc-500">{figure.label}</dt>
            <dd className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 tabular-nums md:text-4xl">
              {figure.value}
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-10 max-w-2xl text-xs leading-relaxed text-zinc-500">{t('hero.note')}</p>
    </section>
  );
}
