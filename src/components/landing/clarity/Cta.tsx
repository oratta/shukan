import { getTranslations } from 'next-intl/server';
import { Section } from './primitives';

export async function Cta() {
  const t = await getTranslations('marketing');

  return (
    <Section id="start">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-semibold tracking-tight text-balance text-zinc-900 md:text-4xl">
          {t('cta.heading')}
        </h2>
        <p className="mt-6 text-base leading-relaxed text-zinc-600">{t('cta.body')}</p>

        <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4">
          <a
            href="/founding"
            className="inline-flex items-center rounded-sm bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
          >
            {t('cta.primary')}
          </a>
          <a
            href="https://s-mitch.com"
            className="text-sm font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-4 transition-colors hover:decoration-zinc-900"
          >
            {t('cta.secondary')}
          </a>
        </div>

        <p className="mt-8 text-xs leading-relaxed text-zinc-500">{t('cta.note')}</p>
      </div>
    </Section>
  );
}
