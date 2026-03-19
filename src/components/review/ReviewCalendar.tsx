'use client';

import { useLocale, useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOOD_ICONS } from '@/lib/mood-icons';
import type { DailyReflection } from '@/types/habit';
import type { MonthlyHabitCompletion } from '@/lib/supabase/habits';
import { ReviewDayDetail } from './ReviewDayDetail';

interface ReviewCalendarProps {
  displayYear: number;
  displayMonth: number;
  selectedDate: string | null;
  reflections: DailyReflection[];
  completions: MonthlyHabitCompletion[];
  isCurrentMonth: boolean;
  loading: boolean;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDateSelect: (date: string) => void;
}

function getMoodDotColor(mood: number | undefined): string {
  if (mood === undefined) return '';
  if (mood >= 4) return 'bg-green-400';
  if (mood === 3) return 'bg-yellow-400';
  return 'bg-red-400';
}

function getDaysInMonth(year: number, month: number): string[] {
  const pad = (n: number) => String(n).padStart(2, '0');
  const count = new Date(year, month, 0).getDate();
  return Array.from({ length: count }, (_, i) => {
    const day = i + 1;
    return `${year}-${pad(month)}-${pad(day)}`;
  });
}

function getTodayString(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function ReviewCalendar({
  displayYear,
  displayMonth,
  selectedDate,
  reflections,
  completions: _completions,
  isCurrentMonth,
  loading,
  onPrevMonth,
  onNextMonth,
  onDateSelect,
}: ReviewCalendarProps) {
  const locale = useLocale();
  const t = useTranslations('reviewHistory');

  const today = getTodayString();
  const days = getDaysInMonth(displayYear, displayMonth);

  // First day of month weekday (0=Sun...6=Sat), convert to Mon-first (0=Mon...6=Sun)
  const firstDayOfWeek = new Date(`${days[0]}T00:00:00`).getDay();
  const offset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  // Build locale-aware weekday headers (Mon-first)
  const weekdays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(2025, 0, 6 + i); // 2025-01-06 is a Monday
    return new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date);
  });

  // Mood lookup by date
  const reflectionMap = new Map<string, DailyReflection>();
  for (const r of reflections) {
    reflectionMap.set(r.date, r);
  }

  // Selected date data
  const selectedReflection = selectedDate ? (reflectionMap.get(selectedDate) ?? null) : null;
  const selectedCompletions = selectedDate
    ? _completions.filter((c) => c.date === selectedDate)
    : [];

  const monthLabel = new Date(`${displayYear}-${String(displayMonth).padStart(2, '0')}-01T00:00:00`).toLocaleDateString(
    locale,
    { year: 'numeric', month: 'long' }
  );

  return (
    <div className="space-y-3">
      {/* Month navigation header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onPrevMonth}
          className="rounded-full p-1.5 hover:bg-muted transition-colors"
          aria-label={t('prevMonth')}
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-semibold">{monthLabel}</span>
        <button
          type="button"
          onClick={onNextMonth}
          disabled={isCurrentMonth}
          className={cn(
            'rounded-full p-1.5 transition-colors',
            isCurrentMonth
              ? 'text-muted-foreground/30 cursor-not-allowed'
              : 'hover:bg-muted'
          )}
          aria-label={t('nextMonth')}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {weekdays.map((wd, i) => (
          <div key={i} className="text-[10px] font-medium text-muted-foreground py-0.5">
            {wd}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {/* Empty offset cells */}
          {Array.from({ length: offset }, (_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {/* Day cells */}
          {days.map((dateStr) => {
            const dayNum = parseInt(dateStr.split('-')[2], 10);
            const isFuture = dateStr > today;
            const isSelected = selectedDate === dateStr;
            const reflection = reflectionMap.get(dateStr);
            const dotColor = getMoodDotColor(reflection?.mood);

            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => !isFuture && onDateSelect(dateStr)}
                disabled={isFuture}
                className={cn(
                  'flex flex-col items-center justify-center rounded-lg py-1.5 gap-0.5 transition-all text-xs font-medium',
                  isFuture
                    ? 'text-muted-foreground/30 pointer-events-none'
                    : 'hover:bg-muted cursor-pointer',
                  isSelected && 'ring-2 ring-primary bg-primary/5'
                )}
                aria-label={dateStr}
              >
                <span>{dayNum}</span>
                {dotColor ? (
                  <span className={cn('size-1.5 rounded-full', dotColor)} />
                ) : (
                  <span className="size-1.5" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Day detail panel */}
      {selectedDate && (
        <ReviewDayDetail
          date={selectedDate}
          reflection={selectedReflection}
          completions={selectedCompletions}
        />
      )}
    </div>
  );
}
