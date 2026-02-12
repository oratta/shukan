'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Habit, HabitCompletion, HabitWithStats } from '@/types/habit';
import { useAuth } from '@/components/auth-provider';
import { getTodayString, getHabitsWithStats } from '@/lib/habits';
import {
  fetchHabits,
  fetchCompletions,
  insertHabit,
  updateHabitById,
  deleteHabitById,
  insertCompletion,
  deleteCompletion,
} from '@/lib/supabase/habits';

export function useHabits() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setHabits([]);
      setCompletions([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const [h, c] = await Promise.all([fetchHabits(), fetchCompletions()]);
        if (!cancelled) {
          setHabits(h);
          setCompletions(c);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [user]);

  const addHabit = useCallback(
    async (habit: Omit<Habit, 'id' | 'createdAt' | 'archived'>) => {
      if (!user) return;
      const newHabit = await insertHabit(user.id, habit);
      setHabits((prev) => [...prev, newHabit]);
      return newHabit;
    },
    [user]
  );

  const updateHabit = useCallback(
    async (id: string, updates: Partial<Omit<Habit, 'id' | 'createdAt'>>) => {
      await updateHabitById(id, updates);
      setHabits((prev) =>
        prev.map((h) => (h.id === id ? { ...h, ...updates } : h))
      );
    },
    []
  );

  const deleteHabit = useCallback(
    async (id: string) => {
      await deleteHabitById(id);
      setHabits((prev) => prev.filter((h) => h.id !== id));
      setCompletions((prev) => prev.filter((c) => c.habitId !== id));
    },
    []
  );

  const toggleCompletion = useCallback(
    async (habitId: string) => {
      if (!user) return;
      const today = getTodayString();
      const existing = completions.find(
        (c) => c.habitId === habitId && c.date === today
      );

      if (existing) {
        await deleteCompletion(habitId, today);
        setCompletions((prev) =>
          prev.filter((c) => !(c.habitId === habitId && c.date === today))
        );
      } else {
        const newCompletion = await insertCompletion(user.id, habitId, today);
        setCompletions((prev) => [...prev, newCompletion]);
      }
    },
    [user, completions]
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
