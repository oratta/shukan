'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { HabitList } from '@/components/habits/habit-list';
import { HabitForm } from '@/components/habits/habit-form';
import { HabitActions } from '@/components/habits/habit-actions';
import { HabitDetailModal } from '@/components/habits/habit-detail-modal';
import { VsTemptationModal } from '@/components/habits/vs-temptation-modal';
import { EvidenceArticleSheet } from '@/components/habits/evidence-article-sheet';
import { DailyImpactSummary } from '@/components/habits/daily-impact-summary';
import { YesterdayReviewBanner } from '@/components/habits/yesterday-review-banner';
import { YesterdayReviewSheet } from '@/components/habits/yesterday-review-sheet';
import { useHabits } from '@/hooks/useHabits';
import { shouldShowToday, getHabitsWithStats, getTodayString, getYesterdayUnreviewedHabits } from '@/lib/habits';
import { getArticle } from '@/data/impact-articles';
import { useAuth } from '@/components/auth-provider';
import { upsertDailyReflection } from '@/lib/supabase/habits';
import type { Habit } from '@/types/habit';

export default function DashboardPage() {
  const t = useTranslations();
  const { user } = useAuth();
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
    updateNote,
  } = useHabits();
  const [formOpen, setFormOpen] = useState(false);
  const [reviewSheetOpen, setReviewSheetOpen] = useState(false);
  const [reviewHabits, setReviewHabits] = useState<Habit[]>([]);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [actionsHabitId, setActionsHabitId] = useState<string | null>(null);
  const [detailHabitId, setDetailHabitId] = useState<string | null>(null);
  const [vsHabitId, setVsHabitId] = useState<string | null>(null);
  const [openArticleId, setOpenArticleId] = useState<string | null>(null);

  const todayHabits = useMemo(() => {
    const filtered = habits.filter(shouldShowToday);
    return getHabitsWithStats(filtered, completions, urgeLogs, copingStepsMap, getArticle);
  }, [habits, completions, urgeLogs, copingStepsMap]);

  // Compute yesterday's date client-side only to avoid SSR timezone mismatch
  // (Vercel SSR runs in UTC, but user is in JST — causes 1-day offset between 00:00-08:59 JST)
  const [yesterdayDate, setYesterdayDate] = useState('');
  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setYesterdayDate(`${year}-${month}-${day}`);
  }, []);

  const yesterdayUnreviewed = useMemo(
    () => yesterdayDate ? getYesterdayUnreviewedHabits(habits, completions, yesterdayDate) : [],
    [habits, completions, yesterdayDate]
  );

  const handleSaveReflection = useCallback(
    async (mood: number | undefined, comment: string) => {
      if (!user) return;
      if (mood !== undefined || comment.trim()) {
        await upsertDailyReflection(user.id, yesterdayDate, { mood, comment });
      }
    },
    [user, yesterdayDate]
  );

  const activeHabits = todayHabits.filter((h) => !h.skippedToday);
  const completedCount = activeHabits.filter((h) => h.completedToday).length;
  const totalCount = activeHabits.length;

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

  const handleSkipToday = useCallback(
    (id: string) => {
      const today = getTodayString();
      const habit = todayHabits.find((h) => h.id === id);
      setDayStatus(id, today, habit?.skippedToday ? 'none' : 'skipped');
    },
    [todayHabits, setDayStatus]
  );

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

      {yesterdayUnreviewed.length > 0 && (
        <YesterdayReviewBanner
          unreviewedCount={yesterdayUnreviewed.length}
          onOpen={() => {
            setReviewHabits(habits.filter(h => !h.archived));
            setReviewSheetOpen(true);
          }}
        />
      )}

      <HabitList
        habits={todayHabits}
        onDayStatusChange={setDayStatus}
        onAdd={handleAdd}
        onOpenDetail={handleOpenDetail}
        onOpenVsTemptation={handleOpenVsTemptation}
        onReorder={reorderHabits}
        onSkipToday={handleSkipToday}
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
        onFailed={() => {
          if (vsHabitId) {
            setDayStatus(vsHabitId, getTodayString(), 'failed');
          }
        }}
      />

      <EvidenceArticleSheet
        open={!!openArticleId}
        onOpenChange={(open) => !open && setOpenArticleId(null)}
        articleId={openArticleId}
      />

      <YesterdayReviewSheet
        open={reviewSheetOpen}
        onOpenChange={setReviewSheetOpen}
        habits={reviewHabits}
        completions={completions}
        yesterdayDate={yesterdayDate}
        onDayStatusChange={setDayStatus}
        onNoteChange={updateNote}
        onSaveReflection={handleSaveReflection}
      />
    </div>
  );
}
