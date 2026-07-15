// ホーム初回ロード用の server-side prefetch（issue #59）。
//
// (app)/page.tsx（async Server Component）から呼ばれ、habits + completions を
// cookie バウンドの server クライアント（RLS 有効）で取得して初期 props にする。
// mutation 系は従来どおりクライアントフロー（useHabits）が担当し、ここは
// 「初回読み込みのみの最適化」に徹する。失敗時は throw せず null を返して
// クライアント側の従来ロード（スピナー→フェッチ）にフォールバックする。

import { createClient } from './server';
import { fetchHabits, fetchCompletions } from './habits';
import type { Habit, HabitCompletion } from '@/types/habit';

export interface InitialHabitData {
  habits: Habit[];
  completions: HabitCompletion[];
}

export async function fetchInitialHabitData(): Promise<InitialHabitData | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const [habits, completions] = await Promise.all([
      fetchHabits(supabase),
      fetchCompletions(90, supabase),
    ]);
    return { habits, completions };
  } catch (err) {
    // build 時の静的レンダリング試行で cookies() が投げる DynamicServerError は
    // Next.js が「このルートは dynamic」と判定するためのシグナルなので握りつぶさず再 throw する
    // （catch すると build ログに毎回 console.error ノイズが出る。PR #79 レビュー指摘）。
    if (
      typeof err === 'object' &&
      err !== null &&
      'digest' in err &&
      (err as { digest?: unknown }).digest === 'DYNAMIC_SERVER_USAGE'
    ) {
      throw err;
    }
    // prefetch はあくまで最適化。失敗してもページを落とさず client fetch に委ねる。
    console.error('fetchInitialHabitData failed:', err);
    return null;
  }
}
