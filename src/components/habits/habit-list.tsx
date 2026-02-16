'use client';

import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { HabitCard } from '@/components/habits/habit-card';
import { Button } from '@/components/ui/button';
import type { HabitWithStats } from '@/types/habit';

interface HabitListProps {
  habits: HabitWithStats[];
  onDayStatusChange: (habitId: string, date: string, status: 'completed' | 'failed' | 'none') => void;
  onAdd: () => void;
  onActions: (id: string) => void;
  onOpenDetail: (id: string) => void;
  onOpenVsTemptation: (id: string) => void;
}

export function HabitList({
  habits,
  onDayStatusChange,
  onAdd,
  onActions,
  onOpenDetail,
  onOpenVsTemptation,
}: HabitListProps) {
  const t = useTranslations('habits');
  const [expandedHabitId, setExpandedHabitId] = useState<string | null>(null);

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedHabitId((prev) => (prev === id ? null : id));
  }, []);

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
              isExpanded={expandedHabitId === habit.id}
              onToggleExpand={handleToggleExpand}
              onDayStatusChange={onDayStatusChange}
              onOpenDetail={onOpenDetail}
              onOpenVsTemptation={onOpenVsTemptation}
              onActions={onActions}
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
