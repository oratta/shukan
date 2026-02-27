'use client';

import { useMemo, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { getArticle } from '@/data/impact-articles';
import { renderArticle, formatHealthMinutes, formatCurrency } from '@/lib/impact';
import type { HabitWithStats } from '@/types/habit';

/** Convert **bold** markers in text to <strong> elements */
function parseBold(text: string): ReactNode[] {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  );
}

interface ImpactArticleSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit: HabitWithStats | null;
}

export function ImpactArticleSheet({
  open,
  onOpenChange,
  habit,
}: ImpactArticleSheetProps) {
  const t = useTranslations('impact');
  const timeUnits = { min: t('minuteUnit'), hour: t('hourUnit'), day: t('dayUnit') };

  const article = useMemo(
    () => (habit?.impactArticleId ? getArticle(habit.impactArticleId) : undefined),
    [habit?.impactArticleId]
  );

  const renderedBody = useMemo(
    () => (article ? renderArticle(article) : ''),
    [article]
  );

  if (!habit || !article) return null;

  const { dailyHealthMinutes, dailyCostSaving, dailyIncomeGain } =
    article.calculationParams;

  const confidenceLabel = t(`confidence.${article.confidenceLevel}`);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-md [&>button]:hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white px-4 pb-3 pt-4 dark:bg-gray-900">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">{article.habitName}</h2>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Metric summary */}
          <div className="flex items-center gap-3 rounded-lg bg-[#FFF8F0] p-2.5 text-sm">
            <span className="flex items-center gap-1">
              <span>🏥</span>
              <span className="font-medium">+{dailyHealthMinutes}{t('minuteUnit')}</span>
            </span>
            <span className="flex items-center gap-1">
              <span>💰</span>
              <span className="font-medium">¥{dailyCostSaving.toLocaleString()}</span>
            </span>
            <span className="flex items-center gap-1">
              <span>📈</span>
              <span className="font-medium">¥{dailyIncomeGain.toLocaleString()}</span>
            </span>
          </div>

          {/* Confidence badge */}
          <div className="mt-2 text-right">
            <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              {confidenceLabel}
            </span>
          </div>
        </div>

        {/* Article body */}
        <div className="px-4 pb-4">
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

          {/* Cumulative savings if user has progress */}
          {habit.impactSavings && habit.impactSavings.completedDays > 0 && (
            <div className="mt-6 rounded-lg bg-[#F0F7F2] p-3">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#3D8A5A]">
                {t('yourSavings')}
              </h3>
              <div className="space-y-1 text-sm text-[#3D8A5A]">
                <p>🏥 {t('dailyHealth')}: +{formatHealthMinutes(habit.impactSavings.healthMinutes, timeUnits)}</p>
                <p>💰 {t('dailyCost')}: {formatCurrency(habit.impactSavings.costSaving)}</p>
                <p>📈 {t('dailyIncome')}: {formatCurrency(habit.impactSavings.incomeGain)}</p>
                <p className="text-xs text-[#3D8A5A]/70">
                  ({habit.impactSavings.completedDays}{t('daysUnit')}{t('accumulated')})
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
