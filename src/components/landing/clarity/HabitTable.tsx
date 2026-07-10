import { getTranslations } from 'next-intl/server';
import {
  getColumnMaxima,
  getCorpusFigures,
  getFeaturedHabits,
  getOutlierHabit,
  type HabitFigure,
} from '@/lib/marketing/evidence-figures';
import { formatInt, formatOneDecimal } from '@/lib/marketing/format';
import { AXIS_INK, TRACK, type AxisKey } from './tokens';
import { FigureNote, Section, SectionHeading } from './primitives';

const COLUMNS: ReadonlyArray<{ axis: AxisKey; pick: (row: HabitFigure) => number }> = [
  { axis: 'health', pick: (row) => row.healthMinutes },
  { axis: 'cost', pick: (row) => row.costSaving },
  { axis: 'income', pick: (row) => row.incomeGain },
  { axis: 'mood', pick: (row) => row.positiveMoodMinutes },
];

function Bar({ ratio, ink }: { ratio: number; ink: string }) {
  return (
    <span
      aria-hidden
      className="ml-3 hidden h-[3px] w-24 shrink-0 md:inline-block"
      style={{ backgroundColor: TRACK }}
    >
      <span
        className="block h-full"
        style={{ width: `${Math.round(ratio * 100)}%`, backgroundColor: ink }}
      />
    </span>
  );
}

export async function HabitTable() {
  const t = await getTranslations('marketing');
  const rows = getFeaturedHabits();
  const maxima = getColumnMaxima(rows);
  const outlier = getOutlierHabit();
  const corpus = getCorpusFigures();

  const maxFor = (axis: AxisKey): number =>
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

  return (
    <Section id="habits">
      <SectionHeading title={t('table.heading')} lede={t('table.lede')} />

      <div className="mt-16 -mx-6 overflow-x-auto px-6 md:mx-0 md:px-0">
        <table className="w-full min-w-[42rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-zinc-300">
              <th
                scope="col"
                className="py-3 pr-6 text-xs font-medium tracking-wide text-zinc-500"
              >
                {t('table.colHabit')}
              </th>
              {COLUMNS.map(({ axis }) => (
                <th key={axis} scope="col" className="py-3 pr-6 align-bottom">
                  <span className="block text-xs font-medium tracking-wide text-zinc-900">
                    {t(`axes.${axis}.name`)}
                  </span>
                  <span className="mt-1 block text-[0.6875rem] text-zinc-500 tabular-nums">
                    {t(`axes.${axis}.unit`)}
                  </span>
                </th>
              ))}
              <th
                scope="col"
                className="py-3 text-right text-xs font-medium tracking-wide text-zinc-500"
              >
                {t('table.colConfidence')}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-zinc-200">
                <th
                  scope="row"
                  className="py-4 pr-6 text-sm font-normal whitespace-nowrap text-zinc-900"
                >
                  {t(`habits.${row.id}`)}
                </th>
                {COLUMNS.map(({ axis, pick }) => {
                  const value = pick(row);
                  const max = maxFor(axis);
                  return (
                    <td key={axis} className="py-4 pr-6">
                      <span className="flex items-center">
                        <span className="w-14 text-right text-sm text-zinc-900 tabular-nums">
                          {formatInt(value)}
                        </span>
                        <Bar ratio={max ? value / max : 0} ink={AXIS_INK[axis]} />
                      </span>
                    </td>
                  );
                })}
                <td className="py-4 text-right text-xs whitespace-nowrap text-zinc-500">
                  {t(`confidence.${row.confidence}`)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 space-y-3">
        <FigureNote>
          {t('table.caption', {
            articles: formatInt(corpus.articleCount),
            sources: formatInt(corpus.sourceCount),
          })}
        </FigureNote>
        <FigureNote>{t('table.moodZeroNote')}</FigureNote>
      </div>

      <aside className="mt-16 border-l-2 border-zinc-900 pl-6">
        <h3 className="text-sm font-semibold tracking-tight text-zinc-900">
          {t('table.outlierHeading')}
        </h3>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600">
          {t('table.outlierBody', {
            value: formatInt(outlier.healthMinutes),
            ratio: outlierRatio,
          })}
        </p>
        <p className="mt-6 flex items-baseline gap-3">
          <span className="text-4xl font-semibold tracking-tight text-zinc-900 tabular-nums">
            {formatInt(outlier.healthMinutes)}
          </span>
          <span className="text-xs text-zinc-500">{t('table.outlierUnit')}</span>
        </p>
      </aside>
    </Section>
  );
}
