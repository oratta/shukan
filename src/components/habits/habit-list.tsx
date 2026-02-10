'use client';

import { useMemo } from 'react';
import { Plus } from 'lucide-react';
import { HabitCard } from '@/components/habits/habit-card';
import { Button } from '@/components/ui/button';
import type { HabitWithStats } from '@/types/habit';

interface HabitListProps {
  habits: HabitWithStats[];
  onToggle: (id: string) => void;
  onEdit: (id: string) => void;
  onAdd: () => void;
}

export function HabitList({ habits, onToggle, onEdit, onAdd }: HabitListProps) {
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
          <h3 className="mb-1 text-lg font-semibold">No habits yet</h3>
          <p className="mb-6 text-sm text-muted-foreground">
            Start building better habits today
          </p>
          <Button onClick={onAdd} size="sm">
            <Plus className="size-4" />
            Add your first habit
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
