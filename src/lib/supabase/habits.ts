import type { Habit, HabitCompletion, CopingStep, UrgeLog } from '@/types/habit';
import type { HabitEvidence } from '@/types/impact';
import { isValidArticleId } from '@/types/impact';
import { createClient } from './client';

interface HabitRow {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  life_significance: string | null;
  icon: string;
  color: string;
  frequency: 'daily' | 'weekly' | 'custom';
  custom_days: number[] | null;
  type: string;
  daily_target: number;
  created_at: string;
  archived: boolean;
  impact_article_id: string | null;
  sort_order: number;
}

interface CopingStepRow {
  id: string;
  habit_id: string;
  title: string;
  sort_order: number;
  created_at: string;
}

interface UrgeLogRow {
  id: string;
  user_id: string;
  habit_id: string;
  date: string;
  completed_steps: string[];
  all_completed: boolean;
  created_at: string;
}

interface CompletionRow {
  id: string;
  user_id: string;
  habit_id: string;
  date: string;
  completed_at: string;
  status: string;
}

interface HabitEvidenceRow {
  id: string;
  habit_id: string;
  article_id: string;
  weight: number;
  created_at: string;
}

function toHabitEvidence(row: HabitEvidenceRow): HabitEvidence {
  return {
    id: row.id,
    habitId: row.habit_id,
    articleId: isValidArticleId(row.article_id) ? row.article_id : (row.article_id as HabitEvidence['articleId']),
    weight: row.weight,
  };
}

function toHabit(row: HabitRow, evidenceRows?: HabitEvidenceRow[]): Habit {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    lifeSignificance: row.life_significance ?? undefined,
    icon: row.icon,
    color: row.color,
    frequency: row.frequency,
    customDays: row.custom_days ?? undefined,
    type: (row.type as 'positive' | 'quit') || 'positive',
    dailyTarget: row.daily_target ?? 1,
    createdAt: row.created_at,
    archived: row.archived,
    impactArticleId: isValidArticleId(row.impact_article_id) ? row.impact_article_id : undefined,
    evidences: evidenceRows ? evidenceRows.map(toHabitEvidence) : [],
    sortOrder: row.sort_order ?? 0,
  };
}

function toCopingStep(row: CopingStepRow): CopingStep {
  return {
    id: row.id,
    habitId: row.habit_id,
    title: row.title,
    sortOrder: row.sort_order,
  };
}

function toUrgeLog(row: UrgeLogRow): UrgeLog {
  return {
    id: row.id,
    habitId: row.habit_id,
    date: row.date,
    completedSteps: row.completed_steps ?? [],
    allCompleted: row.all_completed,
    createdAt: row.created_at,
  };
}

function toCompletion(row: CompletionRow): HabitCompletion {
  return {
    habitId: row.habit_id,
    date: row.date,
    completedAt: row.completed_at,
    status: (row.status as 'completed' | 'failed' | 'rocket_used') || 'completed',
  };
}

export async function fetchHabits(): Promise<Habit[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('habits')
    .select('*, habit_evidences(*)')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data as (HabitRow & { habit_evidences: HabitEvidenceRow[] })[]).map(
    (row) => toHabit(row, row.habit_evidences ?? [])
  );
}

export async function fetchCompletions(): Promise<HabitCompletion[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('habit_completions')
    .select('*')
    .order('date', { ascending: true });

  if (error) throw error;
  return (data as CompletionRow[]).map(toCompletion);
}

export async function insertHabit(
  userId: string,
  habit: Omit<Habit, 'id' | 'createdAt' | 'archived' | 'sortOrder'>
): Promise<Habit> {
  const supabase = createClient();

  // Get max sort_order for this user
  const { data: maxData } = await supabase
    .from('habits')
    .select('sort_order')
    .eq('user_id', userId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextSortOrder = (maxData?.sort_order ?? -1) + 1;

  const { data, error } = await supabase
    .from('habits')
    .insert({
      user_id: userId,
      name: habit.name,
      description: habit.description || null,
      life_significance: habit.lifeSignificance || null,
      icon: habit.icon,
      color: habit.color,
      frequency: habit.frequency,
      custom_days: habit.customDays || null,
      type: habit.type || 'positive',
      daily_target: habit.dailyTarget ?? 1,
      impact_article_id: habit.impactArticleId ?? null,
      sort_order: nextSortOrder,
    })
    .select()
    .single();

  if (error) throw error;
  return toHabit(data as HabitRow);
}

export async function updateHabitById(
  id: string,
  updates: Partial<Omit<Habit, 'id' | 'createdAt'>>
): Promise<void> {
  const supabase = createClient();
  const row: Record<string, unknown> = {};
  if (updates.name !== undefined) row.name = updates.name;
  if (updates.description !== undefined) row.description = updates.description || null;
  if (updates.lifeSignificance !== undefined) row.life_significance = updates.lifeSignificance || null;
  if (updates.icon !== undefined) row.icon = updates.icon;
  if (updates.color !== undefined) row.color = updates.color;
  if (updates.frequency !== undefined) row.frequency = updates.frequency;
  if (updates.customDays !== undefined) row.custom_days = updates.customDays || null;
  if (updates.type !== undefined) row.type = updates.type;
  if (updates.dailyTarget !== undefined) row.daily_target = updates.dailyTarget;
  if (updates.archived !== undefined) row.archived = updates.archived;
  if (updates.impactArticleId !== undefined) row.impact_article_id = updates.impactArticleId ?? null;

  const { error } = await supabase.from('habits').update(row).eq('id', id);
  if (error) throw error;
}

export async function deleteHabitById(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('habits').delete().eq('id', id);
  if (error) throw error;
}

export async function insertCompletion(
  userId: string,
  habitId: string,
  date: string,
  status: 'completed' | 'failed' = 'completed'
): Promise<HabitCompletion> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('habit_completions')
    .insert({
      user_id: userId,
      habit_id: habitId,
      date,
      status,
    })
    .select()
    .single();

  if (error) throw error;
  return toCompletion(data as CompletionRow);
}

