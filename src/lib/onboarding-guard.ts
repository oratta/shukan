// オンボーディング誘導のサーバー側ガード（D1）。
//
// user_profiles 有無の判定は (app)/layout.tsx と /onboarding/layout.tsx の2点のみで行う。
// middleware は auth リダイレクト（未ログイン→/login）のみ担当し変更しない。
// ここではロジックを純粋寄りの関数に切り出し（D-C2）、layout 側は呼ぶだけにする。

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

/** ログイン中ユーザーの user_profiles 行が存在するか（単一行 select）。 */
async function hasUserProfile(): Promise<{ loggedIn: boolean; hasProfile: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { loggedIn: false, hasProfile: false };

  const { data } = await supabase
    .from('user_profiles')
    .select('user_id')
    .maybeSingle();

  return { loggedIn: true, hasProfile: data != null };
}

/**
 * /onboarding レイアウト用ガード:
 *   - 未ログイン → /login（middleware の matcher 外なのでここで担保する）
 *   - profile 作成済み → /（完了後・既存ユーザーは戻れない。C-S3 / C-S15）
 *   - 未作成 → そのまま表示（リダイレクトしない）
 */
export async function resolveOnboardingRedirect(): Promise<void> {
  const { loggedIn, hasProfile } = await hasUserProfile();
  if (!loggedIn) redirect('/login');
  if (hasProfile) redirect('/');
}

/**
 * (app) レイアウト用ガード:
 *   - ログイン済み＋profile 未作成 → /onboarding（C-S1 / C-S2）
 *   - それ以外（未ログインは middleware が /login へ・作成済みはそのまま）→ 何もしない
 */
export async function resolveAppRedirect(): Promise<void> {
  const { loggedIn, hasProfile } = await hasUserProfile();
  if (loggedIn && !hasProfile) redirect('/onboarding');
}
