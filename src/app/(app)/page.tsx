import { DashboardClient } from '@/components/dashboard/dashboard-client';
import { fetchInitialHabitData } from '@/lib/supabase/habits-server';

// ホーム初回ロードの habits + completions を Server Component で prefetch する（issue #59）。
// cookies() を使う server クライアント経由のため、このページは自動的に dynamic rendering になる。
// prefetch が null（未ログイン / エラー）の場合は DashboardClient が従来どおり
// クライアント側でフェッチする（スピナー表示のフォールバック）。
export default async function DashboardPage() {
  const initialData = await fetchInitialHabitData();
  return <DashboardClient initialData={initialData} />;
}
