'use client';

import { useCallback, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import {
  fetchUserSettings,
  seedUserSettings,
  updateUserSettings,
} from '@/lib/supabase/settings';
import {
  DEFAULT_LOCALE,
  DEFAULT_THEME,
  isSettingsLocale,
  isSettingsTheme,
  readLocaleCookie,
  readLocalTheme,
  reconcileSettings,
  writeLocaleCookie,
  type SettingsLocale,
  type SettingsTheme,
} from '@/lib/settings-shared';

/**
 * テーマ／ロケールの書き込みフック（#24）。
 *
 * - ローカル（next-themes の localStorage / locale cookie）へは常に即時反映する。
 *   未ログインでもここで完結するため、LP など認証の無い画面でも従来どおり動きエラーにならない（受け入れ条件3）。
 * - ログイン中は**変更したカラムだけ**を `user_settings` へ書く（受け入れ条件1）。
 *   DB がアカウントの正本になり、他デバイスは `useSettingsSync` でこれを取り込む。
 *   カラム単位で書くのは、この端末のローカル値が他デバイスの変更に対して stale になりうるため
 *   （`useSettingsSync` の取り込みは userId ごとに 1 回きりで realtime 購読が無い）。
 *   行まるごと書くと、ユーザーが触っていないカラムを stale なローカル値で巻き戻す（#101）。
 *   詳細は `updateUserSettings` の doc コメント参照。
 * - DB 書き込みの失敗は UI を壊さない（ローカルには既に反映済み。次回変更時に再送される）。
 */
export function useSettings() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const localeFromIntl = useLocale();
  const router = useRouter();
  const userId = user?.id;

  // next-themes の theme はマウント前 undefined になりうるため localStorage → 既定値の順で補う
  const currentTheme: SettingsTheme = isSettingsTheme(theme)
    ? theme
    : (readLocalTheme() ?? DEFAULT_THEME);
  const currentLocale: SettingsLocale = isSettingsLocale(localeFromIntl)
    ? localeFromIntl
    : (readLocaleCookie(typeof document === 'undefined' ? '' : document.cookie) ??
      DEFAULT_LOCALE);

  const saveTheme = useCallback(
    async (next: SettingsTheme) => {
      setTheme(next);
      if (!userId) return;
      try {
        // 送るのは theme だけ。locale は「行がまだ無いとき」の insert にしか使わない（#101）
        await updateUserSettings(
          userId,
          { theme: next },
          { theme: next, locale: currentLocale }
        );
      } catch {
        // 同期失敗はローカル動作を妨げない
      }
    },
    [setTheme, userId, currentLocale]
  );

  const saveLocale = useCallback(
    async (next: SettingsLocale) => {
      writeLocaleCookie(next);
      router.refresh();
      if (!userId) return;
      try {
        // 送るのは locale だけ。theme は「行がまだ無いとき」の insert にしか使わない（#101）
        await updateUserSettings(
          userId,
          { locale: next },
          { theme: currentTheme, locale: next }
        );
      } catch {
        // 同期失敗はローカル動作を妨げない
      }
    },
    [router, userId, currentTheme]
  );

  return { theme: currentTheme, locale: currentLocale, saveTheme, saveLocale };
}

/**
 * DB → ローカルの取り込み（#24 受け入れ条件2）。アプリ全体で **1 箇所だけ** 使う（`<SettingsSync />`）。
 *
 * 優先順位の根拠は `reconcileSettings` の doc コメントを参照（DB が正・行が無ければローカルで seed）。
 *
 * FOUC（チラつき）について:
 *   - 一度でも同期済みの端末では localStorage / cookie が DB と一致するため、
 *     next-themes の inline script（描画前）と server 側 locale 解決で正しい見た目が出る。
 *     この effect は差分が無いので setTheme / router.refresh を呼ばず、チラつきは起きない。
 *   - 差分が出るのは「新しいブラウザでの初回ログイン」または「他デバイスで変更された直後」だけで、
 *     その 1 回に限り既定表示 → DB 値へ切り替わる。以後はローカルに焼かれるので再発しない。
 *
 * 依存配列は `user?.id`（オブジェクト参照ではない）。supabase の onAuthStateChange は
 * 同一ユーザーでも毎回新しい user オブジェクトを返すため、参照を依存に入れると二重フェッチする。
 */
export function useSettingsSync() {
  const { user } = useAuth();
  const { setTheme } = useTheme();
  const router = useRouter();
  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    async function sync(uid: string) {
      let remote;
      try {
        remote = await fetchUserSettings();
      } catch {
        // 取得失敗時はローカルのまま（受け入れ条件3 と同じくエラーで壊さない）
        return;
      }
      if (cancelled) return;

      const local = {
        theme: readLocalTheme(),
        locale: readLocaleCookie(document.cookie),
      };
      const resolved = reconcileSettings(local, remote);

      if (resolved.needsSeed) {
        // 初回ログイン: この端末の現在値を DB へ移行する（ローカルの選択を失わない）。
        // seedUserSettings は on conflict do nothing なので、fetch 後に別デバイスが行を
        // 作っていた場合でもその行を上書きしない（#101）。
        try {
          await seedUserSettings(uid, {
            theme: resolved.theme,
            locale: resolved.locale,
          });
        } catch {
          // seed 失敗は次回の設定変更で回復する
        }
        return;
      }

      // DB が正: 差分があるときだけローカルへ適用する（差分ゼロなら再描画もしない＝チラつき無し）
      if (resolved.theme !== local.theme) {
        setTheme(resolved.theme);
      }
      if (resolved.locale !== local.locale) {
        writeLocaleCookie(resolved.locale);
        // locale はサーバー（src/i18n/request.ts）が cookie から解決するため再取得が要る
        router.refresh();
      }
    }

    sync(userId);

    return () => {
      cancelled = true;
    };
  }, [userId, setTheme, router]);
}
