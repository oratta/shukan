'use client';

import { useMemo, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Rocket, X, Pencil, ChevronRight, ChevronLeft, Settings } from 'lucide-react';
import { HabitIcon } from '@/components/ui/habit-icon';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { getArticle } from '@/data/impact-articles';
import { ImpactBadge } from '@/components/habits/impact-badge';
import { SavingsCard } from '@/components/habits/savings-card';
import { EvidenceManagerSheet } from '@/components/habits/evidence-manager-sheet';
import { HelpButton } from '@/components/ui/help-button';
import type { HabitWithStats, DayStatus } from '@/types/habit';

interface HabitDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit: HabitWithStats | null;
  onUseRocket: (habitId: string, date: string) => void;
  onDayStatusChange?: (habitId: string, date: string, status: 'completed' | 'failed' | 'none') => void;
  onEdit?: (id: string) => void;
  onOpenArticle?: (articleId: string) => void;
  onAddEvidence?: (habitId: string, articleId: string, weight?: number) => void;
  onRemoveEvidence?: (habitId: string, evidenceId: string) => void;
  onSetWeight?: (habitId: string, evidenceId: string, weight: number) => void;
}

function getDayOfWeekMondayBased(dateStr: string): number {
  const d = new Date(dateStr);
  const day = d.getDay();
  return day === 0 ? 6 : day - 1;
}

function getDateString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function nextStatus(current: DayStatus['status'] | null): 'completed' | 'failed' | 'none' {
  if (!current || current === 'none') return 'completed';
  if (current === 'completed' || current === 'rocket_used') return 'failed';
  return 'none';
}

interface CalendarCell {
  date: string;
  dayOfMonth: number;
  status: DayStatus['status'] | null;
}

function buildCalendarGrid(
  year: number,
  month: number,
  allDays: DayStatus[]
): (CalendarCell | null)[][] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDateStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const firstDow = getDayOfWeekMondayBased(firstDateStr);

  const statusMap = new Map<string, DayStatus['status']>();
  for (const day of allDays) {
    statusMap.set(day.date, day.status);
  }

  const cells: (CalendarCell | null)[] = [];

  // Pad beginning
  for (let i = 0; i < firstDow; i++) cells.push(null);

  // Fill all days of month
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const status = statusMap.get(dateStr) ?? null;
    cells.push({ date: dateStr, dayOfMonth: d, status });
  }

  // Pad end
  while (cells.length % 7 !== 0) cells.push(null);

  const rows: (CalendarCell | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }
  return rows;
}

