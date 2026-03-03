'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, BarChart3, Settings } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  href: string;
  labelKey: 'today' | 'discover' | 'stats' | 'settings';
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { href: '/', labelKey: 'today', icon: Home },
  { href: '/discover', labelKey: 'discover', icon: Compass },
  { href: '/stats', labelKey: 'stats', icon: BarChart3 },
  { href: '/settings', labelKey: 'settings', icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();
  const t = useTranslations('nav');

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/80 backdrop-blur-sm md:hidden">
      <div className="mx-auto flex h-16 max-w-2xl items-center justify-around px-4">
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
                'flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs transition-colors',
                isActive
                  ? 'text-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon
                className={cn('size-5', isActive && 'text-primary')}
              />
              <span>{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
