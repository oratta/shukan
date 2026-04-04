import type { ArticleId, HabitEvidence, LifeImpactSavings } from './impact';

export interface Habit {
  id: string;
  name: string;
  description?: string;
  lifeSignificance?: string;
  icon: string;
  frequency: 'everyday' | 'weekday' | 'custom' | 'weekly';
  customDays?: number[];
  type: 'positive' | 'quit';
  dailyTarget: number;
  weeklyTarget?: number;
  createdAt: string;
  archived: boolean;
  impactArticleId?: ArticleId; // legacy single-evidence — kept for backward compat
  evidences: HabitEvidence[];
  sortOrder: number;
}

export interface CopingStep {
  id: string;
  habitId: string;
  title: string;
  sortOrder: number;
}

export interface UrgeLog {
  id: string;
  habitId: string;
  date: string;
  completedSteps: string[];
  allCompleted: boolean;
  createdAt: string;
}

export interface HabitCompletion {
  habitId: string;
  date: string;
  completedAt: string;
  status: 'completed' | 'failed' | 'rocket_used' | 'skipped';
  note?: string;
}

export interface DailyReflection {
  id: string;
  userId: string;
  date: string;
  mood?: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DayStatus {
  date: string;
  status: 'completed' | 'failed' | 'none' | 'rocket_used' | 'skipped';
}

export interface HabitWithStats extends Habit {
  currentStreak: number;
  longestStreak: number;
  completedToday: boolean;
  skippedToday: boolean;
  completionRate: number;
  recentDays: DayStatus[];
  allDays: DayStatus[];
  rockets: number;
  rocketNextIn: number;
  weeklyCompletedCount?: number;
  copingSteps?: CopingStep[];
  todayUrgeCount?: number;
  impactSavings?: LifeImpactSavings;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  locale: 'en' | 'ja';
}
