import type { Habit, HabitCompletion, CopingStep, UrgeLog } from '@/types/habit';
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

function toHabit(row: HabitRow): Habit {
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
    status: (row.status as 'completed' | 'failed') || 'completed',
  };
}

export async function fetchHabits(): Promise<Habit[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data as HabitRow[]).map(toHabit);
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
  habit: Omit<Habit, 'id' | 'createdAt' | 'archived'>
): Promise<Habit> {
  const supabase = createClient();
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
  const { data: existing } = await supabase
    .from('habit_completions')
    .select('*')
    .eq('habit_id', habitId)
    .eq('date', date)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from('habit_completions')
      .update({ status })
      .eq('id', existing.id)
      .select()
      .single();
    if (error) throw error;
    return toCompletion(data as CompletionRow);
  } else {
    return insertCompletion(userId, habitId, date, status);
  }
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
