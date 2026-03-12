'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Habit, HabitCompletion, HabitWithStats, CopingStep, UrgeLog } from '@/types/habit';
import { useAuth } from '@/components/auth-provider';
import { getTodayString, getHabitsWithStats } from '@/lib/habits';
import { getArticle } from '@/data/impact-articles';
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
  useRocketOnDate,
  updateHabitSortOrders,
  insertHabitEvidence,
  deleteHabitEvidence,
  updateHabitEvidenceWeight,
  replaceHabitEvidences,
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
    async (
      habit: Omit<Habit, 'id' | 'createdAt' | 'archived' | 'sortOrder'>,
      copingSteps?: { title: string; sortOrder: number }[],
      initialEvidences?: { articleId: string; weight: number }[]
    ) => {
      if (!user) return;
      const newHabit = await insertHabit(user.id, habit);
      if (copingSteps && copingSteps.length > 0 && newHabit.type === 'quit') {
        const steps = await upsertCopingSteps(newHabit.id, copingSteps);
        setCopingStepsMap((prev) => new Map(prev).set(newHabit.id, steps));
      }
      if (initialEvidences && initialEvidences.length > 0) {
        const evs = await replaceHabitEvidences(newHabit.id, initialEvidences);
        newHabit.evidences = evs;
      }
      setHabits((prev) => [...prev, newHabit]);
      return newHabit;
    },
    [user]
  );

  const updateHabit = useCallback(
    async (
      id: string,
      updates: Partial<Omit<Habit, 'id' | 'createdAt'>>,
      copingSteps?: { title: string; sortOrder: number }[],
      newEvidences?: { articleId: string; weight: number }[]
    ) => {
      await updateHabitById(id, updates);
      // Exclude evidences from optimistic update — evidences are managed via dedicated CRUD
      const { evidences: _ignored, ...safeUpdates } = updates;
      setHabits((prev) =>
        prev.map((h) => (h.id === id ? { ...h, ...safeUpdates } : h))
      );
      if (copingSteps) {
        const steps = await upsertCopingSteps(id, copingSteps);
        setCopingStepsMap((prev) => new Map(prev).set(id, steps));
      }
      if (newEvidences) {
        const evs = await replaceHabitEvidences(id, newEvidences);
        setHabits((prev) =>
          prev.map((h) => (h.id === id ? { ...h, evidences: evs } : h))
        );
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
    async (habitId: string, date: string, status: 'completed' | 'failed' | 'none' | 'skipped') => {
      if (!user) return;
      try {
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
      } catch (err) {
        console.error('setDayStatus failed:', err);
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

  const useRocket = useCallback(
    async (habitId: string, date: string) => {
      if (!user) return;
      const updated = await useRocketOnDate(user.id, habitId, date);
      setCompletions((prev) => {
        const filtered = prev.filter((c) => !(c.habitId === habitId && c.date === date));
        return [...filtered, updated];
      });
    },
    [user]
  );

  const addEvidence = useCallback(
    async (habitId: string, articleId: string, weight: number = 100) => {
      const ev = await insertHabitEvidence(habitId, articleId, weight);
      setHabits((prev) =>
        prev.map((h) =>
          h.id === habitId ? { ...h, evidences: [...h.evidences, ev] } : h
        )
      );
      return ev;
    },
    []
  );

  const removeEvidence = useCallback(
    async (habitId: string, evidenceId: string) => {
      await deleteHabitEvidence(evidenceId);
      setHabits((prev) =>
        prev.map((h) =>
          h.id === habitId
            ? { ...h, evidences: h.evidences.filter((e) => e.id !== evidenceId) }
            : h
        )
      );
    },
    []
  );

  const setEvidenceWeight = useCallback(
    async (habitId: string, evidenceId: string, weight: number) => {
      await updateHabitEvidenceWeight(evidenceId, weight);
      setHabits((prev) =>
        prev.map((h) =>
          h.id === habitId
            ? {
                ...h,
                evidences: h.evidences.map((e) =>
                  e.id === evidenceId ? { ...e, weight } : e
                ),
              }
            : h
        )
      );
    },
    []
  );

  const reorderHabits = useCallback(
    async (orderedIds: string[]) => {
      const updates = orderedIds.map((id, index) => ({ id, sortOrder: index }));
      // Optimistic update
      setHabits((prev) => {
        const map = new Map(prev.map((h) => [h.id, h]));
        return orderedIds
          .map((id, index) => {
            const habit = map.get(id);
            return habit ? { ...habit, sortOrder: index } : undefined;
          })
          .filter((h): h is Habit => h !== undefined);
      });
      try {
        await updateHabitSortOrders(updates);
      } catch (err) {
        console.error('reorderHabits failed:', err);
        // Reload on error
        const h = await fetchHabits();
        setHabits(h);
      }
    },
    []
  );

  const getStats = useCallback((): HabitWithStats[] => {
    return getHabitsWithStats(habits, completions, urgeLogs, copingStepsMap, getArticle);
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
    useRocket,
    reorderHabits,
    addEvidence,
    removeEvidence,
    setEvidenceWeight,
  };
}
