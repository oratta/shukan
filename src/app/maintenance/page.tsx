import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'メンテナンス中 | Smitch',
  robots: { index: false, follow: false },
};

export default function MaintenancePage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <h1 className="text-3xl font-bold tracking-tight">メンテナンス中</h1>
        <p className="text-muted-foreground">
          現在システムメンテナンスを実施しています。
          <br />
          しばらく経ってから再度アクセスしてください。
        </p>
        <p className="text-sm text-muted-foreground">
          We are currently undergoing scheduled maintenance.
          <br />
          Please check back soon.
        </p>
      </div>
    </div>
  );
}
