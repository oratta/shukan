'use client';

import { CalendarCheck, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface YesterdayReviewBannerProps {
  unreviewedCount: number;
  onOpen: () => void;
}

export function YesterdayReviewBanner({ unreviewedCount, onOpen }: YesterdayReviewBannerProps) {
  const t = useTranslations('habits');

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full text-left rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 flex items-center gap-3 transition-opacity hover:opacity-80 active:opacity-60"
    >
      <CalendarCheck className="size-5 text-amber-600 dark:text-amber-400 shrink-0" />
      <span className="flex-1 text-sm font-medium text-amber-900 dark:text-amber-200">
        {t('reviewYesterday')}
      </span>
      <span className="rounded-full bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 text-xs font-semibold px-2 py-0.5 shrink-0">
        {t('unreviewedCount', { count: unreviewedCount })}
      </span>
      <ChevronRight className="size-4 text-amber-600 dark:text-amber-400 shrink-0" />
    </button>
  );
}
