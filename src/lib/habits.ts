import type { Habit, HabitCompletion, HabitWithStats } from '@/types/habit';

export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isCompletedToday(
  habitId: string,
  completions: HabitCompletion[]
): boolean {
  const today = getTodayString();
  return completions.some((c) => c.habitId === habitId && c.date === today);
}

export function calculateStreak(
  habitId: string,
  completions: HabitCompletion[]
): { current: number; longest: number } {
  const habitCompletions = completions
    .filter((c) => c.habitId === habitId)
    .map((c) => c.date)
    .sort()
    .reverse();

  const uniqueDates = [...new Set(habitCompletions)];

  if (uniqueDates.length === 0) {
    return { current: 0, longest: 0 };
  }

  // Calculate current streak
  let current = 0;
  const today = new Date();
  const checkDate = new Date(today);

  // Check if today or yesterday is in completions to start the streak
  const todayStr = getDateString(today);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getDateString(yesterday);

  if (!uniqueDates.includes(todayStr) && !uniqueDates.includes(yesterdayStr)) {
    current = 0;
  } else {
    if (!uniqueDates.includes(todayStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }
    while (true) {
      const dateStr = getDateString(checkDate);
      if (uniqueDates.includes(dateStr)) {
        current++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  let longest = 0;
  let streak = 1;
  const sortedDates = [...uniqueDates].sort();

  for (let i = 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i - 1]);
    const curr = new Date(sortedDates[i]);
    const diffDays = Math.round(
      (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) {
      streak++;
    } else {
      longest = Math.max(longest, streak);
      streak = 1;
    }
  }
  longest = Math.max(longest, streak, current);

  return { current, longest };
}

export function getCompletionRate(
  habitId: string,
  completions: HabitCompletion[],
  days: number
): number {
  if (days <= 0) return 0;

  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - days + 1);
  const startStr = getDateString(startDate);

  const completedDays = new Set(
    completions
      .filter((c) => c.habitId === habitId && c.date >= startStr)
      .map((c) => c.date)
  );

  return completedDays.size / days;
}

export function shouldShowToday(habit: Habit): boolean {
  if (habit.archived) return false;

  const today = new Date().getDay();

  switch (habit.frequency) {
    case 'daily':
      return true;
    case 'weekly':
      return today === 1; // Monday
    case 'custom':
      return habit.customDays?.includes(today) ?? false;
    default:
      return true;
  }
}

export function getHabitsWithStats(
  habits: Habit[],
  completions: HabitCompletion[]
): HabitWithStats[] {
  return habits.map((habit) => {
    const { current, longest } = calculateStreak(habit.id, completions);
    return {
      ...habit,
      currentStreak: current,
      longestStreak: longest,
      completedToday: isCompletedToday(habit.id, completions),
      completionRate: getCompletionRate(habit.id, completions, 30),
    };
  });
}
