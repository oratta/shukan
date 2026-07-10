import { getTranslations } from 'next-intl/server';
import { MODEL_PROFILE } from '@/lib/marketing/evidence-figures';
import { formatInt } from '@/lib/marketing/format';
import { Section, SectionHeading } from './primitives';

export async function MethodNote() {
  const t = await getTranslations('marketing');

  const profile: Array<{ label: string; value: string }> = [
    {
      label: t('method.profileAgeLabel'),
      value: t('method.profileAgeValue', { age: formatInt(MODEL_PROFILE.age) }),
    },
    {
      label: t('method.profileIncomeLabel'),
      value: t('method.profileIncomeValue', { income: formatInt(MODEL_PROFILE.annualIncome) }),
    },
    {
      label: t('method.profileLifeLabel'),
      value: t('method.profileLifeValue', {
        years: formatInt(MODEL_PROFILE.remainingLifeExpectancy),
      }),
    },
  ];

  return (
    <Section id="method">
      <SectionHeading title={t('method.heading')} lede={t('method.lede')} />

      <div className="mt-16 grid gap-x-16 gap-y-12 md:grid-cols-2">
        <div>
          <h3 className="text-xs font-medium tracking-[0.2em] text-zinc-500 uppercase">
            {t('method.profileHeading')}
          </h3>
          <dl className="mt-6">
            {profile.map((row) => (
              <div
                key={row.label}
                className="flex items-baseline justify-between gap-6 border-b border-zinc-200 py-4"
              >
                <dt className="text-sm text-zinc-500">{row.label}</dt>
                <dd className="text-sm text-zinc-900 tabular-nums">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <h3 className="text-xs font-medium tracking-[0.2em] text-zinc-500 uppercase">
            {t('method.formulaHeading')}
          </h3>
          <ul className="mt-6 space-y-4">
            <li className="border-b border-zinc-200 py-4 font-mono text-xs leading-relaxed text-zinc-900">
              {t('method.formulaAnnual')}
            </li>
            <li className="border-b border-zinc-200 py-4 font-mono text-xs leading-relaxed text-zinc-900">
              {t('method.formulaCumulative')}
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-16 max-w-2xl border-l-2 border-zinc-300 pl-6">
        <h3 className="text-sm font-semibold tracking-tight text-zinc-900">
          {t('method.caveatHeading')}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-zinc-600">{t('method.caveat')}</p>
      </div>
    </Section>
  );
}
