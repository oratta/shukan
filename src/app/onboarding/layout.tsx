import { resolveOnboardingRedirect } from "@/lib/onboarding-guard";

/**
 * /onboarding 独立レイアウト（サーバーコンポーネント・D1）。
 * Header / BottomNav なし（/login と同様の独立構造）。
 * 未ログイン→/login、user_profiles 作成済み→/ にリダイレクトする。
 */
export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await resolveOnboardingRedirect();

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8">
        {children}
      </main>
    </div>
  );
}
