import { getTranslations } from 'next-intl/server';
import { CtaLink } from './CtaLink';
import { CTA_GHOST_ON_ACCENT, CTA_ON_ACCENT, DISPLAY_XL, SHELL } from './theme';

export async function CallToAction() {
  const t = await getTranslations('marketing');
  const lines = t.raw('cta.lines') as string[];

  return (
    <section id="cta" className="bg-[#4A8FE7] text-[#0A0A0A]">
      <div className={`${SHELL} py-20 md:py-32`}>
        <h2 className={DISPLAY_XL}>
          {lines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h2>

        <div className="mt-14 grid gap-10 border-t-4 border-[#0A0A0A] pt-10 md:grid-cols-[minmax(0,6fr)_minmax(0,6fr)] md:gap-16">
          <p className="text-lg leading-relaxed font-bold md:text-2xl md:leading-relaxed">
            {t('cta.body')}
          </p>

          <div className="flex flex-col items-stretch gap-4">
            <CtaLink href="/founding" location="cta_primary" className={CTA_ON_ACCENT}>
              {t('cta.primary')}
            </CtaLink>
            <CtaLink
              href="https://s-mitch.com"
              location="cta_secondary"
              className={CTA_GHOST_ON_ACCENT}
            >
              {t('cta.secondary')}
            </CtaLink>
            <p className="font-mono text-xs text-[#0A0A0A]/70">{t('cta.note')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
