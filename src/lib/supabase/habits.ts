import type { Habit, HabitCompletion } from '@/types/habit';
import { createClient } from './client';

interface HabitRow {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  frequency: 'daily' | 'weekly' | 'custom';
  custom_days: number[] | null;
  created_at: string;
  archived: boolean;
}

interface CompletionRow {
  id: string;
  user_id: string;
  habit_id: string;
  date: string;
  completed_at: string;
}

function toHabit(row: HabitRow): Habit {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    icon: row.icon,
    color: row.color,
    frequency: row.frequency,
    customDays: row.custom_days ?? undefined,
    createdAt: row.created_at,
    archived: row.archived,
  };
}

function toCompletion(row: CompletionRow): HabitCompletion {
  return {
    habitId: row.habit_id,
    date: row.date,
    completedAt: row.completed_at,
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
      icon: habit.icon,
      color: habit.color,
      frequency: habit.frequency,
      custom_days: habit.customDays || null,
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
  if (updates.icon !== undefined) row.icon = updates.icon;
  if (updates.color !== undefined) row.color = updates.color;
  if (updates.frequency !== undefined) row.frequency = updates.frequency;
  if (updates.customDays !== undefined) row.custom_days = updates.customDays || null;
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
  date: string
): Promise<HabitCompletion> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('habit_completions')
    .insert({
      user_id: userId,
      habit_id: habitId,
      date,
    })
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
