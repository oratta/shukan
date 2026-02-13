import type { Habit, HabitCompletion, HabitWithStats, UrgeLog, CopingStep, DayStatus } from '@/types/habit';

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
  return completions.some((c) => c.habitId === habitId && c.date === today && c.status === 'completed');
}

export function calculateStreak(
  habitId: string,
  completions: HabitCompletion[]
): { current: number; longest: number } {
  const habitCompletions = completions
    .filter((c) => c.habitId === habitId && c.status === 'completed')
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
      .filter((c) => c.habitId === habitId && c.date >= startStr && c.status === 'completed')
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

export function isQuitHabitCompletedToday(
  habitId: string,
  urgeLogs: UrgeLog[],
  dailyTarget: number
): boolean {
  const today = getTodayString();
  const todayLogs = urgeLogs.filter(
    (log) => log.habitId === habitId && log.date === today && log.allCompleted
  );
  return todayLogs.length >= dailyTarget;
}

export function getTodayUrgeCount(
  habitId: string,
  urgeLogs: UrgeLog[]
): number {
  const today = getTodayString();
  return urgeLogs.filter(
    (log) => log.habitId === habitId && log.date === today && log.allCompleted
  ).length;
}

export function getRecentDays(
  habitId: string,
  completions: HabitCompletion[],
  days: number = 5
): DayStatus[] {
  const today = new Date();
  const result: DayStatus[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = getDateString(d);
    const completion = completions.find(
      (c) => c.habitId === habitId && c.date === dateStr
    );
    result.push({
      date: dateStr,
      status: completion ? completion.status : 'none',
    });
  }
  return result;
}

export function getHabitsWithStats(
  habits: Habit[],
  completions: HabitCompletion[],
  urgeLogs?: UrgeLog[],
  copingStepsMap?: Map<string, CopingStep[]>
): HabitWithStats[] {
  return habits.map((habit) => {
    const { current, longest } = calculateStreak(habit.id, completions);
    const isQuit = habit.type === 'quit';
    const completedToday = isQuit && urgeLogs
      ? isQuitHabitCompletedToday(habit.id, urgeLogs, habit.dailyTarget)
      : isCompletedToday(habit.id, completions);

    return {
      ...habit,
      currentStreak: current,
      longestStreak: longest,
      completedToday,
      completionRate: getCompletionRate(habit.id, completions, 30),
      recentDays: getRecentDays(habit.id, completions),
      ...(isQuit && urgeLogs ? { todayUrgeCount: getTodayUrgeCount(habit.id, urgeLogs) } : {}),
      ...(isQuit && copingStepsMap ? { copingSteps: copingStepsMap.get(habit.id) } : {}),
    };
  });
}
