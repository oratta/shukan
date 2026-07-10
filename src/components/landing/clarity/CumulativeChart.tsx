import { getTranslations } from 'next-intl/server';
import {
  CUMULATIVE_YEARS,
  getCumulativeDailyMinutes,
  getCumulativeSeries,
} from '@/lib/marketing/evidence-figures';
import { formatInt, formatOneDecimal } from '@/lib/marketing/format';
import { AXIS_INK, RULE } from './tokens';
import { FigureNote, Section, SectionHeading } from './primitives';

const WIDTH = 720;
const HEIGHT = 300;
const PAD = { top: 24, right: 24, bottom: 44, left: 64 } as const;
const TICK_STEP_DAYS = 30;

export async function CumulativeChart() {
  const t = await getTranslations('marketing');

  const series = getCumulativeSeries();
  const perDayMinutes = getCumulativeDailyMinutes();
  const finalDays = series[series.length - 1].healthyDays;

  // Y 軸の上限は 30 日刻みで最終値の直上に取る（データを切らない・余白を作りすぎない）。
  const yMax = Math.ceil(finalDays / TICK_STEP_DAYS) * TICK_STEP_DAYS;
  const yTicks = Array.from({ length: yMax / TICK_STEP_DAYS + 1 }, (_, i) => i * TICK_STEP_DAYS);
  const xTicks = Array.from({ length: CUMULATIVE_YEARS / 2 + 1 }, (_, i) => i * 2);

  const plotWidth = WIDTH - PAD.left - PAD.right;
  const plotHeight = HEIGHT - PAD.top - PAD.bottom;
  const x = (year: number) => PAD.left + (year / CUMULATIVE_YEARS) * plotWidth;
  const y = (days: number) => HEIGHT - PAD.bottom - (days / yMax) * plotHeight;

  const line = series.map((p) => `${x(p.year).toFixed(1)},${y(p.healthyDays).toFixed(1)}`);
  const linePath = `M${line.join('L')}`;
  const areaPath = `${linePath}L${x(CUMULATIVE_YEARS).toFixed(1)},${(HEIGHT - PAD.bottom).toFixed(1)}L${x(0).toFixed(1)},${(HEIGHT - PAD.bottom).toFixed(1)}Z`;

  const readout = t('cumulative.readout', {
    days: formatOneDecimal(finalDays),
    perYear: formatOneDecimal(finalDays / CUMULATIVE_YEARS),
  });

  return (
    <Section id="cumulative">
      <SectionHeading
        title={t('cumulative.heading')}
        lede={t('cumulative.lede', { minutes: formatInt(perDayMinutes) })}
      />

      <figure className="mt-16">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="h-auto w-full"
          role="img"
          aria-labelledby="cumulative-title cumulative-desc"
        >
          <title id="cumulative-title">{t('cumulative.yAxis')}</title>
          <desc id="cumulative-desc">{readout}</desc>

          {yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={PAD.left}
                x2={WIDTH - PAD.right}
                y1={y(tick)}
                y2={y(tick)}
                stroke={tick === 0 ? '#a1a1aa' : RULE}
              />
              <text
                x={PAD.left - 12}
                y={y(tick)}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize="11"
                fill="#71717a"
              >
                {formatInt(tick)}
              </text>
            </g>
          ))}

          {xTicks.map((year) => (
            <text
              key={year}
              x={x(year)}
              y={HEIGHT - PAD.bottom + 20}
              textAnchor="middle"
              fontSize="11"
              fill="#71717a"
            >
              {formatInt(year)}
            </text>
          ))}

          <path d={areaPath} fill={AXIS_INK.health} fillOpacity="0.08" />
          <path d={linePath} fill="none" stroke={AXIS_INK.health} strokeWidth="2" />
          <circle cx={x(CUMULATIVE_YEARS)} cy={y(finalDays)} r="3.5" fill={AXIS_INK.health} />
          <text
            x={x(CUMULATIVE_YEARS)}
            y={y(finalDays) - 14}
            textAnchor="end"
            fontSize="13"
            fontWeight="600"
            fill="#18181b"
          >
            {`${formatOneDecimal(finalDays)} ${t('cumulative.dayUnit')}`}
          </text>

          <text x={PAD.left - 12} y={PAD.top - 8} textAnchor="end" fontSize="11" fill="#71717a">
            {t('cumulative.dayUnit')}
          </text>
          <text
            x={WIDTH - PAD.right}
            y={HEIGHT - 8}
            textAnchor="end"
            fontSize="11"
            fill="#71717a"
          >
            {t('cumulative.xAxis')}
          </text>
        </svg>

        {/* スクリーンリーダー向けに図と同じ値を表として提供する。 */}
        <table className="sr-only">
          <caption>{t('cumulative.yAxis')}</caption>
          <thead>
            <tr>
              <th scope="col">{t('cumulative.xAxis')}</th>
              <th scope="col">{t('cumulative.yAxis')}</th>
            </tr>
          </thead>
          <tbody>
            {series.map((point) => (
              <tr key={point.year}>
                <th scope="row">{t('cumulative.yearMark', { year: formatInt(point.year) })}</th>
                <td>{formatOneDecimal(point.healthyDays)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <figcaption className="mt-8 space-y-3">
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-900">{readout}</p>
          <FigureNote>{t('cumulative.assumption')}</FigureNote>
        </figcaption>
      </figure>
    </Section>
  );
}
