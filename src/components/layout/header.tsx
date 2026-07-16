'use client';

import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';
import { useSettings } from '@/hooks/useSettings';
import { Sun, Moon, User, Home, Compass, BarChart3, Settings, MessageSquarePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FeedbackDialog } from '@/components/feedback/feedback-dialog';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { SmitchLogo } from '@/components/ui/smitch-logo';
import { useAuth } from '@/components/auth-provider';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', labelKey: 'today' as const, icon: Home },
  { href: '/discover', labelKey: 'discover' as const, icon: Compass },
  { href: '/stats', labelKey: 'stats' as const, icon: BarChart3 },
  { href: '/settings', labelKey: 'settings' as const, icon: Settings },
];

export function Header() {
  const { theme } = useTheme();
  // テーマ変更は useSettings 経由（ローカル即反映 ＋ ログイン中は user_settings へ同期 / #24）
  const { saveTheme } = useSettings();
  const { user } = useAuth();
  const pathname = usePathname();
  const t = useTranslations('nav');
  const tFeedback = useTranslations('feedback');
  const [mounted, setMounted] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  // next-themes ハイドレーション対策: サーバーでは theme が未確定なので、
  // マウント後にのみテーマ依存 UI を描画する意図的な mounted パターン。
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe mounted flag
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    void saveTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const avatarUrl = user?.user_metadata?.avatar_url;

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
        <Link href="/" className="flex items-center">
          {/* ダークではロゴの濃紺(#180A4F)が沈むため、明度を持ち上げて視認性を確保する */}
          <SmitchLogo height={22} className="dark:brightness-[1.85]" />
        </Link>

        {/* Desktop nav - hidden on mobile (bottom nav handles it) */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors',
                  isActive
                    ? 'text-primary font-semibold bg-primary/5'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <item.icon className="size-4" />
                <span>{t(item.labelKey)}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          {user && (
            <Link href="/settings" className="flex items-center md:hidden">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt=""
                  className="size-7 rounded-full"
                />
              ) : (
                <div className="flex size-7 items-center justify-center rounded-full bg-muted">
                  <User className="size-3.5 text-muted-foreground" />
                </div>
              )}
            </Link>
          )}
          {/* アプリ内フィードバック導線（issue #19）: 全画面から1タップで到達 */}
          {user && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setFeedbackOpen(true)}
              aria-label={tFeedback('title')}
            >
              <MessageSquarePlus className="size-4" />
            </Button>
          )}
          <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />
          <LocaleSwitcher />
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="size-4" />
              ) : (
                <Moon className="size-4" />
              )}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
