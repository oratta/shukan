'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Rocket, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { HabitWithStats, DayStatus } from '@/types/habit';

interface HabitDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit: HabitWithStats | null;
  onUseRocket: (habitId: string, date: string) => void;
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function getDayOfWeekMondayBased(dateStr: string): number {
  const d = new Date(dateStr);
  const day = d.getDay(); // 0=Sun, 1=Mon, ...
  return day === 0 ? 6 : day - 1; // 0=Mon, 6=Sun
}

function buildGridRows(allDays: DayStatus[]): (DayStatus | null)[][] {
  if (allDays.length === 0) return [];

  const rows: (DayStatus | null)[][] = [];
  const firstDow = getDayOfWeekMondayBased(allDays[0].date);

  // Pad first row with nulls to align to day of week
  const firstRow: (DayStatus | null)[] = Array(firstDow).fill(null);
  let dayIndex = 0;

  // Fill first row
  while (firstRow.length < 7 && dayIndex < allDays.length) {
    firstRow.push(allDays[dayIndex++]);
  }
  // Pad remaining if first row is short
  while (firstRow.length < 7) {
    firstRow.push(null);
  }
  rows.push(firstRow);

  // Fill remaining rows
  while (dayIndex < allDays.length) {
    const row: (DayStatus | null)[] = [];
    while (row.length < 7 && dayIndex < allDays.length) {
      row.push(allDays[dayIndex++]);
    }
    while (row.length < 7) {
      row.push(null);
    }
    rows.push(row);
  }

  return rows;
}

export function HabitDetailModal({
  open,
  onOpenChange,
  habit,
  onUseRocket,
}: HabitDetailModalProps) {
  const t = useTranslations('stats');
  const tHabits = useTranslations('habits');
  const tDays = useTranslations('days');

  const dayLabelsLocalized = [
    tDays('mon'), tDays('tue'), tDays('wed'), tDays('thu'),
    tDays('fri'), tDays('sat'), tDays('sun'),
  ];

  const gridRows = useMemo(() => {
    if (!habit) return [];
    return buildGridRows(habit.allDays);
  }, [habit]);

  // Find the first failed day eligible for rocket (> 5 days old)
  const rocketEligibleDate = useMemo(() => {
    if (!habit || habit.rockets <= 0) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (const day of habit.allDays) {
      if (day.status === 'failed') {
        const d = new Date(day.date);
        d.setHours(0, 0, 0, 0);
        const diffDays = Math.round(
          (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (diffDays > 5) {
          return day.date;
        }
      }
    }
    return null;
  }, [habit]);

  if (!habit) return null;

  const streakPercent = Math.round((habit.currentStreak / 30) * 100);
  const bestPercent = Math.round((habit.longestStreak / 30) * 100);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[85vh] overflow-y-auto p-0 sm:max-w-md"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5">
          <h2 className="text-xl font-bold">{habit.name}</h2>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Life Significance */}
        {habit.lifeSignificance && (
          <div className="px-5">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              {tHabits('lifeSignificance')}
            </p>
            <p className="mt-1 text-sm text-foreground/80">
              {habit.lifeSignificance}
            </p>
          </div>
        )}

        {/* Stats Row */}
        <div className="flex gap-3 px-5">
          {/* Current Streak */}
          <div className="flex-1 rounded-xl bg-[#C8F0D8] p-4 dark:bg-green-900/30">
            <div className="flex items-baseline gap-1">
              {habit.currentStreak >= 30 && <span>👑</span>}
              <span className="text-3xl font-bold text-green-800 dark:text-green-300">
                {habit.currentStreak}
              </span>
              <span className="text-sm text-green-700 dark:text-green-400">
                {t('days')}
              </span>
            </div>
            <p className="mt-1 text-xs text-green-700 dark:text-green-400">
              {t('currentStreak')}
            </p>
            <p className="text-xs font-medium text-green-600 dark:text-green-500">
              {streakPercent}%
            </p>
          </div>

          {/* Best Record */}
          <div className="flex-1 rounded-xl bg-[#EDECEA] p-4 dark:bg-neutral-800">
            <div className="flex items-baseline gap-1">
              {habit.longestStreak >= 30 && <span>👑</span>}
              <span className="text-3xl font-bold text-neutral-800 dark:text-neutral-200">
                {habit.longestStreak}
              </span>
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                {t('days')}
              </span>
            </div>
            <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
              {t('longestStreak')}
            </p>
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-500">
              {bestPercent}%
            </p>
          </div>
        </div>

        {/* Rocket Section */}
        <div className="mx-5 flex items-center gap-3 rounded-xl border p-4">
          <Rocket className="size-6 text-[#D89575]" />
          <div className="flex-1">
            <p className="text-sm font-semibold">
              {tHabits('rockets')}: {habit.rockets}
            </p>
            <p className="text-xs text-muted-foreground">
              {tHabits('rocketNextIn', { days: habit.rocketNextIn })}
            </p>
          </div>
        </div>

        {/* History Grid */}
        <div className="px-5 pb-5">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            {tHabits('history')}
          </p>

          {/* Day labels */}
          <div className="mb-1 grid grid-cols-7 gap-1">
            {dayLabelsLocalized.map((label, i) => (
              <div
                key={i}
                className="text-center text-[10px] font-medium text-muted-foreground"
              >
                {label}
              </div>
            ))}
          </div>

          {/* Grid rows */}
          <div className="flex flex-col gap-1">
            {gridRows.map((row, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-7 gap-1">
                {row.map((day, colIndex) => {
                  if (!day) {
                    return <div key={colIndex} className="aspect-square" />;
                  }

                  const isRocketEligible = day.date === rocketEligibleDate;
                  const isCompleted = day.status === 'completed';
                  const isFailed = day.status === 'failed';
                  const isNone = day.status === 'none';

                  return (
                    <button
                      key={day.date}
                      type="button"
                      disabled={!isRocketEligible}
                      onClick={() => {
                        if (isRocketEligible) {
                          onUseRocket(habit.id, day.date);
                        }
                      }}
                      className={cn(
                        'relative flex aspect-square items-center justify-center rounded-full transition-all',
                        isCompleted && 'bg-green-500 dark:bg-green-600',
                        isFailed && !isRocketEligible && 'bg-[#D89575] dark:bg-[#B87A5E]',
                        isNone && 'border border-border bg-transparent',
                        isRocketEligible && 'cursor-pointer ring-2 ring-[#D89575] ring-offset-1',
                        !isRocketEligible && 'cursor-default'
                      )}
                    >
                      {isRocketEligible && (
                        <Rocket className="size-3 animate-pulse text-[#D89575]" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
