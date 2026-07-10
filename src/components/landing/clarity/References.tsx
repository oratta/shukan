import { getTranslations } from 'next-intl/server';
import { getCorpusFigures, getReferenceGroups } from '@/lib/marketing/evidence-figures';
import { formatInt } from '@/lib/marketing/format';
import { FigureNote, Section, SectionHeading } from './primitives';

export async function References() {
  const t = await getTranslations('marketing');
  const groups = getReferenceGroups();
  const corpus = getCorpusFigures();

  return (
    <Section id="references">
      <SectionHeading title={t('references.heading')} lede={t('references.lede')} />

      <div className="mt-16 space-y-12">
        {groups.map((group) => (
          <div key={group.articleId} className="border-t border-zinc-200 pt-6">
            <h3 className="text-sm font-semibold tracking-tight text-zinc-900">
              {t(`habits.${group.articleId}`)}
            </h3>
            <ol className="mt-4 space-y-3">
              {group.sources.map((source) => (
                <li
                  key={source.id}
                  className="grid grid-cols-[1.5rem_1fr] text-xs leading-relaxed text-zinc-600"
                >
                  <span className="text-zinc-400 tabular-nums">{source.id}.</span>
                  {source.url ? (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="underline decoration-zinc-300 underline-offset-2 transition-colors hover:text-zinc-900 hover:decoration-zinc-900"
                    >
                      {source.text}
                    </a>
                  ) : (
                    <span>{source.text}</span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <FigureNote>{t('references.note', { sources: formatInt(corpus.sourceCount) })}</FigureNote>
      </div>
    </Section>
  );
}
