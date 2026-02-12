'use client';

import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { HabitList } from '@/components/habits/habit-list';
import { HabitForm } from '@/components/habits/habit-form';
import { useHabits } from '@/hooks/useHabits';
import { shouldShowToday, getHabitsWithStats } from '@/lib/habits';
import type { Habit } from '@/types/habit';

export default function DashboardPage() {
  const t = useTranslations();
  const { habits, completions, loading, addHabit, updateHabit, toggleCompletion } = useHabits();
  const [formOpen, setFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const todayHabits = useMemo(() => {
    const filtered = habits.filter(shouldShowToday);
    return getHabitsWithStats(filtered, completions);
  }, [habits, completions]);

  const completedCount = todayHabits.filter((h) => h.completedToday).length;
  const totalCount = todayHabits.length;

  const handleAdd = useCallback(() => {
    setEditingHabit(null);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback(
    (id: string) => {
      const habit = habits.find((h) => h.id === id);
      if (habit) {
        setEditingHabit(habit);
        setFormOpen(true);
      }
    },
    [habits]
  );

  const handleSubmit = useCallback(
    (data: Omit<Habit, 'id' | 'createdAt' | 'archived'>) => {
      if (editingHabit) {
        updateHabit(editingHabit.id, data);
      } else {
        addHabit(data);
      }
      setEditingHabit(null);
    },
    [editingHabit, addHabit, updateHabit]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {t('habits.title')}
        </h2>
        {totalCount > 0 && (
          <p className="mt-1 text-sm text-muted-foreground">
            {completedCount}/{totalCount} {t('habits.completed').toLowerCase()}
          </p>
        )}
      </div>

      {totalCount > 0 && (
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-green-500 transition-all duration-500 ease-out"
            style={{
              width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`,
            }}
          />
        </div>
      )}

      <HabitList
        habits={todayHabits}
        onToggle={toggleCompletion}
        onEdit={handleEdit}
        onAdd={handleAdd}
      />

      <HabitForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
        initialData={editingHabit ?? undefined}
      />
    </div>
  );
}
