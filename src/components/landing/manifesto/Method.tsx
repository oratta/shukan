import { getTranslations } from 'next-intl/server';
import { DISPLAY_LG, EYEBROW, SHELL } from './theme';

type Step = { title: string; body: string };

export async function Method() {
  const t = await getTranslations('marketing');
  const steps = t.raw('method.steps') as Step[];

  return (
    <section className="bg-[#0A0A0A] text-[#FAFAFA]">
      <div className={`${SHELL} py-20 md:py-32`}>
        <p className={`${EYEBROW} text-[#4A8FE7]`}>{t('method.eyebrow')}</p>
        <h2 className={`${DISPLAY_LG} mt-8`}>{t('method.heading')}</h2>

        <ol className="mt-16 border-t-4 border-[#FAFAFA]/25">
          {steps.map((step, i) => (
            <li
              key={step.title}
              className="grid gap-4 border-b-2 border-[#FAFAFA]/25 py-10 md:grid-cols-[8rem_minmax(0,1fr)] md:gap-12 md:py-14"
            >
              <span
                aria-hidden
                className="font-mono text-6xl leading-none font-black text-[#FAFAFA]/25 md:text-8xl"
              >
                {i + 1}
              </span>
              <div className="space-y-4 md:pt-2">
                <h3 className="text-2xl leading-snug font-black md:text-4xl">{step.title}</h3>
                <p className="max-w-3xl text-base leading-relaxed text-[#FAFAFA]/70 md:text-lg">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
