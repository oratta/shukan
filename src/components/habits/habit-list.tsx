'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { HabitCard } from '@/components/habits/habit-card';
import { Button } from '@/components/ui/button';
import type { HabitWithStats } from '@/types/habit';

interface HabitListProps {
  habits: HabitWithStats[];
  onToggle: (id: string) => void;
  onEdit: (id: string) => void;
  onAdd: () => void;
  onActions: (id: string) => void;
  onUrge: (id: string) => void;
}

export function HabitList({ habits, onToggle, onEdit, onAdd, onActions, onUrge }: HabitListProps) {
  const t = useTranslations('habits');

  const sortedHabits = useMemo(() => {
    return [...habits].sort((a, b) => {
      if (a.completedToday !== b.completedToday) {
        return a.completedToday ? 1 : -1;
      }
      return 0;
    });
  }, [habits]);

  return (
    <div className="relative">
      {sortedHabits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 text-5xl">🌱</div>
          <h3 className="mb-1 text-lg font-semibold">{t('empty')}</h3>
          <Button onClick={onAdd} size="sm" className="mt-4">
            <Plus className="size-4" />
            {t('add')}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedHabits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onToggle={onToggle}
              onEdit={onEdit}
              onActions={onActions}
              onUrge={onUrge}
            />
          ))}
        </div>
      )}

      {sortedHabits.length > 0 && (
        <Button
          onClick={onAdd}
          size="icon"
          className="fixed bottom-20 right-4 z-30 size-14 rounded-full shadow-lg md:bottom-8 md:right-8"
        >
          <Plus className="size-6" />
        </Button>
      )}
    </div>
  );
}
