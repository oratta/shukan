import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
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
    </div>
  );
}
