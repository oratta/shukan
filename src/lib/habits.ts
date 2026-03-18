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

function getMondayOfWeek(referenceDate: Date, weeksAgo: number): Date {
  const d = new Date(referenceDate);
  const dayOfWeek = d.getDay();
  const isoDay = dayOfWeek === 0 ? 7 : dayOfWeek;
  d.setDate(d.getDate() - (isoDay - 1) - weeksAgo * 7);
  d.setHours(0, 0, 0, 0);
  return d;
}

function calculateWeeklyStreak(
  habitId: string,
  completions: HabitCompletion[],
  weeklyTarget: number
): { current: number; longest: number } {
  const today = new Date();

  const getWeekCompletionCount = (weeksAgo: number): number => {
    const monday = getMondayOfWeek(today, weeksAgo);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const mondayStr = getDateString(monday);
    const sundayStr = getDateString(sunday);

    return new Set(
      completions
        .filter(
          (c) =>
            c.habitId === habitId &&
            c.date >= mondayStr &&
            c.date <= sundayStr &&
            (c.status === 'completed' || c.status === 'rocket_used')
        )
        .map((c) => c.date)
    ).size;
  };

  const currentWeekAchieved = getWeekCompletionCount(0) >= weeklyTarget;
  let current = 0;
  const startWeek = currentWeekAchieved ? 0 : 1;

  for (let w = startWeek; w < 100; w++) {
    if (getWeekCompletionCount(w) >= weeklyTarget) {
      current++;
    } else {
      break;
    }
  }

  let longest = current;
  let streak = 0;
  for (let w = 0; w < 52; w++) {
    if (getWeekCompletionCount(w) >= weeklyTarget) {
      streak++;
      longest = Math.max(longest, streak);
    } else {
      streak = 0;
    }
  }

  return { current, longest };
}

