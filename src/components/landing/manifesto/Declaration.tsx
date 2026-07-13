import { getTranslations } from 'next-intl/server';
import { CTA_GHOST_ON_INK, CTA_ON_INK, DISPLAY_XL, EYEBROW, SHELL } from './theme';

export async function Declaration() {
  const t = await getTranslations('marketing');
  const lines = t.raw('hero.lines') as string[];

  return (
    <section id="declaration" className="bg-[#0A0A0A] text-[#FAFAFA]">
      <div className={`${SHELL} pt-16 pb-20 md:pt-28 md:pb-32`}>
        <p className={`${EYEBROW} text-[#4A8FE7]`}>{t('hero.eyebrow')}</p>

        <h1 className={`${DISPLAY_XL} mt-10`}>
          {lines.map((line, i) => (
            <span
              key={line}
              className={`block ${i === lines.length - 1 ? 'text-[#4A8FE7]' : ''}`}
            >
              {line}
            </span>
          ))}
        </h1>

        <div className="mt-14 grid gap-10 border-t-2 border-[#FAFAFA]/25 pt-10 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:gap-16">
          <p className="text-lg leading-relaxed font-medium md:text-2xl md:leading-relaxed">
            {t('hero.body')}
          </p>

          <div className="flex flex-col items-stretch gap-4">
            <a href="/founding" className={CTA_ON_INK}>
              {t('hero.ctaPrimary')}
            </a>
            <a href="#indictment" className={CTA_GHOST_ON_INK}>
              {t('hero.ctaSecondary')}
            </a>
            <p className="font-mono text-xs leading-relaxed text-[#FAFAFA]/60">
              {t('hero.note')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
