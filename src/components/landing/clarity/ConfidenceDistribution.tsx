import { getTranslations } from 'next-intl/server';
import { getCorpusFigures, type ConfidenceLevel } from '@/lib/marketing/evidence-figures';
import { formatInt, formatOneDecimal } from '@/lib/marketing/format';
import { FigureNote, Section, SectionHeading } from './primitives';

const LEVELS: readonly ConfidenceLevel[] = ['high', 'medium', 'low'];
const LEVEL_INK: Record<ConfidenceLevel, string> = {
  high: '#18181b',
  medium: '#a1a1aa',
  low: '#e4e4e7',
};

export async function ConfidenceDistribution() {
  const t = await getTranslations('marketing');
  const { articleCount, confidence } = getCorpusFigures();

  const share = (count: number) => (articleCount ? (count / articleCount) * 100 : 0);

  return (
    <Section id="confidence">
      <SectionHeading title={t('confidence.heading')} lede={t('confidence.lede')} />

      <figure className="mt-16">
        <div aria-hidden className="flex h-3 w-full overflow-hidden">
          {LEVELS.filter((level) => confidence[level] > 0).map((level) => (
            <span
              key={level}
              className="h-full"
              style={{ width: `${share(confidence[level])}%`, backgroundColor: LEVEL_INK[level] }}
            />
          ))}
        </div>

        <dl className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-3">
          {LEVELS.map((level) => (
            <div key={level} className="border-t border-zinc-200 pt-5">
              <dt className="flex items-center gap-3 text-sm text-zinc-900">
                <span
                  aria-hidden
                  className="inline-block h-2 w-2 shrink-0 rounded-full ring-1 ring-zinc-300 ring-inset"
                  style={{ backgroundColor: LEVEL_INK[level] }}
                />
                {t(`confidence.${level}`)}
              </dt>
              <dd className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-semibold tracking-tight text-zinc-900 tabular-nums">
                  {formatInt(confidence[level])}
                </span>
                <span className="text-xs text-zinc-500">{t('confidence.articleUnit')}</span>
                <span className="ml-auto text-xs text-zinc-500 tabular-nums">
                  {formatOneDecimal(share(confidence[level]))}%
                </span>
              </dd>
            </div>
          ))}
        </dl>

        <figcaption className="mt-8">
          <FigureNote>{t('confidence.note')}</FigureNote>
        </figcaption>
      </figure>
    </Section>
  );
}
