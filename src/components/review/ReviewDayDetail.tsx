'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Check, X, Minus, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOOD_ICONS } from '@/lib/mood-icons';
import type { DailyReflection } from '@/types/habit';
import type { MonthlyHabitCompletion } from '@/lib/supabase/habits';
import { HabitIcon } from '@/components/ui/habit-icon';

interface ReviewDayDetailProps {
  date: string;
  reflection: DailyReflection | null;
  completions: MonthlyHabitCompletion[];
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'completed':
    case 'rocket_used':
      return <Check size={14} className="text-success shrink-0" />;
    case 'failed':
      return <X size={14} className="text-red-400 shrink-0" />;
    case 'skipped':
      return <Minus size={14} className="text-gray-400 shrink-0" />;
    default:
      return <Circle size={14} className="text-muted-foreground/30 shrink-0" />;
  }
}

export function ReviewDayDetail({ date, reflection, completions }: ReviewDayDetailProps) {
  const locale = useLocale();
  const t = useTranslations('reviewHistory');

  const hasData = reflection !== null || completions.length > 0;

  const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

  const moodEntry = reflection?.mood !== undefined
    ? MOOD_ICONS.find((m) => m.value === reflection.mood)
    : null;

  return (
    <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-3 mt-1">
      <p className="text-xs font-semibold text-muted-foreground">{formattedDate}</p>

      {!hasData ? (
        <p className="text-sm text-muted-foreground text-center py-2">{t('noRecord')}</p>
      ) : (
        <>
          {/* Mood */}
          {moodEntry && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{t('mood')}:</span>
              <moodEntry.Icon size={18} className={moodEntry.colorClass} />
            </div>
          )}

          {/* Comment */}
          {reflection?.comment && (
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground">{t('comment')}:</p>
              <p className="text-sm leading-relaxed">{reflection.comment}</p>
            </div>
          )}

          {/* Habits */}
          {completions.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">{t('habits')}</p>
              {completions.map((c) => (
                <div key={`${c.habitId}-${c.date}`} className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <StatusIcon status={c.status} />
                    <div
                      className="size-5 rounded-full flex items-center justify-center shrink-0 bg-muted"
                    >
                      <HabitIcon name={c.habitIcon} size={11} />
                    </div>
                    <span className="text-sm flex-1 leading-snug">{c.habitName}</span>
                  </div>
                  {c.note && (
                    <p className="text-xs text-muted-foreground pl-8">{c.note}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
