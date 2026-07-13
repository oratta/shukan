import { getTranslations } from 'next-intl/server';
import { DISPLAY_LG, EYEBROW, SHELL } from './theme';

const KPI_KEYS = ['health', 'cost', 'income', 'mood'] as const;

/**
 * 転回（順番を逆にする）を受けて、「なりたい自分」への変化を何で測るのか＝
 * 4つの KPI をひとつずつ解説する章。表示順は続く証拠テーブルの列順と揃える。
 * 章末の問いかけが、次章「これが、その数字。」への橋渡しになる。
 */
export async function Kpis() {
  const t = await getTranslations('marketing');
  const lines = t.raw('kpis.lines') as string[];

  return (
    <section id="kpis" className="bg-[#0A0A0A] text-[#FAFAFA]">
      <div className={`${SHELL} py-20 md:py-32`}>
        <p className={`${EYEBROW} text-[#4A8FE7]`}>{t('kpis.eyebrow')}</p>

        <div className="mt-8 grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-end md:gap-16">
          <h2 className={DISPLAY_LG}>
            {lines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>
          <p className="text-lg leading-relaxed font-medium md:text-xl md:leading-relaxed">
            {t('kpis.lead')}
          </p>
        </div>

        <ol className="mt-16 border-t-4 border-[#FAFAFA]/25">
          {KPI_KEYS.map((key, i) => (
            <li
              key={key}
              className="grid gap-4 border-b-2 border-[#FAFAFA]/25 py-10 md:grid-cols-[6rem_minmax(0,1fr)] md:gap-10 md:py-12"
            >
              <span aria-hidden className="font-mono text-4xl font-black text-[#4A8FE7] md:text-5xl">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <span className="text-2xl leading-snug font-black md:text-4xl">
                    {t(`axes.${key}.name`)}
                  </span>
                  <span className="font-mono text-sm text-[#FAFAFA]/50">
                    {t(`axes.${key}.unit`)}
                  </span>
                </h3>
                <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#FAFAFA]/70 md:text-lg">
                  {t(`axes.${key}.description`)}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <p className="mt-12 max-w-3xl text-lg leading-relaxed font-bold md:text-2xl md:leading-relaxed">
          {t('kpis.closing')}
        </p>
      </div>
    </section>
  );
}
