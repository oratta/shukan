'use client';

import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';

/**
 * LP 専用のロケール切り替え。
 * 共有の `LocaleSwitcher` は semantic token で着色されるためダークテーマ下で
 * 白背景に白文字になる。常時ライトの LP では色を明示したこちらを使う。
 */
export function LocaleToggle() {
  const locale = useLocale();
  const router = useRouter();

  const next = locale === 'en' ? 'ja' : 'en';

  return (
    <button
      type="button"
      onClick={() => {
        document.cookie = `locale=${next};path=/;max-age=31536000`;
        router.refresh();
      }}
      className="rounded-sm px-2 py-1 text-xs font-medium tracking-widest text-zinc-500 uppercase transition-colors hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
    >
      {next}
    </button>
  );
}
