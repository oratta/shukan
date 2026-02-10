'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Habit, HabitCompletion, HabitWithStats } from '@/types/habit';
import {
  getItem,
  setItem,
  HABITS_KEY,
  COMPLETIONS_KEY,
} from '@/lib/storage';
import {
  generateId,
  getTodayString,
  getHabitsWithStats,
} from '@/lib/habits';

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedHabits = getItem<Habit[]>(HABITS_KEY) ?? [];
    const storedCompletions =
      getItem<HabitCompletion[]>(COMPLETIONS_KEY) ?? [];
    setHabits(storedHabits);
    setCompletions(storedCompletions);
    setLoading(false);
  }, []);

  const persistHabits = useCallback((updated: Habit[]) => {
    setHabits(updated);
    setItem(HABITS_KEY, updated);
  }, []);

  const persistCompletions = useCallback((updated: HabitCompletion[]) => {
    setCompletions(updated);
    setItem(COMPLETIONS_KEY, updated);
  }, []);

  const addHabit = useCallback(
    (habit: Omit<Habit, 'id' | 'createdAt' | 'archived'>) => {
      const newHabit: Habit = {
        ...habit,
        id: generateId(),
        createdAt: new Date().toISOString(),
        archived: false,
      };
      persistHabits([...habits, newHabit]);
      return newHabit;
    },
    [habits, persistHabits]
  );

  const updateHabit = useCallback(
    (id: string, updates: Partial<Omit<Habit, 'id' | 'createdAt'>>) => {
      const updated = habits.map((h) =>
        h.id === id ? { ...h, ...updates } : h
      );
      persistHabits(updated);
    },
    [habits, persistHabits]
  );

  const deleteHabit = useCallback(
    (id: string) => {
      persistHabits(habits.filter((h) => h.id !== id));
      persistCompletions(completions.filter((c) => c.habitId !== id));
    },
    [habits, completions, persistHabits, persistCompletions]
  );

  const toggleCompletion = useCallback(
    (habitId: string) => {
      const today = getTodayString();
      const existing = completions.find(
        (c) => c.habitId === habitId && c.date === today
      );

      if (existing) {
        persistCompletions(
          completions.filter(
            (c) => !(c.habitId === habitId && c.date === today)
          )
        );
      } else {
        persistCompletions([
          ...completions,
          {
            habitId,
            date: today,
            completedAt: new Date().toISOString(),
          },
        ]);
      }
    },
    [completions, persistCompletions]
  );

  const getStats = useCallback((): HabitWithStats[] => {
    return getHabitsWithStats(habits, completions);
  }, [habits, completions]);

  return {
    habits,
    completions,
    loading,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleCompletion,
    getStats,
  };
}
