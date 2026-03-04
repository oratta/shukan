'use client';

import { useMemo, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft, HeartPulse, Wallet, TrendingUp } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getArticle } from '@/data/impact-articles';
import { renderArticle, calculateAnnualImpact, formatHealthMinutes, formatCurrency } from '@/lib/impact';
import type { ArticleId } from '@/types/impact';

/** Convert **bold** markers in text to <strong> elements */
function parseBold(text: string): ReactNode[] {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  );
}

/** Unsplash hero images per article */
const HERO_IMAGES: Record<string, string> = {
  quit_smoking: 'https://images.unsplash.com/photo-1554548405-74d68637f897?w=800&h=400&fit=crop&q=80',
  quit_alcohol: 'https://images.unsplash.com/photo-1535683577427-740aaac4ec25?w=800&h=400&fit=crop&q=80',
  quit_porn: 'https://images.unsplash.com/photo-1573511860302-28c524319d2a?w=800&h=400&fit=crop&q=80',
  no_youtube: 'https://plus.unsplash.com/premium_photo-1661313613228-88dab4e3d22e?w=800&h=400&fit=crop&q=80',
  daily_cardio: 'https://plus.unsplash.com/premium_photo-1663127773019-2d977286d60a?w=800&h=400&fit=crop&q=80',
  daily_strength: 'https://images.unsplash.com/photo-1544033527-b192daee1f5b?w=800&h=400&fit=crop&q=80',
  morning_planning: 'https://plus.unsplash.com/premium_photo-1706028469800-7c719a733e10?w=800&h=400&fit=crop&q=80',
};

/** Fallback gradient color palette */
const HERO_GRADIENTS: Record<string, string> = {
  quit_smoking: 'from-red-400 to-orange-300',
  quit_porn: 'from-purple-400 to-pink-300',
  quit_alcohol: 'from-amber-400 to-yellow-300',
  no_youtube: 'from-rose-400 to-red-300',
  morning_planning: 'from-sky-400 to-blue-300',
  daily_cardio: 'from-green-400 to-emerald-300',
  daily_strength: 'from-indigo-400 to-violet-300',
};

const DEFAULT_GRADIENT = 'from-teal-400 to-cyan-300';

interface EvidenceArticleSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  articleId: string | null;
  showAddButton?: boolean;
  onAddHabit?: (articleId: string) => void;
}

export function EvidenceArticleSheet({
  open,
  onOpenChange,
  articleId,
  showAddButton = false,
  onAddHabit,
}: EvidenceArticleSheetProps) {
  const t = useTranslations('impact');
  const tEvidence = useTranslations('evidence');

  const article = useMemo(
    () => (articleId ? getArticle(articleId as ArticleId) : undefined),
    [articleId]
  );

  const renderedBody = useMemo(
    () => (article ? renderArticle(article) : ''),
    [article]
  );

  if (!article || !articleId) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" showCloseButton={false} className="h-0 p-0">
          <SheetTitle className="sr-only">Loading</SheetTitle>
        </SheetContent>
      </Sheet>
    );
  }

  const { dailyHealthMinutes, dailyCostSaving, dailyIncomeGain } =
    article.calculationParams;
  const annual = calculateAnnualImpact({
    healthMinutes: dailyHealthMinutes,
    costSaving: dailyCostSaving,
    incomeGain: dailyIncomeGain,
  });

  const confidenceLabel = t(`confidence.${article.confidenceLevel}`);
  const gradient = HERO_GRADIENTS[articleId] ?? DEFAULT_GRADIENT;

  const confidenceBadgeClass = (() => {
    switch (article.confidenceLevel) {
      case 'high':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'medium':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'low':
        return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    }
  })();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="flex h-[95vh] flex-col rounded-t-2xl p-0"
      >
        <SheetTitle className="sr-only">{article.habitName}</SheetTitle>

        {/* Scrollable area */}
        <div className={cn('flex-1 overflow-y-auto', showAddButton && 'pb-20')}>
          {/* Hero image area */}
          <div
            className={cn(
              'relative h-48',
              !HERO_IMAGES[articleId] && `bg-gradient-to-br ${gradient}`
            )}
          >
            {HERO_IMAGES[articleId] && (
              <img
                src={HERO_IMAGES[articleId]}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
            )}
            {/* Back button */}
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="absolute left-4 top-4 flex size-9 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-sm transition-colors hover:bg-black/30"
            >
              <ArrowLeft className="size-5" />
            </button>
          </div>

          {/* Article title + meta */}
          <div className="px-4 pt-4">
            <h2 className="text-xl font-bold">{article.habitName}</h2>

            {/* Impact badges row (annual) */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF8F0] px-2.5 py-1 text-xs font-medium text-[#B8860B]">
                <HeartPulse className="size-3.5" /> +{formatHealthMinutes(annual.healthMinutes)}{t('perYear')}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF8F0] px-2.5 py-1 text-xs font-medium text-[#B8860B]">
                <Wallet className="size-3.5" /> {formatCurrency(annual.costSaving)}{t('perYear')}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF8F0] px-2.5 py-1 text-xs font-medium text-[#B8860B]">
                <TrendingUp className="size-3.5" /> {formatCurrency(annual.incomeGain)}{t('perYear')}
              </span>
            </div>

            {/* Confidence badge */}
            <div className="mt-2">
              <span
                className={cn(
                  'inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium',
                  confidenceBadgeClass
                )}
              >
                {confidenceLabel}
              </span>
            </div>
          </div>

          {/* Article body */}
          <div className="px-4 pb-4 pt-4">
            <div className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">
              {parseBold(renderedBody)}
            </div>

            {/* Sources */}
            <div className="mt-6 border-t pt-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t('sources')}
              </h3>
              <ol className="space-y-1.5 text-xs text-muted-foreground">
                {article.article.sources.map((source) => (
                  <li key={source.id} className="leading-relaxed">
                    {source.url ? (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-foreground"
                      >
                        {source.text}
                      </a>
                    ) : (
                      source.text
                    )}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        {/* Fixed CTA bar at bottom */}
        {showAddButton && onAddHabit && (
          <div className="absolute inset-x-0 bottom-0 border-t bg-background p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <Button
              onClick={() => onAddHabit(articleId)}
              className="w-full"
              size="lg"
            >
              {tEvidence('addThisHabit')}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
