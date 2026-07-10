import { getTranslations } from 'next-intl/server';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { EYEBROW, SHELL } from './theme';

export async function Masthead() {
  const t = await getTranslations('marketing');

  return (
    <header className="bg-[#0A0A0A] text-[#FAFAFA]">
      <div
        className={`${SHELL} flex items-center justify-between gap-4 border-b-2 border-[#FAFAFA]/25 py-5`}
      >
        {/* ブランドマークの SVG は濃紺なので黒地では沈む。ここは字だけで名乗る。 */}
        <span className="text-xl font-black tracking-[0.2em]">SMITCH</span>

        <div className="flex items-center gap-4">
          <div className="[&_button]:text-[#FAFAFA] [&_button:hover]:bg-[#FAFAFA]/10">
            <LocaleSwitcher />
          </div>
          <a
            href="/founding"
            className={`${EYEBROW} border-b-2 border-[#4A8FE7] pb-1 text-[#4A8FE7] transition-colors hover:border-[#FAFAFA] hover:text-[#FAFAFA]`}
          >
            {t('nav.cta')}
          </a>
        </div>
      </div>
    </header>
  );
}
