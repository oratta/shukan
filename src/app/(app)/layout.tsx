import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { TutorialOverlay } from "@/components/tutorial/tutorial-overlay";
import { resolveAppRedirect } from "@/lib/onboarding-guard";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ログイン済み＋user_profiles 未作成 → /onboarding 強制（D1）。
  await resolveAppRedirect();

  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-20 pt-6 md:pb-6">
        {children}
      </main>
      <BottomNav />
      {/* 初回チュートリアル（コーチマーク）。ルート横断（ホーム→発見）で状態を保つためページでなくレイアウトに置く */}
      <TutorialOverlay />
    </div>
  );
}
