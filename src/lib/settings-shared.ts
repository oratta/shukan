/**
 * テーマ／ロケール設定の共有定義（#24）。
 *
 * supabase クライアントに依存しない純粋な型・定数・関数だけをここに置く。
 * サーバー側（`src/i18n/request.ts`）とクライアント側（`src/lib/supabase/settings.ts`）の
 * 双方から読むため、副作用のある import を持ち込まないこと。
 */

/** DB の theme CHECK 制約と一致させる（init_schema.sql: user_settings） */
export type SettingsTheme = 'light' | 'dark' | 'system';
/** DB の locale CHECK 制約と一致させる（init_schema.sql: user_settings） */
export type SettingsLocale = 'en' | 'ja';

/** next-themes が使う localStorage キー（ThemeProvider の既定値） */
export const THEME_STORAGE_KEY = 'theme';
/** next-intl のロケールを載せる cookie 名（src/i18n/request.ts が読む） */
export const LOCALE_COOKIE = 'locale';

/** テーマの既定値（next-themes の defaultTheme="system" と一致させる） */
export const DEFAULT_THEME: SettingsTheme = 'system';

/**
 * ロケールの既定値。
 *
 * 【既定ロケールの不一致の解決（#24）】
 * DB 側 `user_settings.locale` の column default は 'ja' だが、**アプリの正は 'en'** とする。
 *   - 理由1: 'ja' を正にすると、locale cookie を持たない既存の全訪問者（LP 以外）の表示言語が
 *     いきなり日本語に変わる。#24 はデバイス間同期の issue であり、既定表示言語の変更は
 *     スコープ外の product 変更（ユーザー可視の挙動変化）になる。
 *   - 理由2: DB の column default は「locale を省略して insert したとき」だけ発火するが、
 *     アプリは upsert で必ず theme / locale を明示送信する（`upsertUserSettings`）ため到達しない。
 *     つまり実挙動上の不一致は生じず、既定値を揃えるためのマイグレーションは不要。
 *   - なお LP（marketing）は `src/middleware.ts` がリクエスト単位で locale=ja を強制するため、
 *     この既定値の影響を受けない（#57）。
 */
export const DEFAULT_LOCALE: SettingsLocale = 'en';

export function isSettingsTheme(v: unknown): v is SettingsTheme {
  return v === 'light' || v === 'dark' || v === 'system';
}

export function isSettingsLocale(v: unknown): v is SettingsLocale {
  return v === 'en' || v === 'ja';
}

/** ローカル（この端末）にユーザーが明示的に選んだ設定があるか。null = 未選択（新しいブラウザ） */
export interface LocalSettings {
  theme: SettingsTheme | null;
  locale: SettingsLocale | null;
}

/** DB 側の設定（`user_settings` の 1 行）。null = まだ行が無い */
export interface RemoteSettings {
  theme: SettingsTheme;
  locale: SettingsLocale;
}

/**
 * ローカルと DB の突き合わせ（#24 受け入れ条件4「優先順位の根拠」の本体）。
 *
 * 【優先順位: ログイン中は DB が正】
 *   1. DB に行がある → **DB を適用する**（ローカルに別の値があっても DB で上書きする）。
 *      根拠: この機能の目的は「デバイス間同期」。ローカルを勝たせると、端末 A で行った変更が、
 *      既にローカル値を持っている端末 B へ永久に届かず、同期が成立しない。
 *      ログイン中の変更は必ず DB へ即 upsert される（useSettings.saveTheme / saveLocale）ので、
 *      DB は常に「そのアカウントで最後に行われた変更」を保持する = last-writer-wins の正本。
 *   2. DB に行が無い（＝そのアカウントで一度も設定していない / 初回ログイン）
 *      → **この端末のローカル値で DB を seed する**。
 *      根拠: DB 移行前からローカルで設定していたユーザーの選択を失わないため。
 *      ローカルにも値が無ければ既定値（DEFAULT_THEME / DEFAULT_LOCALE）で seed する。
 *   3. 未ログイン → そもそもこの関数を呼ばない。従来どおり localStorage / cookie だけで動く。
 */
export function reconcileSettings(
  local: LocalSettings,
  remote: RemoteSettings | null
): { theme: SettingsTheme; locale: SettingsLocale; needsSeed: boolean } {
  if (remote) {
    return { theme: remote.theme, locale: remote.locale, needsSeed: false };
  }
  return {
    theme: local.theme ?? DEFAULT_THEME,
    locale: local.locale ?? DEFAULT_LOCALE,
    needsSeed: true,
  };
}

/** localStorage から next-themes の保存値を読む（未設定 / 不正値 / 参照不可は null） */
export function readLocalTheme(): SettingsTheme | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isSettingsTheme(v) ? v : null;
  } catch {
    // localStorage 参照不可（プライベートモード等）は「値なし」扱い
    return null;
  }
}

/** cookie 文字列から locale を読む（未設定 / 不正値は null） */
export function readLocaleCookie(cookieString: string): SettingsLocale | null {
  const m = new RegExp(`(?:^|;\\s*)${LOCALE_COOKIE}=([^;]*)`).exec(cookieString);
  const v = m ? decodeURIComponent(m[1]) : null;
  return isSettingsLocale(v) ? v : null;
}

/** locale cookie を書く（既存 UI と同じ path=/ / 1 年 max-age を踏襲） */
export function writeLocaleCookie(locale: SettingsLocale): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=31536000`;
}
