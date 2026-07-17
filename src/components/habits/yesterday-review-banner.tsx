'use client';

import { CalendarCheck, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface YesterdayReviewBannerProps {
  unreviewedCount: number;
  onOpen: () => void;
}

export function YesterdayReviewBanner({ unreviewedCount, onOpen }: YesterdayReviewBannerProps) {
  const t = useTranslations('habits');

  // v2: 琥珀色をやめ、新システム（無彩色主体・緑は達成専用）に馴染ませる。
  // これは「未処理タスク」であり達成ではないので緑は使わず、注意喚起はインクの塗り pill の
  // コントラストで担う（Airbnb 流「色ではなく濃淡で階層」）。
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full text-left rounded-xl border border-border bg-card px-4 py-3 flex items-center gap-3 transition-colors hover:bg-muted/60 active:bg-muted"
    >
      <CalendarCheck className="size-5 text-muted-foreground shrink-0" />
      <span className="flex-1 text-sm font-medium text-foreground">
        {t('reviewYesterday')}
      </span>
      <span className="rounded-full bg-primary text-primary-foreground text-xs font-semibold px-2 py-0.5 shrink-0 tabular-nums">
        {t('unreviewedCount', { count: unreviewedCount })}
      </span>
      <ChevronRight className="size-4 text-muted-foreground shrink-0" />
    </button>
  );
}
