import { getTranslations } from 'next-intl/server';
import { SHELL } from './theme';

export async function SiteFooter() {
  const t = await getTranslations('marketing');

  return (
    <footer className="bg-[#0A0A0A] text-[#FAFAFA]">
      <div className={`${SHELL} py-10`}>
        <nav className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t-2 border-[#FAFAFA]/25 pt-8 font-mono text-xs">
          <span className="font-black tracking-[0.2em]">SMITCH</span>
          <span className="text-[#FAFAFA]/50">{t('footer.tagline')}</span>
          <a href="/privacy" className="ml-auto hover:text-[#4A8FE7]">
            {t('footer.privacy')}
          </a>
          <a href="/terms" className="hover:text-[#4A8FE7]">
            {t('footer.terms')}
          </a>
          <a href="/tokushoho" className="hover:text-[#4A8FE7]">
            {t('footer.tokushoho')}
          </a>
          <span className="text-[#FAFAFA]/50">{t('footer.copyright')}</span>
        </nav>
      </div>
    </footer>
  );
}