function getWeeklyCompletionRate(
  habitId: string,
  completions: HabitCompletion[],
  weeks: number,
  weeklyTarget: number
): number {
  if (weeks <= 0) return 0;

  const today = new Date();
  let achievedWeeks = 0;

  for (let w = 0; w < weeks; w++) {
    const monday = getMondayOfWeek(today, w);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const mondayStr = getDateString(monday);
    const sundayStr = getDateString(sunday);

    const uniqueDays = new Set(
      completions
        .filter(
          (c) =>
            c.habitId === habitId &&
            c.date >= mondayStr &&
            c.date <= sundayStr &&
            (c.status === 'completed' || c.status === 'rocket_used')
        )
        .map((c) => c.date)
    );

    if (uniqueDays.size >= weeklyTarget) {
      achievedWeeks++;
    }
  }

  return achievedWeeks / weeks;
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
  completions: HabitCompletion[],
  habit?: Habit
): { current: number; longest: number } {
  // Weekly habits use week-based streak
  if (habit && habit.frequency === 'weekly') {
    return calculateWeeklyStreak(habitId, completions, habit.weeklyTarget ?? 1);
  }

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

  // All recorded dates (to distinguish "no record" from "has record" for auto-skip)
  const recordedDates = new Set(
    completions.filter((c) => c.habitId === habitId).map((c) => c.date)
  );

  const uniqueDates = [...new Set(habitCompletions)];

  if (uniqueDates.length === 0) {
    return { current: 0, longest: 0 };
  }

  // Helper: is a date transparent (manual skip or auto-skip)?
  const isTransparent = (dateStr: string): boolean => {
    if (skippedDates.has(dateStr)) return true;
    // Auto-skip: no record AND not a target day for this habit
    if (habit && !recordedDates.has(dateStr)) {
      const d = new Date(dateStr + 'T00:00:00');
      if (!isTargetDay(habit, d)) return true;
    }
    return false;
  };

  // Calculate current streak (transparent days are skipped over)
  let current = 0;
  const today = new Date();
  const checkDate = new Date(today);

  const todayStr = getDateString(today);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getDateString(yesterday);

  const todayCompleted = uniqueDates.includes(todayStr);
  const todayTransparent = isTransparent(todayStr);
  const yesterdayCompleted = uniqueDates.includes(yesterdayStr);
  const yesterdayTransparent = isTransparent(yesterdayStr);

  if (!todayCompleted && !todayTransparent && !yesterdayCompleted && !yesterdayTransparent) {
    current = 0;
  } else {
    if (!todayCompleted && !todayTransparent) {
      checkDate.setDate(checkDate.getDate() - 1);
    }
    while (true) {
      const dateStr = getDateString(checkDate);
      if (uniqueDates.includes(dateStr)) {
        current++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (isTransparent(dateStr)) {
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Calculate longest streak (transparent days are skipped over)
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
      let allTransparent = true;
      const gapDate = new Date(prev);
      for (let d = 1; d < diffDays; d++) {
        gapDate.setDate(gapDate.getDate() + 1);
        if (!isTransparent(getDateString(gapDate))) {
          allTransparent = false;
          break;
        }
      }
      if (allTransparent) {
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
  days: number,
  habit?: Habit
): number {
  // Weekly habits: days parameter is reused as weeks count
  if (habit && habit.frequency === 'weekly') {
    return getWeeklyCompletionRate(habitId, completions, days, habit.weeklyTarget ?? 1);
  }

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

export function getEffectiveStatus(day: DayStatus): DayStatus['status'] {
  if (day.status !== 'none') return day.status;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayDate = new Date(day.date + 'T00:00:00');
  const diffDays = Math.round((today.getTime() - dayDate.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays > 5 ? 'failed' : 'none';
}

export function getYesterdayUnreviewedHabits(
  habits: Habit[],
  completions: HabitCompletion[]
): Habit[] {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getDateString(yesterday);

  return habits.filter((habit) => {
    if (habit.archived) return false;
    // Check if yesterday was a target day for this habit
    if (!isTargetDay(habit, yesterday)) return false;
    // Check if there's a completion record for yesterday
    const completion = completions.find(
      (c) => c.habitId === habit.id && c.date === yesterdayStr
    );
    // If no completion record, it's unreviewed
    return !completion;
  });
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
    const { current, longest } = calculateStreak(habit.id, completions, habit);
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

    // Auto-skip logic (REQ-FS-06):
    // 1. Manual skip record → skippedToday = true
    // 2. Any other record (completed/failed/rocket_used/none) → skippedToday = false
    // 3. No record + not target day → skippedToday = true (auto-skip)
    // 4. No record + target day → skippedToday = false
    const todayStr = getTodayString();
    const todayCompletion = completions.find(
      (c) => c.habitId === habit.id && c.date === todayStr
    );
    let skippedToday: boolean;
    if (todayCompletion) {
      skippedToday = todayCompletion.status === 'skipped';
    } else {
      skippedToday = !isTargetDay(habit, new Date());
    }

    // Frequency-aware recentDays
    let recentDays: DayStatus[];
    if (habit.frequency === 'weekly') {
      recentDays = getRecentDays(habit.id, completions, 7);
    } else if (habit.frequency === 'weekday' || habit.frequency === 'custom') {
      // Fetch 21 calendar days, filter past days to target-day-only, keep 4
      const allRecent = getRecentDays(habit.id, completions, 21);
      const todayDay = allRecent[0]; // always keep today at index 0
      const pastTargetDays = allRecent.slice(1).filter((day) => {
        const d = new Date(day.date + 'T00:00:00');
        return isTargetDay(habit, d);
      }).slice(0, 4);
      recentDays = [todayDay, ...pastTargetDays];
    } else {
      recentDays = getRecentDays(habit.id, completions);
    }

    // Weekly: compute this week's completion count
    let weeklyCompletedCount: number | undefined;
    if (habit.frequency === 'weekly') {
      const monday = getMondayOfWeek(new Date(), 0);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      const mondayStr = getDateString(monday);
      const sundayStr = getDateString(sunday);
      weeklyCompletedCount = new Set(
        completions
          .filter(
            (c) =>
              c.habitId === habit.id &&
              c.date >= mondayStr &&
              c.date <= sundayStr &&
              (c.status === 'completed' || c.status === 'rocket_used')
          )
          .map((c) => c.date)
      ).size;
    }

    return {
      ...habit,
      currentStreak: current,
      longestStreak: longest,
      completedToday,
      skippedToday,
      completionRate: getCompletionRate(
        habit.id, completions,
        habit.frequency === 'weekly' ? 12 : 30,
        habit
      ),
      recentDays,
      allDays: getAllDayStatuses(habit.id, completions, habit.createdAt),
      rockets,
      rocketNextIn: nextIn,
      ...(weeklyCompletedCount !== undefined ? { weeklyCompletedCount } : {}),
      ...(isQuit && urgeLogs ? { todayUrgeCount: getTodayUrgeCount(habit.id, urgeLogs) } : {}),
      ...(isQuit && copingStepsMap ? { copingSteps: copingStepsMap.get(habit.id) } : {}),
      ...(impactSavings ? { impactSavings } : {}),
    };
  });
}
