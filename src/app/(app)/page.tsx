'use client';

import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { HabitList } from '@/components/habits/habit-list';
import { HabitForm } from '@/components/habits/habit-form';
import { HabitActions } from '@/components/habits/habit-actions';
import { HabitDetailModal } from '@/components/habits/habit-detail-modal';
import { VsTemptationModal } from '@/components/habits/vs-temptation-modal';
import { EvidenceArticleSheet } from '@/components/habits/evidence-article-sheet';
import { DailyImpactSummary } from '@/components/habits/daily-impact-summary';
import { useHabits } from '@/hooks/useHabits';
import { shouldShowToday, getHabitsWithStats } from '@/lib/habits';
import { getArticle } from '@/data/impact-articles';
import type { Habit } from '@/types/habit';

export default function DashboardPage() {
  const t = useTranslations();
  const {
    habits,
    completions,
    loading,
    addHabit,
    updateHabit,
    deleteHabit,
    setDayStatus,
    copingStepsMap,
    urgeLogs,
    startUrgeFlow,
    completeUrgeStep,
    useRocket,
    reorderHabits,
    addEvidence,
    removeEvidence,
    setEvidenceWeight,
  } = useHabits();
  const [formOpen, setFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [actionsHabitId, setActionsHabitId] = useState<string | null>(null);
  const [detailHabitId, setDetailHabitId] = useState<string | null>(null);
  const [vsHabitId, setVsHabitId] = useState<string | null>(null);
  const [openArticleId, setOpenArticleId] = useState<string | null>(null);

  const todayHabits = useMemo(() => {
    const filtered = habits.filter(shouldShowToday);
    return getHabitsWithStats(filtered, completions, urgeLogs, copingStepsMap, getArticle);
  }, [habits, completions, urgeLogs, copingStepsMap]);

  const completedCount = todayHabits.filter((h) => h.completedToday).length;
  const totalCount = todayHabits.length;

  const actionsHabit = useMemo(
    () => todayHabits.find((h) => h.id === actionsHabitId),
    [todayHabits, actionsHabitId]
  );

  const detailHabit = useMemo(
    () => todayHabits.find((h) => h.id === detailHabitId) ?? null,
    [todayHabits, detailHabitId]
  );

  const vsHabit = useMemo(
    () => todayHabits.find((h) => h.id === vsHabitId) ?? null,
    [todayHabits, vsHabitId]
  );

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
    (
      data: Omit<Habit, 'id' | 'createdAt' | 'archived' | 'sortOrder'>,
      copingSteps?: { title: string; sortOrder: number }[],
      initialEvidences?: { articleId: string; weight: number }[]
    ) => {
      if (editingHabit) {
        updateHabit(editingHabit.id, data, copingSteps, initialEvidences);
      } else {
        addHabit(data, copingSteps, initialEvidences);
      }
      setEditingHabit(null);
    },
    [editingHabit, addHabit, updateHabit]
  );

  const handleOpenDetail = useCallback((id: string) => {
    setDetailHabitId(id);
  }, []);

  const handleOpenVsTemptation = useCallback((id: string) => {
    setVsHabitId(id);
  }, []);

  const handleDelete = useCallback(() => {
    if (actionsHabitId) {
      deleteHabit(actionsHabitId);
      setActionsHabitId(null);
    }
  }, [actionsHabitId, deleteHabit]);

  const handleArchive = useCallback(() => {
    if (actionsHabitId) {
      updateHabit(actionsHabitId, { archived: true });
      setActionsHabitId(null);
    }
  }, [actionsHabitId, updateHabit]);

  const handleFormDelete = useCallback(() => {
    if (editingHabit) {
      deleteHabit(editingHabit.id);
      setEditingHabit(null);
      setFormOpen(false);
    }
  }, [editingHabit, deleteHabit]);

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

      <DailyImpactSummary habits={todayHabits} />

      <HabitList
        habits={todayHabits}
        onDayStatusChange={setDayStatus}
        onAdd={handleAdd}
        onOpenDetail={handleOpenDetail}
        onOpenVsTemptation={handleOpenVsTemptation}
        onReorder={reorderHabits}
      />

      <HabitForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
        onDelete={editingHabit ? handleFormDelete : undefined}
        initialData={editingHabit ?? undefined}
        initialCopingSteps={
          editingHabit
            ? copingStepsMap
                ?.get(editingHabit.id)
                ?.map((s) => ({ title: s.title, sortOrder: s.sortOrder }))
            : undefined
        }
      />

      <HabitActions
        open={!!actionsHabitId}
        onOpenChange={(open) => !open && setActionsHabitId(null)}
        habitName={actionsHabit?.name ?? ''}
        onEdit={() => {
          if (actionsHabitId) {
            handleEdit(actionsHabitId);
            setActionsHabitId(null);
          }
        }}
        onArchive={handleArchive}
        onDelete={handleDelete}
      />

      <HabitDetailModal
        open={!!detailHabitId}
        onOpenChange={(open) => !open && setDetailHabitId(null)}
        habit={detailHabit}
        onUseRocket={useRocket}
        onDayStatusChange={setDayStatus}
        onEdit={(id) => {
          setDetailHabitId(null);
          handleEdit(id);
        }}
        onOpenArticle={(articleId) => setOpenArticleId(articleId)}
        onAddEvidence={addEvidence}
        onRemoveEvidence={removeEvidence}
        onSetWeight={setEvidenceWeight}
      />

      <VsTemptationModal
        open={!!vsHabitId}
        onOpenChange={(open) => !open && setVsHabitId(null)}
        habit={vsHabit}
        onStartFlow={() => startUrgeFlow(vsHabitId!)}
        onCompleteStep={completeUrgeStep}
      />

      <EvidenceArticleSheet
        open={!!openArticleId}
        onOpenChange={(open) => !open && setOpenArticleId(null)}
        articleId={openArticleId}
      />
    </div>
  );
}
