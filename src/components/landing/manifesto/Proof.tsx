import { getTranslations } from 'next-intl/server';
import {
  getColumnMaxima,
  getCorpusFigures,
  getFeaturedHabits,
  getOutlierHabit,
  type HabitFigure,
} from '@/lib/marketing/evidence-figures';
import { formatInt, formatOneDecimal } from '@/lib/marketing/format';
import { ACCENT, DISPLAY, DISPLAY_LG, EYEBROW, SHELL } from './theme';

/**
 * Turn（転回）が「数字から始めろ」と言い切った直後に、実際の数字で受ける章。
 *
 * 数値はすべて evidence-figures 経由でアプリ本体のエビデンス記事データセット
 * から導出する。この章にハードコードされた効果の数値は 1 つも無い。
 * 見せ方は Manifesto の流儀（罫線・ベタ塗り・mono 数字）に従い、
 * 棒はすべて差し色 1 色で塗る。
 */

const COLUMNS: ReadonlyArray<{ axis: 'health' | 'cost' | 'income' | 'mood'; pick: (row: HabitFigure) => number }> = [
  { axis: 'health', pick: (row) => row.healthMinutes },
  { axis: 'cost', pick: (row) => row.costSaving },
  { axis: 'income', pick: (row) => row.incomeGain },
  { axis: 'mood', pick: (row) => row.positiveMoodMinutes },
];

function Bar({ ratio }: { ratio: number }) {
  return (
    <span aria-hidden className="mt-2 block h-[3px] w-full max-w-24 bg-[#0A0A0A]/10">
      <span
        className="block h-full"
        style={{ width: `${Math.round(ratio * 100)}%`, backgroundColor: ACCENT }}
      />
    </span>
  );
}

