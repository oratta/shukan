'use client';

import { useTranslations } from 'next-intl';
import { Check, MoreVertical, Shield, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { StreakBadge } from '@/components/habits/streak-badge';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getTodayString } from '@/lib/habits';
import type { DayStatus, HabitWithStats } from '@/types/habit';

interface HabitCardProps {
  habit: HabitWithStats;
  onDayStatusChange: (habitId: string, date: string, status: 'completed' | 'failed' | 'none') => void;
  onEdit: (id: string) => void;
  onActions: (id: string) => void;
  onQuitToday?: (id: string) => void;
}

function DayStatusDot({
  day,
  isToday,
  habitColor,
  onTap,
}: {
  day: DayStatus;
  isToday: boolean;
  habitColor: string;
  onTap: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onTap}
      className={cn(
        'flex items-center justify-center rounded-full size-7 transition-all',
        day.status === 'completed' && 'bg-green-500 text-white',
        day.status === 'failed' && 'bg-red-400 text-white',
        day.status === 'none' && 'bg-muted',
        isToday && 'ring-2 ring-offset-1 ring-offset-background ring-primary/50',
      )}
    >
      {day.status === 'completed' && <Check className="size-3.5" />}
      {day.status === 'failed' && <X className="size-3.5" />}
    </button>
  );
}

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

function nextStatus(current: 'completed' | 'failed' | 'none'): 'completed' | 'failed' | 'none' {
  if (current === 'none') return 'completed';
  if (current === 'completed') return 'failed';
  return 'none';
}

export function HabitCard({ habit, onDayStatusChange, onEdit, onActions, onQuitToday }: HabitCardProps) {
  const t = useTranslations('habits');
  const tDays = useTranslations('days');
  const isQuit = habit.type === 'quit';

  const today = getTodayString();

  const handleDotTap = (day: DayStatus) => {
    if (isQuit && day.date === today) {
      onQuitToday?.(habit.id);
    } else {
      onDayStatusChange(habit.id, day.date, nextStatus(day.status));
    }
  };

  return (
    <Card
      className={cn(
        'group relative gap-0 py-0 transition-all duration-200',
        habit.completedToday &&
          'border-green-200 bg-green-50/50 dark:border-green-900/50 dark:bg-green-950/20'
      )}
    >
      <div className="flex items-center gap-3 p-4">
        <div
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-xl text-xl transition-all duration-200',
            habit.completedToday
              ? 'bg-green-100 dark:bg-green-900/40'
              : 'bg-muted'
          )}
        >
          {habit.completedToday ? (
            <Check className="size-5 text-green-600 dark:text-green-400" />
          ) : isQuit ? (
            <Shield className="size-5 text-orange-500" />
          ) : (
            <span>{habit.icon}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3
              className={cn(
                'truncate text-sm font-semibold',
                habit.completedToday &&
                  'text-green-700 line-through decoration-green-300 dark:text-green-400 dark:decoration-green-700'
              )}
            >
              {habit.name}
            </h3>
            <StreakBadge count={habit.currentStreak} />
          </div>
          {isQuit ? (
            <div className="mt-0.5 flex items-center gap-1.5">
              <Badge variant="secondary" className="text-xs">
                {t('urgeProgress', {
                  current: habit.todayUrgeCount ?? 0,
                  target: habit.dailyTarget,
                })}
              </Badge>
            </div>
          ) : (
            habit.description && (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {habit.description}
              </p>
            )
          )}
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <div className="flex items-center gap-1">
            {(habit.recentDays ?? []).map((day) => {
              const [y, m, d] = day.date.split('-').map(Number);
              const dayKey = DAY_KEYS[new Date(y, m - 1, d).getDay()];
              return (
                <div key={day.date} className="flex flex-col items-center gap-0.5">
                  <DayStatusDot
                    day={day}
                    isToday={day.date === today}
                    habitColor={habit.color}
                    onTap={() => handleDotTap(day)}
                  />
                  <span className="text-[10px] text-muted-foreground leading-none">
                    {tDays(dayKey).charAt(0)}
                  </span>
                </div>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => onActions(habit.id)}
            className="shrink-0 rounded-full p-1 hover:bg-accent"
          >
            <MoreVertical className="size-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </Card>
  );
}
