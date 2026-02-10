'use client';

import { Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ProgressRing } from '@/components/habits/progress-ring';
import { StreakBadge } from '@/components/habits/streak-badge';
import { cn } from '@/lib/utils';
import type { HabitWithStats } from '@/types/habit';

interface HabitCardProps {
  habit: HabitWithStats;
  onToggle: (id: string) => void;
  onEdit: (id: string) => void;
}

export function HabitCard({ habit, onToggle, onEdit }: HabitCardProps) {
  return (
    <Card
      className={cn(
        'group cursor-pointer gap-0 py-0 transition-all duration-200 hover:shadow-md active:scale-[0.98]',
        habit.completedToday &&
          'border-green-200 bg-green-50/50 dark:border-green-900/50 dark:bg-green-950/20'
      )}
      onClick={() => onToggle(habit.id)}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onEdit(habit.id);
      }}
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
          {habit.description && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {habit.description}
            </p>
          )}
        </div>

        <div className="shrink-0">
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
        </div>
      </div>
    </Card>
  );
}
