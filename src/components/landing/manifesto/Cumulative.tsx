import { getTranslations } from 'next-intl/server';
import {
  CUMULATIVE_YEARS,
  getCumulativeDailyMinutes,
  getCumulativeSeries,
} from '@/lib/marketing/evidence-figures';
import { formatInt, formatOneDecimal } from '@/lib/marketing/format';
import { ACCENT, CTA_ON_INK, DISPLAY, DISPLAY_LG, EYEBROW, SHELL } from './theme';

const WIDTH = 720;
const HEIGHT = 300;
const PAD = { top: 24, right: 24, bottom: 44, left: 64 } as const;
const TICK_STEP_DAYS = 30;

/**
 * Proof（証拠）が示した「1 日あたりの分」を、10 年という時間で人生スケールの
 * 1 つの数字に変換する章。日次の推定値だけでは弱いと感じた読者の疑念に、
 * 累積という角度から答える。折れ線は差し色 1 色、黒地に描く。
 */
export async function Cumulative() {
  const t = await getTranslations('marketing');
  const lines = t.raw('cumulative.lines') as string[];

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

  return (
    <section id="cumulative" className="bg-[#0A0A0A] text-[#FAFAFA]">
      <div className={`${SHELL} py-20 md:py-32`}>
        <p className={`${EYEBROW} text-[#4A8FE7]`}>{t('cumulative.eyebrow')}</p>

        <div className="mt-8 grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-end md:gap-16">
          <h2 className={DISPLAY_LG}>
            {lines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>
          <p className="text-lg leading-relaxed font-medium md:text-xl md:leading-relaxed">
            {t('cumulative.lead', { minutes: formatInt(perDayMinutes) })}
          </p>
        </div>

        <div className="mt-16 grid gap-12 border-t-2 border-[#FAFAFA]/25 pt-12 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16">
          <div>
            <p className={`${EYEBROW} text-[#FAFAFA]/50`}>{t('cumulative.readoutLabel')}</p>
            <p className="mt-6 flex items-baseline gap-3">
              <span
                className={`${DISPLAY} font-mono text-7xl tabular-nums md:text-9xl`}
                style={{ color: ACCENT }}
              >
                {`+${formatInt(finalDays)}`}
              </span>
              <span className="font-mono text-lg font-bold text-[#FAFAFA]/60">
                {t('cumulative.dayUnit')}
              </span>
            </p>
            <p className="mt-8 max-w-md text-lg leading-relaxed font-bold md:text-xl">
              {t('cumulative.perYear', { perYear: formatOneDecimal(finalDays / CUMULATIVE_YEARS) })}
            </p>
            <a href="/founding" className={`${CTA_ON_INK} mt-10`}>
              {t('cumulative.cta')}
            </a>
          </div>

          <figure>
            <svg
              viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
              className="h-auto w-full"
              role="img"
              aria-labelledby="cumulative-title cumulative-desc"
            >
              <title id="cumulative-title">{t('cumulative.yAxis')}</title>
              <desc id="cumulative-desc">
                {t('cumulative.perYear', {
                  perYear: formatOneDecimal(finalDays / CUMULATIVE_YEARS),
                })}
              </desc>

              {yTicks.map((tick) => (
                <g key={tick}>
                  <line
                    x1={PAD.left}
                    x2={WIDTH - PAD.right}
                    y1={y(tick)}
                    y2={y(tick)}
                    stroke={tick === 0 ? 'rgba(250,250,250,0.5)' : 'rgba(250,250,250,0.15)'}
                  />
                  <text
                    x={PAD.left - 12}
                    y={y(tick)}
                    textAnchor="end"
                    dominantBaseline="middle"
                    fontSize="11"
                    fill="rgba(250,250,250,0.6)"
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
                  fill="rgba(250,250,250,0.6)"
                >
                  {formatInt(year)}
                </text>
              ))}

              <path d={areaPath} fill={ACCENT} fillOpacity="0.15" />
              <path d={linePath} fill="none" stroke={ACCENT} strokeWidth="3" />
              <circle cx={x(CUMULATIVE_YEARS)} cy={y(finalDays)} r="4" fill={ACCENT} />
              <text
                x={x(CUMULATIVE_YEARS)}
                y={y(finalDays) - 14}
                textAnchor="end"
                fontSize="13"
                fontWeight="700"
                fill="#FAFAFA"
              >
                {`+${formatOneDecimal(finalDays)} ${t('cumulative.dayUnit')}`}
              </text>

              <text
                x={PAD.left - 12}
                y={PAD.top - 8}
                textAnchor="end"
                fontSize="11"
                fill="rgba(250,250,250,0.6)"
              >
                {t('cumulative.dayUnit')}
              </text>
              <text
                x={WIDTH - PAD.right}
                y={HEIGHT - 8}
                textAnchor="end"
                fontSize="11"
                fill="rgba(250,250,250,0.6)"
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
                    <th scope="row">
                      {t('cumulative.yearMark', { year: formatInt(point.year) })}
                    </th>
                    <td>{formatOneDecimal(point.healthyDays)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <figcaption className="mt-6 font-mono text-xs leading-relaxed text-[#FAFAFA]/60">
              {t('cumulative.assumption')}
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
