export interface Habit {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  frequency: 'daily' | 'weekly' | 'custom';
  customDays?: number[];
  type: 'positive' | 'quit';
  dailyTarget: number;
  createdAt: string;
  archived: boolean;
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
}

export interface HabitWithStats extends Habit {
  currentStreak: number;
  longestStreak: number;
  completedToday: boolean;
  completionRate: number;
  copingSteps?: CopingStep[];
  todayUrgeCount?: number;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  locale: 'en' | 'ja';
}
