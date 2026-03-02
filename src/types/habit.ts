import type { ArticleId, LifeImpactSavings } from './impact';

export interface Habit {
  id: string;
  name: string;
  description?: string;
  lifeSignificance?: string;
  icon: string;
  color: string;
  frequency: 'daily' | 'weekly' | 'custom';
  customDays?: number[];
  type: 'positive' | 'quit';
  dailyTarget: number;
  createdAt: string;
  archived: boolean;
  impactArticleId?: ArticleId;
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
  status: 'completed' | 'failed' | 'rocket_used';
}

export interface DayStatus {
  date: string;
  status: 'completed' | 'failed' | 'none' | 'rocket_used';
}

export interface HabitWithStats extends Habit {
  currentStreak: number;
  longestStreak: number;
  completedToday: boolean;
  completionRate: number;
  recentDays: DayStatus[];
  allDays: DayStatus[];
  rockets: number;
  rocketNextIn: number;
  copingSteps?: CopingStep[];
  todayUrgeCount?: number;
  impactSavings?: LifeImpactSavings;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  locale: 'en' | 'ja';
}
