'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Habit, HabitCompletion, HabitWithStats, CopingStep, UrgeLog } from '@/types/habit';
import { useAuth } from '@/components/auth-provider';
import { getTodayString, getHabitsWithStats } from '@/lib/habits';
import {
  fetchHabits,
  fetchCompletions,
  insertHabit,
  updateHabitById,
  deleteHabitById,
  deleteCompletion,
  upsertCompletion,
  fetchCopingSteps,
  upsertCopingSteps,
  fetchUrgeLogsForDate,
  insertUrgeLog,
  updateUrgeLog,
} from '@/lib/supabase/habits';

export function useHabits() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [copingStepsMap, setCopingStepsMap] = useState<Map<string, CopingStep[]>>(new Map());
  const [urgeLogs, setUrgeLogs] = useState<UrgeLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setHabits([]);
      setCompletions([]);
      setCopingStepsMap(new Map());
      setUrgeLogs([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const [h, c] = await Promise.all([fetchHabits(), fetchCompletions()]);
        if (cancelled) return;

        setHabits(h);
        setCompletions(c);

        // Load coping steps for quit habits
        const quitHabits = h.filter((habit) => habit.type === 'quit');
        if (quitHabits.length > 0) {
          const stepsEntries = await Promise.all(
            quitHabits.map(async (habit) => {
              const steps = await fetchCopingSteps(habit.id);
              return [habit.id, steps] as [string, CopingStep[]];
            })
          );
          if (!cancelled) {
            setCopingStepsMap(new Map(stepsEntries));
          }
        }

        // Load today's urge logs
        const today = getTodayString();
        const logs = await fetchUrgeLogsForDate(today);
        if (!cancelled) {
          setUrgeLogs(logs);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [user]);

  const addHabit = useCallback(
    async (habit: Omit<Habit, 'id' | 'createdAt' | 'archived'>, copingSteps?: { title: string; sortOrder: number }[]) => {
      if (!user) return;
      const newHabit = await insertHabit(user.id, habit);
      setHabits((prev) => [...prev, newHabit]);
      if (copingSteps && copingSteps.length > 0 && newHabit.type === 'quit') {
        const steps = await upsertCopingSteps(newHabit.id, copingSteps);
        setCopingStepsMap((prev) => new Map(prev).set(newHabit.id, steps));
      }
      return newHabit;
    },
    [user]
  );

  const updateHabit = useCallback(
    async (id: string, updates: Partial<Omit<Habit, 'id' | 'createdAt'>>, copingSteps?: { title: string; sortOrder: number }[]) => {
      await updateHabitById(id, updates);
      setHabits((prev) =>
        prev.map((h) => (h.id === id ? { ...h, ...updates } : h))
      );
      if (copingSteps) {
        const steps = await upsertCopingSteps(id, copingSteps);
        setCopingStepsMap((prev) => new Map(prev).set(id, steps));
      }
    },
    []
  );

  const deleteHabit = useCallback(
    async (id: string) => {
      await deleteHabitById(id);
      setHabits((prev) => prev.filter((h) => h.id !== id));
      setCompletions((prev) => prev.filter((c) => c.habitId !== id));
      setUrgeLogs((prev) => prev.filter((l) => l.habitId !== id));
      setCopingStepsMap((prev) => {
        const next = new Map(prev);
        next.delete(id);
        return next;
      });
    },
    []
  );

  const setDayStatus = useCallback(
    async (habitId: string, date: string, status: 'completed' | 'failed' | 'none') => {
      if (!user) return;
      if (status === 'none') {
        await deleteCompletion(habitId, date);
        setCompletions((prev) =>
          prev.filter((c) => !(c.habitId === habitId && c.date === date))
        );
      } else {
        const updated = await upsertCompletion(user.id, habitId, date, status);
        setCompletions((prev) => {
          const filtered = prev.filter((c) => !(c.habitId === habitId && c.date === date));
          return [...filtered, updated];
        });
      }
    },
    [user]
  );

  const markQuitDailyDone = useCallback(
    async (habitId: string) => {
      if (!user) return;
      const today = getTodayString();
      const updated = await upsertCompletion(user.id, habitId, today, 'completed');
      setCompletions((prev) => {
        const filtered = prev.filter((c) => !(c.habitId === habitId && c.date === today));
        return [...filtered, updated];
      });
    },
    [user]
  );

  const startUrgeFlow = useCallback(async (habitId: string): Promise<UrgeLog> => {
    if (!user) throw new Error('Not authenticated');
    const today = getTodayString();
    const log = await insertUrgeLog(user.id, habitId, today);
    setUrgeLogs((prev) => [...prev, log]);
    return log;
  }, [user]);

  const completeUrgeStep = useCallback(async (logId: string, stepId: string, allDone: boolean) => {
    const log = urgeLogs.find((l) => l.id === logId);
    if (!log) return;
    const newSteps = [...log.completedSteps, stepId];
    await updateUrgeLog(logId, newSteps, allDone);
    setUrgeLogs((prev) =>
      prev.map((l) => l.id === logId ? { ...l, completedSteps: newSteps, allCompleted: allDone } : l)
    );
  }, [urgeLogs]);

  const getStats = useCallback((): HabitWithStats[] => {
    return getHabitsWithStats(habits, completions, urgeLogs, copingStepsMap);
  }, [habits, completions, urgeLogs, copingStepsMap]);

  return {
    habits,
    completions,
    loading,
    addHabit,
    updateHabit,
    deleteHabit,
    setDayStatus,
    markQuitDailyDone,
    getStats,
    copingStepsMap,
    urgeLogs,
    startUrgeFlow,
    completeUrgeStep,
  };
}
