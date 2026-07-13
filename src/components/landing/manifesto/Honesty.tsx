import { getTranslations } from 'next-intl/server';
import { getCorpusFigures } from '@/lib/marketing/evidence-figures';
import { formatInt } from '@/lib/marketing/format';
import { ACCENT, DISPLAY_LG, EYEBROW, SHELL } from './theme';

/**
 * 「約束しないこと」の宣言に、信頼度分布の実データを添える章。
 * high が全体の一部でしかないことを隠さず数字で見せることが、
 * この LP の信頼の閉じ方になる。分布バーは 高=差し色 / 中=黒 / 低=薄い黒。
 */
export async function Honesty() {
  const t = await getTranslations('marketing');
  const items = t.raw('honesty.items') as string[];
  const corpus = getCorpusFigures();

  // ゼロ件のカテゴリはバーにも凡例にも出さない（「低 0本」という表示は意味を持たない）。
  const segments = [
    { key: 'high' as const, count: corpus.confidence.high, color: ACCENT },
    { key: 'medium' as const, count: corpus.confidence.medium, color: '#0A0A0A' },
    { key: 'low' as const, count: corpus.confidence.low, color: 'rgba(10,10,10,0.25)' },
  ].filter((segment) => segment.count > 0);

  return (
    <section className="bg-[#FAFAFA] text-[#0A0A0A]">
      <div className={`${SHELL} py-20 md:py-32`}>
        <p className={`${EYEBROW} text-[#0A0A0A]/50`}>{t('honesty.eyebrow')}</p>
        <h2 className={`${DISPLAY_LG} mt-8`}>{t('honesty.heading')}</h2>

        <ul className="mt-14 space-y-0">
          {items.map((item) => (
            <li
              key={item}
              className="flex items-start gap-6 border-b-2 border-[#0A0A0A] py-8 first:border-t-4"
            >
              <span aria-hidden className="text-3xl leading-none font-black text-[#4A8FE7]">
                ✕
              </span>
              <p className="text-xl leading-snug font-bold md:text-3xl md:leading-snug">{item}</p>
            </li>
          ))}
        </ul>

        <p className="mt-12 max-w-3xl text-lg leading-relaxed font-medium text-[#0A0A0A]/75 md:text-xl md:leading-relaxed">
          {t('honesty.closing')}
        </p>

        {/* 誠実さを言葉で終わらせず、根拠の弱さの内訳まで実数で開示する。 */}
        <div className="mt-20 border-t-4 border-[#0A0A0A] pt-10">
          <h3 className="text-2xl leading-snug font-black md:text-4xl">
            {t('honesty.confidenceHeading')}
          </h3>
          <p className="mt-6 max-w-3xl text-base leading-relaxed text-[#0A0A0A]/75 md:text-lg">
            {t('honesty.confidenceBody', {
              articles: formatInt(corpus.articleCount),
              high: formatInt(corpus.confidence.high),
            })}
          </p>

          <figure className="mt-10">
            <div aria-hidden className="flex h-8 w-full">
              {segments.map((segment) => (
                <span
                  key={segment.key}
                  className="block h-full"
                  style={{
                    width: `${(segment.count / corpus.articleCount) * 100}%`,
                    backgroundColor: segment.color,
                  }}
                />
              ))}
            </div>
            <figcaption className="mt-4 flex flex-wrap gap-x-8 gap-y-2 font-mono text-xs text-[#0A0A0A]/75">
              <span className="sr-only">{t('honesty.distributionLabel')}</span>
              {segments.map((segment) => (
                <span key={segment.key} className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className="inline-block h-3 w-3"
                    style={{ backgroundColor: segment.color }}
                  />
                  {t(`confidence.${segment.key}`)} {formatInt(segment.count)}
                  {t('honesty.articleUnit')}
                </span>
              ))}
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
