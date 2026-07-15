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

/** 行が無いときの insert 入力（theme / locale は常に明示送信する） */
export interface UserSettingsInput {
  theme: SettingsTheme;
  locale: SettingsLocale;
}

/** 更新の入力。**ユーザーが実際に変更したカラムだけ**を含める（#101） */
export type UserSettingsPatch = Partial<UserSettingsInput>;

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
 * 行が無いときだけ 1 行を作る（`insert ... on conflict (user_id) do nothing`）。
 * **既存行には一切触らない**ため、別デバイスが先に作った行を巻き戻すことがない。
 * 行が既にあれば null を返す（＝ seed 不要だった）。
 *
 * insert は「そのアカウントの最初の 1 行」を作る経路なので theme / locale を必ず両方明示送信する。
 * よって DB の column default（locale='ja'）はこの経路でも発火しない
 * （既定値の不一致の扱いは settings-shared.ts の DEFAULT_LOCALE のコメント参照）。
 * updated_at はアプリ側で設定（profiles.ts と同じ方針）。
 */
export async function seedUserSettings(
  userId: string,
  input: UserSettingsInput
): Promise<UserSettings | null> {
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
      { onConflict: 'user_id', ignoreDuplicates: true }
    )
    .select()
    .maybeSingle();
  if (error) throw error;
  if (!data) return null; // 既に行がある = 他デバイスが作った / 既存ユーザー。触らない
  return toUserSettings(data as UserSettingsRow);
}

/**
 * 設定を更新する。**変更したカラムだけ**を DB に送る（#101 のレビュー指摘への対応）。
 *
 * 【なぜ行まるごとの upsert ではないのか】
 * 行まるごと upsert すると、変更していない側のカラムを「この端末が持っているローカル値」で
 * 埋めることになる。ところが `useSettingsSync` の取り込みは userId ごとに 1 回きり
 * （realtime 購読もポーリングも無い）なので、**開きっぱなしのタブのローカル値は他デバイスの
 * 変更を知らないまま stale になる**。その状態でテーマだけ変えると、ユーザーが触っていない
 * locale が stale なローカル値で上書きされ、他デバイスで行った変更が静かに巻き戻る
 * （レース条件ではなく「2 台目がある」だけで決定論的に起きる）。
 *
 * そこで書き込みをカラム単位にする:
 *   1. `update` に patch のカラムだけを載せて既存行を更新する（触っていないカラムは DB の値のまま）。
 *   2. 更新が 0 行 = まだ行が無い → fallback（両カラム）で insert する。
 *   3. その insert が並行 insert と衝突した（= 別デバイスが同時に「行が無い」と判断して先に作った）
 *      場合は `on conflict do nothing` で相手の行を保ち、改めて patch のカラムだけ update し直す。
 *      → どの経路でも「自分が変更していないカラムを自分のローカル値で書き戻す」ことが無い。
 *
 * これにより不変条件「DB の各カラムは、そのアカウントで**そのカラムに対して**最後に行われた
 * 変更を保持する（カラム単位の last-writer-wins）」が成立する。
 *
 * @param patch    ユーザーが実際に変更したカラムだけ（例: テーマ変更なら `{ theme }` のみ）
 * @param fallback 行がまだ無いときの insert 用。theme / locale の両方を明示送信する
 */
export async function updateUserSettings(
  userId: string,
  patch: UserSettingsPatch,
  fallback: UserSettingsInput
): Promise<UserSettings> {
  const supabase = createClient();
  const changed = { ...patch, updated_at: new Date().toISOString() };

  // 1. 既存行を「変更したカラムだけ」更新する（他カラムは DB の値を保持）
  const { data, error } = await supabase
    .from('user_settings')
    .update(changed)
    .eq('user_id', userId)
    .select()
    .maybeSingle();
  if (error) throw error;
  if (data) return toUserSettings(data as UserSettingsRow);

  // 2. 0 行 = まだ行が無い → 両カラムで insert（patch を優先）
  const seeded = await seedUserSettings(userId, { ...fallback, ...patch });
  if (seeded) return seeded;

  // 3. insert が衝突した = 別デバイスが先に行を作った。相手の行を残したまま自分の変更カラムだけ入れる
  const { data: retried, error: retryError } = await supabase
    .from('user_settings')
    .update(changed)
    .eq('user_id', userId)
    .select()
    .single();
  if (retryError) throw retryError;
  return toUserSettings(retried as UserSettingsRow);
}
