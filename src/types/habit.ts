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
  /**
   * 習慣のライフサイクル状態。
   *   'active'      … これから積み上げる習慣（既定）
   *   'established' … 既に身についた（習慣化済み）習慣
   * 読み出し（toHabit）は常に値を埋める（DB 既定 'active' / フォールバックあり）ため
   * コンシューマに undefined を漏らさない必須フィールドとする。
   */
  status: 'active' | 'established';
  /** established の習慣が身についた開始日（YYYY-MM-DD）。active では undefined。 */
  establishedSince?: string;
}

/**
 * habit 書き込み（insert）時の入力型。
 * id/createdAt/archived/sortOrder は DB / サーバ側で割り当てるため除外。
 * status/establishedSince は省略可能（省略時は active 既定）にして、
 * 既存の書き込み経路（habit-form / discover 採用）を後方互換に保つ。
 * established 習慣を保存する経路（onboarding v2）はこのフィールドに値を渡す（change-C）。
 */
export type HabitInsertInput = Omit<
  Habit,
  'id' | 'createdAt' | 'archived' | 'sortOrder' | 'status' | 'establishedSince'
> & {
  status?: 'active' | 'established';
  establishedSince?: string;
};

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
