import { getTranslations } from 'next-intl/server';
import { DISPLAY_LG, EYEBROW, SHELL } from './theme';

export async function ImpactAxes() {
  const t = await getTranslations('marketing');
  const lines = t.raw('impact.lines') as string[];
  const axes = t.raw('impact.axes') as string[];

  return (
    <section className="bg-[#FAFAFA] text-[#0A0A0A]">
      <div className={`${SHELL} py-20 md:py-32`}>
        <p className={`${EYEBROW} text-[#0A0A0A]/50`}>{t('impact.eyebrow')}</p>

        <div className="mt-8 grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-end md:gap-16">
          <h2 className={DISPLAY_LG}>
            {lines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>
          <p className="text-lg leading-relaxed font-medium md:text-xl md:leading-relaxed">
            {t('impact.lead')}
          </p>
        </div>

        {/* 実測値は各ユーザーの入力からしか出ないので、ここでは軸の名前だけを示す。 */}
        <ul className="mt-16 border-t-4 border-[#0A0A0A]">
          {axes.map((axis, i) => (
            <li
              key={axis}
              className="flex flex-wrap items-baseline gap-x-6 gap-y-2 border-b-2 border-[#0A0A0A] py-6 md:py-8"
            >
              <span aria-hidden className="font-mono text-lg font-bold text-[#4A8FE7]">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="text-3xl leading-none font-black md:text-6xl">{axis}</span>
            </li>
          ))}
        </ul>

        <p className="mt-8 max-w-3xl font-mono text-xs leading-relaxed text-[#0A0A0A]/60 md:text-sm">
          {t('impact.disclaimer')}
        </p>
      </div>
    </section>
  );
}
