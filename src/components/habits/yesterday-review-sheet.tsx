'use client';

import { useState, useCallback, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { HabitIcon } from '@/components/ui/habit-icon';
import { Check, Minus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Habit, HabitCompletion, DayStatus } from '@/types/habit';
import { MOOD_ICONS } from '@/lib/mood-icons';

interface YesterdayReviewSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habits: Habit[];
  completions: HabitCompletion[];
  yesterdayDate: string;
  onDayStatusChange: (habitId: string, date: string, status: 'completed' | 'failed' | 'none' | 'skipped') => void;
  onNoteChange: (habitId: string, date: string, note: string) => void;
  onSaveReflection: (mood: number | undefined, comment: string) => void;
}

type SelectableStatus = 'completed' | 'skipped' | 'failed';

const STATUS_BUTTONS: { status: SelectableStatus; Icon: typeof Check; activeClass: string }[] = [
  {
    status: 'completed',
    Icon: Check,
    activeClass: 'bg-success/10 border-success text-success',
  },
  {
    status: 'skipped',
    Icon: Minus,
    activeClass: 'bg-gray-200 border-gray-400 text-gray-600 dark:bg-gray-700 dark:border-gray-500 dark:text-gray-300',
  },
  {
    status: 'failed',
    Icon: X,
    activeClass: 'bg-[#D08068]/10 border-[#D08068] text-[#D08068]',
  },
];

export function YesterdayReviewSheet({
  open,
  onOpenChange,
  habits,
  completions,
  yesterdayDate,
  onDayStatusChange,
  onNoteChange,
  onSaveReflection,
}: YesterdayReviewSheetProps) {
  const t = useTranslations('habits');
  const locale = useLocale();
  const [mood, setMood] = useState<number | undefined>(undefined);
  const [comment, setComment] = useState('');
  const [noteValues, setNoteValues] = useState<Record<string, string>>({});

  // Reset local state when sheet opens
  useEffect(() => {
    if (open) {
      setMood(undefined);
      setComment('');
      setNoteValues({});
    }
  }, [open]);

  const formattedDate = new Date(yesterdayDate + 'T00:00:00').toLocaleDateString(locale, {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

  const getStatus = useCallback(
    (habitId: string): DayStatus['status'] => {
      const completion = completions.find(
        (c) => c.habitId === habitId && c.date === yesterdayDate
      );
      return completion ? completion.status : 'none';
    },
    [completions, yesterdayDate]
  );

  const getNote = useCallback(
    (habitId: string): string => {
      if (noteValues[habitId] !== undefined) return noteValues[habitId];
      const completion = completions.find(
        (c) => c.habitId === habitId && c.date === yesterdayDate
      );
      return completion?.note ?? '';
    },
    [completions, yesterdayDate, noteValues]
  );

  const handleStatusSelect = useCallback(
    (habitId: string, tapped: SelectableStatus) => {
      const current = getStatus(habitId);
      // If same status tapped, reset to none. Otherwise, set to tapped.
      const next = current === tapped ? 'none' : tapped;
      onDayStatusChange(habitId, yesterdayDate, next);
    },
    [getStatus, onDayStatusChange, yesterdayDate]
  );

  const handleNoteBlur = useCallback(
    (habitId: string) => {
      const note = noteValues[habitId] ?? '';
      const status = getStatus(habitId);
      if (status !== 'none') {
        onNoteChange(habitId, yesterdayDate, note);
      }
    },
    [noteValues, getStatus, onNoteChange, yesterdayDate]
  );

  const handleDone = useCallback(() => {
    onSaveReflection(mood, comment);
    onOpenChange(false);
  }, [mood, comment, onSaveReflection, onOpenChange]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto rounded-t-2xl pb-safe">
        <SheetHeader className="pb-2">
          <SheetTitle className="text-base">
            {t('reviewTitle', { date: formattedDate })}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-3 px-4 pb-2">
          {habits.map((habit) => {
            const status = getStatus(habit.id);
            const note = getNote(habit.id);
            return (
              <div key={habit.id} className="flex flex-col gap-1.5">
                <div className="flex items-center gap-3">
                  {/* Habit icon */}
                  <div
                    className="size-8 rounded-full flex items-center justify-center shrink-0 bg-muted"
                  >
                    <HabitIcon name={habit.icon} size={16} />
                  </div>

                  {/* Habit name */}
                  <span className="flex-1 text-sm font-medium leading-snug">
                    {habit.name}
                  </span>

                  {/* Status select buttons */}
                  <div className="flex gap-1 shrink-0">
                    {STATUS_BUTTONS.map(({ status: btnStatus, Icon, activeClass }) => {
                      const isActive = status === btnStatus ||
                        (btnStatus === 'completed' && status === 'rocket_used');
                      return (
                        <button
                          key={btnStatus}
                          type="button"
                          onClick={() => handleStatusSelect(habit.id, btnStatus)}
                          className={cn(
                            'size-7 rounded-md border flex items-center justify-center transition-all',
                            isActive
                              ? activeClass
                              : 'border-muted-foreground/20 text-muted-foreground/40'
                          )}
                          aria-label={`${habit.name}: ${btnStatus}`}
                        >
                          <Icon size={14} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Memo field — shown when status is set */}
                {status !== 'none' && (
                  <div className="pl-11">
                    <input
                      type="text"
                      className="w-full text-xs border-b border-muted-foreground/20 bg-transparent py-0.5 outline-none placeholder:text-muted-foreground/50 focus:border-muted-foreground/50"
                      placeholder={t('reviewNotePlaceholder')}
                      value={note}
                      onChange={(e) =>
                        setNoteValues((prev) => ({ ...prev, [habit.id]: e.target.value }))
                      }
                      onBlur={() => handleNoteBlur(habit.id)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mood + Comment section */}
        <div className="px-4 pt-4 pb-2 flex flex-col gap-3 border-t border-border mt-2">
          <p className="text-sm font-medium text-muted-foreground">{t('reviewMoodLabel')}</p>
          <div className="flex gap-2 justify-center">
            {MOOD_ICONS.map(({ Icon, colorClass, value }) => (
              <button
                key={value}
                type="button"
                onClick={() => setMood(mood === value ? undefined : value)}
                className={cn(
                  'size-10 rounded-full border-2 flex items-center justify-center transition-all',
                  mood === value
                    ? 'border-primary bg-primary/10'
                    : 'border-muted-foreground/20 bg-transparent'
                )}
                aria-label={`Mood ${value}`}
              >
                <Icon size={20} className={colorClass} />
              </button>
            ))}
          </div>
          <textarea
            className="w-full text-sm border border-muted-foreground/20 rounded-lg bg-transparent p-2 outline-none placeholder:text-muted-foreground/50 focus:border-muted-foreground/50 resize-none"
            rows={2}
            placeholder={t('reviewCommentPlaceholder')}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <SheetFooter className="px-4 pt-2">
          <button
            type="button"
            onClick={handleDone}
            className="w-full rounded-xl bg-primary text-primary-foreground py-3 text-sm font-semibold transition-opacity hover:opacity-90 active:opacity-70"
          >
            {t('reviewDone')}
          </button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