export async function Proof() {
  const t = await getTranslations('marketing');
  const lines = t.raw('proof.lines') as string[];

  const rows = getFeaturedHabits();
  const maxima = getColumnMaxima(rows);
  const outlier = getOutlierHabit();
  const corpus = getCorpusFigures();

  const maxFor = (axis: (typeof COLUMNS)[number]['axis']): number =>
    axis === 'health'
      ? maxima.healthMinutes
      : axis === 'cost'
        ? maxima.costSaving
        : axis === 'income'
          ? maxima.incomeGain
          : maxima.positiveMoodMinutes;

  const outlierRatio = maxima.healthMinutes
    ? formatOneDecimal(outlier.healthMinutes / maxima.healthMinutes)
    : '—';

  // 3 つ目の「手で書いた効果数値 0」は evidence-figures 層の設計そのものの言明。
  // LP 上の効果数値はすべてデータセット由来で、手書きの数字は構造的に存在しない。
  const stats = [
    { label: t('proof.stats.articles'), value: corpus.articleCount, unit: t('proof.stats.articlesUnit') },
    { label: t('proof.stats.sources'), value: corpus.sourceCount, unit: t('proof.stats.sourcesUnit') },
    { label: t('proof.stats.handwritten'), value: 0, unit: t('proof.stats.handwrittenUnit') },
  ];

  return (
    <section id="proof" className="bg-[#FAFAFA] text-[#0A0A0A]">
      <div className={`${SHELL} py-20 md:py-32`}>
        <p className={`${EYEBROW} text-[#0A0A0A]/50`}>{t('proof.eyebrow')}</p>

        <div className="mt-8 grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-end md:gap-16">
          <h2 className={DISPLAY_LG}>
            {lines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>
          <p className="text-lg leading-relaxed font-medium md:text-xl md:leading-relaxed">
            {t('proof.lead')}
          </p>
        </div>

        {/* コーパスの実数。信頼の担保はここでは言葉ではなく分量で示す。 */}
        <dl className="mt-16 grid border-t-4 border-[#0A0A0A] sm:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="border-b-2 border-[#0A0A0A] py-8 sm:border-b-0 sm:border-r-2 sm:py-10 sm:pr-8 sm:last:border-r-0 sm:[&:not(:first-child)]:pl-8"
            >
              <dt className={`${EYEBROW} text-[#0A0A0A]/50`}>{stat.label}</dt>
              <dd className="mt-4 flex items-baseline gap-2">
                <span className={`${DISPLAY} font-mono text-5xl tabular-nums md:text-7xl`}>
                  {formatInt(stat.value)}
                </span>
                <span className="font-mono text-sm font-bold text-[#0A0A0A]/60">{stat.unit}</span>
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-20 -mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
          <table className="w-full min-w-[46rem] border-collapse border-t-4 border-[#0A0A0A] text-left">
            <thead>
              <tr className="border-b-2 border-[#0A0A0A]">
                <th scope="col" className={`${EYEBROW} py-4 pr-6 text-[#0A0A0A]/50`}>
                  {t('proof.colHabit')}
                </th>
                {COLUMNS.map(({ axis }) => (
                  <th key={axis} scope="col" className="py-4 pr-6 align-bottom">
                    <span className="block text-sm font-black">{t(`axes.${axis}.name`)}</span>
                    <span className="mt-1 block font-mono text-xs text-[#0A0A0A]/50">
                      {t(`axes.${axis}.unit`)}
                    </span>
                  </th>
                ))}
                <th scope="col" className={`${EYEBROW} py-4 text-right text-[#0A0A0A]/50`}>
                  {t('proof.colConfidence')}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b-2 border-[#0A0A0A]/15">
                  <th
                    scope="row"
                    className="py-5 pr-6 text-base font-black whitespace-nowrap md:text-lg"
                  >
                    {t(`habits.${row.id}`)}
                  </th>
                  {COLUMNS.map(({ axis, pick }) => {
                    const value = pick(row);
                    const max = maxFor(axis);
                    return (
                      <td key={axis} className="py-5 pr-6 align-top">
                        <span className="block font-mono text-xl font-bold tabular-nums md:text-2xl">
                          {formatInt(value)}
                        </span>
                        <Bar ratio={max ? value / max : 0} />
                      </td>
                    );
                  })}
                  <td className="py-5 text-right font-mono text-xs whitespace-nowrap text-[#0A0A0A]/60">
                    {t(`confidence.${row.confidence}`)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className="mt-8 max-w-3xl space-y-2 font-mono text-xs leading-relaxed text-[#0A0A0A]/60">
          <li>{t('proof.barNote')}</li>
          <li>{t('proof.moodZeroNote')}</li>
          <li>
            {t('proof.caption', {
              articles: formatInt(corpus.articleCount),
              sources: formatInt(corpus.sourceCount),
            })}
          </li>
          <li>{t('proof.disclaimer')}</li>
        </ul>

        {/* 外れ値は軸を歪めないよう表から外し、単独の見出しで示す。 */}
        <aside className="mt-20 grid gap-8 border-t-4 border-[#0A0A0A] pt-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-16">
          <div>
            <p className={`${EYEBROW} text-[#0A0A0A]/50`}>{t('proof.outlier.eyebrow')}</p>
            <h3 className="mt-6 text-3xl leading-tight font-black md:text-5xl">
              {t('proof.outlier.heading')}
            </h3>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-[#0A0A0A]/75 md:text-lg">
              {t('proof.outlier.body', {
                value: formatInt(outlier.healthMinutes),
                ratio: outlierRatio,
              })}
            </p>
          </div>
          <p className="flex items-baseline gap-3 md:justify-end">
            <span
              className={`${DISPLAY} font-mono text-7xl tabular-nums md:text-9xl`}
              style={{ color: ACCENT }}
            >
              {formatInt(outlier.healthMinutes)}
            </span>
            <span className="font-mono text-sm font-bold text-[#0A0A0A]/60">
              {t('proof.outlier.unit')}
            </span>
          </p>
        </aside>
      </div>
    </section>
  );
}
