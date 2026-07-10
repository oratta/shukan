import { getTranslations } from 'next-intl/server';
import { DISPLAY_XL, EYEBROW, SHELL } from './theme';

export async function Turn() {
  const t = await getTranslations('marketing');
  const lines = t.raw('turn.lines') as string[];

  return (
    <section className="bg-[#4A8FE7] text-[#0A0A0A]">
      <div className={`${SHELL} py-20 md:py-32`}>
        <p className={`${EYEBROW} text-[#0A0A0A]/70`}>{t('turn.eyebrow')}</p>

        <p className={`${DISPLAY_XL} mt-10`}>
          {lines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </p>

        <p className="mt-12 max-w-3xl border-t-4 border-[#0A0A0A] pt-8 text-xl leading-relaxed font-bold md:text-3xl md:leading-relaxed">
          {t('turn.body')}
        </p>
      </div>
    </section>
  );
}