export function HabitDetailModal({
  open,
  onOpenChange,
  habit,
  onUseRocket,
  onDayStatusChange,
  onEdit,
  onOpenArticle,
  onAddEvidence,
  onRemoveEvidence,
  onSetWeight,
}: HabitDetailModalProps) {
  const t = useTranslations('stats');
  const tHabits = useTranslations('habits');
  const tDays = useTranslations('days');
  const tEvidence = useTranslations('evidence');
  const [rocketConfirmDate, setRocketConfirmDate] = useState<string | null>(null);
  const [evidenceManagerOpen, setEvidenceManagerOpen] = useState(false);

  // History month navigation (single state to avoid stale closures)
  const now = new Date();
  const [historyPeriod, setHistoryPeriod] = useState({ year: now.getFullYear(), month: now.getMonth() });

  // Reset to current month when modal opens with a new habit
  const [lastHabitId, setLastHabitId] = useState<string | null>(null);
  if (habit && habit.id !== lastHabitId) {
    setLastHabitId(habit.id);
    setHistoryPeriod({ year: now.getFullYear(), month: now.getMonth() });
  }

  const navigateMonth = useCallback((delta: number) => {
    setHistoryPeriod((prev) => {
      let newMonth = prev.month + delta;
      let newYear = prev.year;
      if (newMonth < 0) {
        newMonth = 11;
        newYear--;
      } else if (newMonth > 11) {
        newMonth = 0;
        newYear++;
      }
      return { year: newYear, month: newMonth };
    });
  }, []);

  const dayLabelsLocalized = [
    tDays('mon'), tDays('tue'), tDays('wed'), tDays('thu'),
    tDays('fri'), tDays('sat'), tDays('sun'),
  ];

  const calendarGrid = useMemo(() => {
    if (!habit) return [];
    return buildCalendarGrid(historyPeriod.year, historyPeriod.month, habit.allDays);
  }, [habit, historyPeriod.year, historyPeriod.month]);

  // Tappable dates: last 5 days (today + 4 previous)
  const tappableDates = useMemo(() => {
    const set = new Set<string>();
    const today = new Date();
    for (let i = 0; i < 5; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      set.add(getDateString(d));
    }
    return set;
  }, []);

  // Rocket-eligible: failed days > 5 days old
  const rocketEligibleDates = useMemo(() => {
    if (!habit || habit.rockets <= 0) return new Set<string>();
    const set = new Set<string>();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (const day of habit.allDays) {
      if (day.status === 'failed') {
        const d = new Date(day.date);
        d.setHours(0, 0, 0, 0);
        const diff = Math.round((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
        if (diff > 5) set.add(day.date);
      }
    }
    return set;
  }, [habit]);

  // Resolve evidence articles for display
  const evidenceArticles = useMemo(() => {
    if (!habit) return [];
    return habit.evidences
      .map((ev) => {
        const article = getArticle(ev.articleId);
        return article ? { evidence: ev, article } : null;
      })
      .filter(Boolean) as { evidence: typeof habit.evidences[number]; article: NonNullable<ReturnType<typeof getArticle>> }[];
  }, [habit]);

  if (!habit) return null;

  const streakPercent = Math.round((habit.currentStreak / 30) * 100);
  const bestPercent = Math.round((habit.longestStreak / 30) * 100);

  const canGoBack = habit.allDays.length > 0 && (() => {
    const [y, m] = habit.allDays[0].date.split('-').map(Number);
    return new Date(y, m - 1, 1) < new Date(historyPeriod.year, historyPeriod.month, 1);
  })();
  const canGoForward = historyPeriod.year < now.getFullYear() ||
    (historyPeriod.year === now.getFullYear() && historyPeriod.month < now.getMonth());

  const monthLabel = `${historyPeriod.year}年${historyPeriod.month + 1}月`;
  const todayStr = getDateString(now);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[92vh] overflow-y-auto p-0 sm:max-w-md"
      >
        <DialogTitle className="sr-only">{habit.name}</DialogTitle>
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5">
          <h2 className="text-xl font-bold">{habit.name}</h2>
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(habit.id)}
                className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80"
              >
                <Pencil className="size-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80"
            >
              <X className="size-4" />
            </button>
          </div>
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

        {/* Impact Badge */}
        {habit.evidences.length > 0 && (
          <div className="px-5">
            <ImpactBadge evidences={habit.evidences} mode="daily" />
          </div>
        )}

        {/* Stats Row */}
        <div className="flex gap-3 px-5">
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

        {/* Savings Card */}
        {habit.impactSavings && (
          <div className="px-5">
            <SavingsCard savings={habit.impactSavings} />
          </div>
        )}

        {/* Evidence Section */}
        {evidenceArticles.length > 0 && (
          <div className="px-5">
            <div className="mb-2 flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground">
                {tEvidence('title')}
              </p>
            </div>
            <div className="space-y-1.5">
              {evidenceArticles.map(({ evidence, article }) => (
                <button
                  key={evidence.id}
                  type="button"
                  onClick={() => onOpenArticle?.(evidence.articleId)}
                  className="flex w-full items-center gap-3 rounded-xl border border-[#E5E4E1] bg-card px-3.5 py-3 text-left transition-colors hover:bg-accent/50"
                >
                  <HabitIcon name={article.defaultIcon} size={18} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{article.habitName}</p>
                    {evidence.weight < 100 && (
                      <p className="text-[10px] text-muted-foreground">
                        {tEvidence('weight')}: {evidence.weight}%
                      </p>
                    )}
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </button>
              ))}
            </div>
            {/* Manage Evidence bar */}
            {onAddEvidence && onRemoveEvidence && onSetWeight && (
              <button
                type="button"
                onClick={() => setEvidenceManagerOpen(true)}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#D4E8DA] bg-[#F8FBF9] px-3.5 py-2.5 text-sm font-medium text-[#3D8A5A] transition-colors hover:bg-[#EDF5F0]"
              >
                <Settings className="size-4" />
                {tEvidence('manage')}
              </button>
            )}
          </div>
        )}

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

        {/* History Calendar */}
        <div className="px-5 pb-5">
          {/* Section header */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground">
                {tHabits('history')}
              </p>
              <HelpButton title={tHabits('historyHelpTitle')}>
                <div className="space-y-2">
                  <p>{tHabits('historyHelp1')}</p>
                  <p>{tHabits('historyHelp2')}</p>
                  <p>{tHabits('historyHelp3')}</p>
                  <p>{tHabits('historyHelp4')}</p>
                </div>
              </HelpButton>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigateMonth(-1)}
                disabled={!canGoBack}
                className="flex size-7 items-center justify-center rounded-full transition-colors hover:bg-muted disabled:opacity-30"
              >
                <ChevronLeft className="size-4" />
              </button>
              <span className="min-w-[5.5rem] text-center text-xs font-medium text-muted-foreground">
                {monthLabel}
              </span>
              <button
                type="button"
                onClick={() => navigateMonth(1)}
                disabled={!canGoForward}
                className="flex size-7 items-center justify-center rounded-full transition-colors hover:bg-muted disabled:opacity-30"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

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

          {/* Calendar grid */}
          <div className="flex flex-col gap-1">
            {calendarGrid.map((row, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-7 gap-1">
                {row.map((cell, colIndex) => {
                  if (!cell) {
                    return <div key={`empty-${colIndex}`} className="aspect-square" />;
                  }

                  const { date, dayOfMonth, status } = cell;
                  const isToday = date === todayStr;
                  const isTappable = tappableDates.has(date) && !!onDayStatusChange;
                  const isRocketEligible = rocketEligibleDates.has(date);
                  const isCompleted = status === 'completed' || status === 'rocket_used';
                  const isFailed = status === 'failed';
                  const [fy, fm, fd] = date.split('-').map(Number);
                  const isFuture = new Date(fy, fm - 1, fd) > new Date(now.getFullYear(), now.getMonth(), now.getDate());

                  return (
                    <button
                      key={date}
                      type="button"
                      disabled={!isTappable && !isRocketEligible}
                      onClick={() => {
                        if (isRocketEligible) {
                          setRocketConfirmDate(date);
                        } else if (isTappable) {
                          onDayStatusChange!(habit.id, date, nextStatus(status));
                        }
                      }}
                      className={cn(
                        'relative flex aspect-square items-center justify-center rounded-lg text-[10px] font-medium transition-all',
                        // Status colors
                        isCompleted && 'bg-green-500 text-white dark:bg-green-600',
                        isFailed && !isRocketEligible && 'bg-[#D89575] text-white dark:bg-[#B87A5E]',
                        !isCompleted && !isFailed && !isFuture && 'text-foreground',
                        isFuture && 'text-muted-foreground/40',
                        // Tappable border (last 5 days)
                        isTappable && !isCompleted && !isFailed && 'ring-1.5 ring-primary/40 ring-inset',
                        isTappable && 'cursor-pointer',
                        // Rocket eligible
                        isRocketEligible && 'cursor-pointer ring-2 ring-[#D89575] ring-offset-1',
                        // Today highlight
                        isToday && !isCompleted && !isFailed && 'font-bold',
                        // Non-interactive
                        !isTappable && !isRocketEligible && 'cursor-default',
                      )}
                    >
                      {status === 'rocket_used' ? (
                        <Rocket className="size-3 text-white" />
                      ) : isRocketEligible ? (
                        <Rocket className="size-3 animate-pulse text-white" />
                      ) : (
                        dayOfMonth
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>

      {/* Rocket confirmation dialog */}
      <AlertDialog
        open={rocketConfirmDate !== null}
        onOpenChange={(o) => { if (!o) setRocketConfirmDate(null); }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>{tHabits('rocketConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {tHabits('rocketConfirmDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tHabits('rocketConfirmCancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (rocketConfirmDate && habit) {
                  onUseRocket(habit.id, rocketConfirmDate);
                  setRocketConfirmDate(null);
                }
              }}
            >
              {tHabits('rocketConfirmOk')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Evidence Manager Sheet */}
      {onAddEvidence && onRemoveEvidence && onSetWeight && (
        <EvidenceManagerSheet
          open={evidenceManagerOpen}
          onOpenChange={setEvidenceManagerOpen}
          habitId={habit.id}
          evidences={habit.evidences}
          onAddEvidence={onAddEvidence}
          onRemoveEvidence={onRemoveEvidence}
          onSetWeight={onSetWeight}
        />
      )}
    </Dialog>
  );
}
