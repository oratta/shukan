import type { Habit, HabitCompletion, HabitWithStats, UrgeLog, CopingStep, DayStatus } from '@/types/habit';
import type { ArticleId, LifeImpactArticle } from '@/types/impact';
import { calculateImpactSavings, calculateMultiEvidenceImpact } from '@/lib/impact';

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
  return completions.some((c) => c.habitId === habitId && c.date === today && (c.status === 'completed' || c.status === 'rocket_used'));
}

export function calculateStreak(
  habitId: string,
  completions: HabitCompletion[]
): { current: number; longest: number } {
  const habitCompletions = completions
    .filter((c) => c.habitId === habitId && (c.status === 'completed' || c.status === 'rocket_used'))
    .map((c) => c.date)
    .sort()
    .reverse();

  // Skipped dates: transparent days (don't break streak, don't count)
  const skippedDates = new Set(
    completions
      .filter((c) => c.habitId === habitId && c.status === 'skipped')
      .map((c) => c.date)
  );

  const uniqueDates = [...new Set(habitCompletions)];

  if (uniqueDates.length === 0) {
    return { current: 0, longest: 0 };
  }

  // Calculate current streak (skipped days are transparent)
  let current = 0;
  const today = new Date();
  const checkDate = new Date(today);

  const todayStr = getDateString(today);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getDateString(yesterday);

  // Skip over today if it's skipped
  const todaySkipped = skippedDates.has(todayStr);
  const todayCompleted = uniqueDates.includes(todayStr);
  const yesterdayCompleted = uniqueDates.includes(yesterdayStr);
  const yesterdaySkipped = skippedDates.has(yesterdayStr);

  if (!todayCompleted && !todaySkipped && !yesterdayCompleted && !yesterdaySkipped) {
    current = 0;
  } else {
    // Find the starting point: walk back from today, skipping skipped days
    if (!todayCompleted && !todaySkipped) {
      checkDate.setDate(checkDate.getDate() - 1);
    }
    while (true) {
      const dateStr = getDateString(checkDate);
      if (uniqueDates.includes(dateStr)) {
        current++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (skippedDates.has(dateStr)) {
        // Skipped day: skip over it without counting or breaking
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Calculate longest streak (skipped days are transparent)
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
      // Check if all gap days are skipped
      let allSkipped = true;
      const gapDate = new Date(prev);
      for (let d = 1; d < diffDays; d++) {
        gapDate.setDate(gapDate.getDate() + 1);
        if (!skippedDates.has(getDateString(gapDate))) {
          allSkipped = false;
          break;
        }
      }
      if (allSkipped) {
        streak++;
      } else {
        longest = Math.max(longest, streak);
        streak = 1;
      }
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

  const periodCompletions = completions.filter(
    (c) => c.habitId === habitId && c.date >= startStr
  );

  const completedDays = new Set(
    periodCompletions
      .filter((c) => c.status === 'completed' || c.status === 'rocket_used')
      .map((c) => c.date)
  );

  // Exclude skipped days from denominator
  const skippedDays = new Set(
    periodCompletions
      .filter((c) => c.status === 'skipped')
      .map((c) => c.date)
  );

  const effectiveDays = days - skippedDays.size;
  if (effectiveDays <= 0) return 0;

  return completedDays.size / effectiveDays;
}

export function isTargetDay(habit: Habit, date: Date): boolean {
  const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat

  switch (habit.frequency) {
    case 'everyday':
      return true;
    case 'weekday':
      return dayOfWeek >= 1 && dayOfWeek <= 5; // Mon-Fri
    case 'custom':
      return (habit.customDays ?? []).includes(dayOfWeek);
    case 'weekly':
      return true; // Weekly: any day counts toward the weekly target
    default:
      return true;
  }
}

export function shouldShowToday(habit: Habit): boolean {
  return !habit.archived;
}

export function isSkippedToday(
  habitId: string,
  completions: HabitCompletion[]
): boolean {
  const today = getTodayString();
  return completions.some((c) => c.habitId === habitId && c.date === today && c.status === 'skipped');
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
  // Today first (index 0), then yesterday, etc.
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = getDateString(d);
    const completion = completions.find(
      (c) => c.habitId === habitId && c.date === dateStr
    );
    const dayStatus = completion
      ? completion.status as DayStatus['status']
      : 'none';
    result.push({
      date: dateStr,
      status: dayStatus,
    });
  }
  return result;
}

export function calculateRockets(
  habitId: string,
  completions: HabitCompletion[]
): { rockets: number; nextIn: number } {
  const habitCompletions = completions
    .filter((c) => c.habitId === habitId && (c.status === 'completed' || c.status === 'rocket_used'))
    .map((c) => c.date)
    .sort();

  const uniqueDates = [...new Set(habitCompletions)];

  if (uniqueDates.length === 0) {
    return { rockets: 0, nextIn: 10 };
  }

  // Count consecutive streaks of 10+ to determine total rockets earned
  let totalRocketsEarned = 0;
  let currentConsecutive = 1;

  for (let i = 1; i < uniqueDates.length; i++) {
    const prev = new Date(uniqueDates[i - 1]);
    const curr = new Date(uniqueDates[i]);
    const diffDays = Math.round(
      (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) {
      currentConsecutive++;
      if (currentConsecutive % 10 === 0) {
        totalRocketsEarned++;
      }
    } else {
      currentConsecutive = 1;
    }
  }

  // Count rockets used (completions with status 'completed' that were originally failed
  // are tracked via a special mechanism - for now rockets earned = total)
  const rocketsUsed = completions.filter(
    (c) => c.habitId === habitId && c.status === 'rocket_used'
  ).length;

  const rockets = totalRocketsEarned - rocketsUsed;
  const nextIn = 10 - (currentConsecutive % 10);

  return { rockets: Math.max(0, rockets), nextIn: nextIn === 10 ? 10 : nextIn };
}

export function getAllDayStatuses(
  habitId: string,
  completions: HabitCompletion[],
  createdAt: string
): DayStatus[] {
  const today = new Date();
  const startDate = new Date(createdAt);
  startDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const result: DayStatus[] = [];
  const d = new Date(startDate);

  while (d <= today) {
    const dateStr = getDateString(d);
    const completion = completions.find(
      (c) => c.habitId === habitId && c.date === dateStr
    );

    if (completion) {
      result.push({
        date: dateStr,
        status: completion.status as DayStatus['status'],
      });
    } else {
      // Check if it's been more than 5 days ago (auto-fail)
      const daysDiff = Math.round(
        (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
      );
      result.push({
        date: dateStr,
        status: daysDiff >= 5 ? 'failed' : 'none',
      });
    }
    d.setDate(d.getDate() + 1);
  }

  return result;
}

export function getHabitsWithStats(
  habits: Habit[],
  completions: HabitCompletion[],
  urgeLogs?: UrgeLog[],
  copingStepsMap?: Map<string, CopingStep[]>,
  getArticleFn?: (id: ArticleId) => LifeImpactArticle | undefined
): HabitWithStats[] {
  return habits.map((habit) => {
    const { current, longest } = calculateStreak(habit.id, completions);
    const isQuit = habit.type === 'quit';
    const completedToday = isQuit && urgeLogs
      ? isQuitHabitCompletedToday(habit.id, urgeLogs, habit.dailyTarget)
      : isCompletedToday(habit.id, completions);

    const { rockets, nextIn } = calculateRockets(habit.id, completions);

    // Multi-evidence impact calculation (preferred) or legacy single-article
    let impactSavings;
    if (habit.evidences && habit.evidences.length > 0 && getArticleFn) {
      impactSavings = calculateMultiEvidenceImpact(
        habit.id, completions, habit.evidences, getArticleFn
      );
    } else if (habit.impactArticleId && getArticleFn) {
      const article = getArticleFn(habit.impactArticleId);
      if (article) {
        impactSavings = calculateImpactSavings(habit.id, completions, article);
      }
    }

    const skippedToday = isSkippedToday(habit.id, completions);

    return {
      ...habit,
      currentStreak: current,
      longestStreak: longest,
      completedToday,
      skippedToday,
      completionRate: getCompletionRate(habit.id, completions, 30),
      recentDays: getRecentDays(habit.id, completions),
      allDays: getAllDayStatuses(habit.id, completions, habit.createdAt),
      rockets,
      rocketNextIn: nextIn,
      ...(isQuit && urgeLogs ? { todayUrgeCount: getTodayUrgeCount(habit.id, urgeLogs) } : {}),
      ...(isQuit && copingStepsMap ? { copingSteps: copingStepsMap.get(habit.id) } : {}),
      ...(impactSavings ? { impactSavings } : {}),
    };
  });
}
