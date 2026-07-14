import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  isSettingsLocale,
} from '@/lib/settings-shared';

/**
 * ロケール解決の順序（#24）:
 *   1. `locale` cookie — ログイン中は <SettingsSync /> が user_settings の値をこの cookie に焼くため、
 *      デバイスをまたいでも DB の locale がここに現れる。
 *   2. DEFAULT_LOCALE（'en'）— cookie 未設定 / 不正値のフォールバック。
 *      DB の column default が 'ja' である件との整合は settings-shared.ts の DEFAULT_LOCALE 参照。
 * 未ログインでも cookie だけで完結するため、認証の無い画面でも従来どおり動きエラーにならない。
 */
export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const raw = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale = isSettingsLocale(raw) ? raw : DEFAULT_LOCALE;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