export async function upsertCompletion(
  userId: string,
  habitId: string,
  date: string,
  status: 'completed' | 'failed'
): Promise<HabitCompletion> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('habit_completions')
    .upsert(
      {
        user_id: userId,
        habit_id: habitId,
        date,
        status,
      },
      { onConflict: 'habit_id,date' }
    )
    .select()
    .single();

  if (error) throw error;
  return toCompletion(data as CompletionRow);
}

export async function deleteCompletion(
  habitId: string,
  date: string
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('habit_completions')
    .delete()
    .eq('habit_id', habitId)
    .eq('date', date);

  if (error) throw error;
}

// --- Coping Steps ---

export async function fetchCopingSteps(habitId: string): Promise<CopingStep[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('coping_steps')
    .select('*')
    .eq('habit_id', habitId)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data as CopingStepRow[]).map(toCopingStep);
}

export async function upsertCopingSteps(
  habitId: string,
  steps: { title: string; sortOrder: number }[]
): Promise<CopingStep[]> {
  const supabase = createClient();

  // Delete existing steps
  const { error: deleteError } = await supabase
    .from('coping_steps')
    .delete()
    .eq('habit_id', habitId);
  if (deleteError) throw deleteError;

  if (steps.length === 0) return [];

  // Insert new steps
  const rows = steps.map((s) => ({
    habit_id: habitId,
    title: s.title,
    sort_order: s.sortOrder,
  }));

  const { data, error } = await supabase
    .from('coping_steps')
    .insert(rows)
    .select();

  if (error) throw error;
  return (data as CopingStepRow[]).map(toCopingStep);
}

// --- Urge Logs ---

export async function fetchUrgeLogsForDate(date: string): Promise<UrgeLog[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('urge_logs')
    .select('*')
    .eq('date', date)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data as UrgeLogRow[]).map(toUrgeLog);
}

export async function insertUrgeLog(
  userId: string,
  habitId: string,
  date: string
): Promise<UrgeLog> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('urge_logs')
    .insert({
      user_id: userId,
      habit_id: habitId,
      date,
      completed_steps: [],
      all_completed: false,
    })
    .select()
    .single();

  if (error) throw error;
  return toUrgeLog(data as UrgeLogRow);
}

export async function updateUrgeLog(
  id: string,
  completedSteps: string[],
  allCompleted: boolean
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('urge_logs')
    .update({
      completed_steps: completedSteps,
      all_completed: allCompleted,
    })
    .eq('id', id);

  if (error) throw error;
}

export async function deleteUrgeLog(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('urge_logs').delete().eq('id', id);
  if (error) throw error;
}

// --- Rocket ---

export async function useRocketOnDate(
  userId: string,
  habitId: string,
  date: string
): Promise<HabitCompletion> {
  const supabase = createClient();
  // Upsert the completion as rocket_used (marks it as completed via rocket)
  const { data: existing } = await supabase
    .from('habit_completions')
    .select('*')
    .eq('habit_id', habitId)
    .eq('date', date)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from('habit_completions')
      .update({ status: 'rocket_used' })
      .eq('id', existing.id)
      .select()
      .single();
    if (error) throw error;
    return toCompletion(data as CompletionRow);
  } else {
    const { data, error } = await supabase
      .from('habit_completions')
      .insert({
        user_id: userId,
        habit_id: habitId,
        date,
        status: 'rocket_used',
      })
      .select()
      .single();
    if (error) throw error;
    return toCompletion(data as CompletionRow);
  }
}

// --- Habit Evidences ---

export async function fetchHabitEvidences(habitId: string): Promise<HabitEvidence[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('habit_evidences')
    .select('*')
    .eq('habit_id', habitId);

  if (error) throw error;
  return (data as HabitEvidenceRow[]).map(toHabitEvidence);
}

export async function insertHabitEvidence(
  habitId: string,
  articleId: string,
  weight: number = 100
): Promise<HabitEvidence> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('habit_evidences')
    .insert({ habit_id: habitId, article_id: articleId, weight })
    .select()
    .single();

  if (error) throw error;
  return toHabitEvidence(data as HabitEvidenceRow);
}

export async function updateHabitEvidenceWeight(
  id: string,
  weight: number
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('habit_evidences')
    .update({ weight })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteHabitEvidence(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('habit_evidences')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function replaceHabitEvidences(
  habitId: string,
  evidences: { articleId: string; weight: number }[]
): Promise<HabitEvidence[]> {
  const supabase = createClient();
  // Delete existing
  const { error: delError } = await supabase
    .from('habit_evidences')
    .delete()
    .eq('habit_id', habitId);
  if (delError) throw delError;

  if (evidences.length === 0) return [];

  const rows = evidences.map((e) => ({
    habit_id: habitId,
    article_id: e.articleId,
    weight: e.weight,
  }));
  const { data, error } = await supabase
    .from('habit_evidences')
    .insert(rows)
    .select();
  if (error) throw error;
  return (data as HabitEvidenceRow[]).map(toHabitEvidence);
}

// --- Sort Order ---

export async function updateHabitSortOrders(
  updates: { id: string; sortOrder: number }[]
): Promise<void> {
  const supabase = createClient();
  for (const { id, sortOrder } of updates) {
    const { error } = await supabase
      .from('habits')
      .update({ sort_order: sortOrder })
      .eq('id', id);
    if (error) throw error;
  }
}
