'use client';

import { useTranslations } from 'next-intl';
import { Check, MoreVertical, Shield } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ProgressRing } from '@/components/habits/progress-ring';
import { StreakBadge } from '@/components/habits/streak-badge';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { HabitWithStats } from '@/types/habit';

interface HabitCardProps {
  habit: HabitWithStats;
  onToggle: (id: string) => void;
  onEdit: (id: string) => void;
  onActions: (id: string) => void;
  onUrge?: (id: string) => void;
}

export function HabitCard({ habit, onToggle, onEdit, onActions, onUrge }: HabitCardProps) {
  const t = useTranslations('habits');
  const isQuit = habit.type === 'quit';

  const handleClick = () => {
    if (isQuit) {
      onUrge?.(habit.id);
    } else {
      onToggle(habit.id);
    }
  };

  return (
    <Card
      className={cn(
        'group relative cursor-pointer gap-0 py-0 transition-all duration-200 hover:shadow-md active:scale-[0.98]',
        habit.completedToday &&
          'border-green-200 bg-green-50/50 dark:border-green-900/50 dark:bg-green-950/20'
      )}
      onClick={handleClick}
    >
      <div className="flex items-center gap-3 p-4">
        <div
          className={cn(
            'flex size-12 shrink-0 items-center justify-center rounded-xl text-2xl transition-all duration-200',
            habit.completedToday
              ? 'bg-green-100 dark:bg-green-900/40'
              : 'bg-muted'
          )}
        >
          {habit.completedToday ? (
            <Check className="size-6 text-green-600 dark:text-green-400" />
          ) : isQuit ? (
            <Shield className="size-6 text-orange-500" />
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

        <div className="shrink-0">
          {!isQuit && (
            <ProgressRing
              progress={habit.completionRate}
              size={44}
              strokeWidth={3}
              color={
                habit.completedToday
                  ? 'oklch(0.6 0.18 145)'
                  : habit.color || 'oklch(0.6 0.2 260)'
              }
            />
          )}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onActions(habit.id);
          }}
          className="shrink-0 rounded-full p-1.5 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-accent focus:opacity-100"
        >
          <MoreVertical className="size-5 text-muted-foreground" />
        </button>
      </div>
    </Card>
  );
}
