import { getTranslations } from 'next-intl/server';
import { AXIS_INK, type AxisKey } from './tokens';
import { Section, SectionHeading } from './primitives';

const AXES: readonly AxisKey[] = ['health', 'cost', 'income', 'mood'];

export async function AxisLegend() {
  const t = await getTranslations('marketing');

  return (
    <Section id="axes">
      <SectionHeading title={t('axes.heading')} lede={t('axes.lede')} />

      <dl className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-2">
        {AXES.map((axis) => (
          <div key={axis} className="border-t border-zinc-200 pt-6">
            <dt className="flex items-baseline gap-3">
              <span
                aria-hidden
                className="inline-block h-2 w-2 shrink-0 translate-y-[-1px] rounded-full"
                style={{ backgroundColor: AXIS_INK[axis] }}
              />
              <span className="text-base font-semibold tracking-tight text-zinc-900">
                {t(`axes.${axis}.name`)}
              </span>
              <span className="ml-auto text-xs text-zinc-500 tabular-nums">
                {t(`axes.${axis}.unit`)}
              </span>
            </dt>
            <dd className="mt-3 text-sm leading-relaxed text-zinc-600">
              {t(`axes.${axis}.description`)}
            </dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
