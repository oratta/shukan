'use client';

import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/components/auth-provider';
import { SettingsSync } from '@/components/settings-sync';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        {/* user_settings（DB）→ この端末へのテーマ／ロケール取り込み（#24）。未ログイン時は何もしない */}
        <SettingsSync />
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}
