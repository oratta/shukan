import { getTranslations } from 'next-intl/server';
import { DISPLAY_LG, EYEBROW, SHELL } from './theme';

export async function Honesty() {
  const t = await getTranslations('marketing');
  const items = t.raw('honesty.items') as string[];

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
      </div>
    </section>
  );
}
