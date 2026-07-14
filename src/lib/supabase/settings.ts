import { createClient } from './client';
import {
  DEFAULT_LOCALE,
  DEFAULT_THEME,
  isSettingsLocale,
  isSettingsTheme,
  type SettingsLocale,
  type SettingsTheme,
} from '@/lib/settings-shared';

// 型・定数・純粋関数は settings-shared.ts（supabase 非依存）に置き、ここから再輸出する。
// サーバー側の src/i18n/request.ts は settings-shared を直接読む（ブラウザクライアントを
// サーバーのモジュールグラフへ持ち込まないため）。
export * from '@/lib/settings-shared';

/** snake_case の DB 行（user_settings） */
export interface UserSettingsRow {
  user_id: string;
  theme: SettingsTheme;
  locale: SettingsLocale;
  updated_at: string;
}

/** camelCase のドメイン型（profiles.ts の流儀に合わせる） */
export interface UserSettings {
  userId: string;
  theme: SettingsTheme;
  locale: SettingsLocale;
  updatedAt: string;
}

/** upsert の入力（theme / locale は常に明示送信する） */
export interface UserSettingsInput {
  theme: SettingsTheme;
  locale: SettingsLocale;
}

/** Row（snake_case）→ UserSettings（camelCase）変換。profiles.ts の toXxx() 流儀 */
export function toUserSettings(row: UserSettingsRow): UserSettings {
  return {
    userId: row.user_id,
    // DB に CHECK 制約があるので通常は範囲内。想定外の値は既定へ丸めて UI を壊さない
    theme: isSettingsTheme(row.theme) ? row.theme : DEFAULT_THEME,
    locale: isSettingsLocale(row.locale) ? row.locale : DEFAULT_LOCALE,
    updatedAt: row.updated_at,
  };
}

/**
 * ログイン中ユーザーの設定を取得する。行が無ければ null（maybeSingle）。
 * RLS（auth.uid() = user_id）で自分の行しか見えないため where 句は不要（profiles.ts と同型）。
 */
export async function fetchUserSettings(): Promise<UserSettings | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return toUserSettings(data as UserSettingsRow);
}

/**
 * 設定を upsert する（1 ユーザー 1 行、onConflict: user_id）。
 * theme / locale を常に明示送信するため、DB の column default（locale='ja'）は発火しない
 * （既定値の不一致の扱いは settings-shared.ts の DEFAULT_LOCALE のコメント参照）。
 * updated_at はアプリ側で設定（profiles.ts と同じ方針）。
 */
export async function upsertUserSettings(
  userId: string,
  input: UserSettingsInput
): Promise<UserSettings> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('user_settings')
    .upsert(
      {
        user_id: userId,
        theme: input.theme,
        locale: input.locale,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )
    .select()
    .single();
  if (error) throw error;
  return toUserSettings(data as UserSettingsRow);
}
