// 有効な記事IDの型安全な定義
export type ArticleId =
  | 'quit_smoking'
  | 'quit_porn'
  | 'quit_alcohol'
  | 'quit_sugar'
  | 'quit_junk_food'
  | 'quit_social_media'
  | 'daily_cardio'
  | 'daily_strength'
  | 'daily_walking'
  | 'daily_stretching'
  | 'daily_yoga'
  | 'daily_meditation'
  | 'daily_journaling'
  | 'daily_reading'
  | 'daily_saving'
  | 'morning_planning'
  | 'no_youtube'
  | 'no_screens_before_bed'
  | 'no_impulse_buying'
  | 'cold_shower'
  | 'sleep_7hours'
  | 'wake_early'
  | 'gratitude_practice'
  | 'drink_water'
  | 'eat_vegetables'
  | 'intermittent_fasting'
  | 'home_cooking'
  | 'deep_work'
  | 'learn_language'
  | 'time_in_nature'
  | 'morning_tidying'
  | 'daily_habit_review'
  | 'schedule_adherence'
  | 'pomodoro_technique'
  | 'movement_breaks';

const VALID_ARTICLE_IDS: readonly string[] = [
  'quit_smoking',
  'quit_porn',
  'quit_alcohol',
  'quit_sugar',
  'quit_junk_food',
  'quit_social_media',
  'daily_cardio',
  'daily_strength',
  'daily_walking',
  'daily_stretching',
  'daily_yoga',
  'daily_meditation',
  'daily_journaling',
  'daily_reading',
  'daily_saving',
  'morning_planning',
  'no_youtube',
  'no_screens_before_bed',
  'no_impulse_buying',
  'cold_shower',
  'sleep_7hours',
  'wake_early',
  'gratitude_practice',
  'drink_water',
  'eat_vegetables',
  'intermittent_fasting',
  'home_cooking',
  'deep_work',
  'learn_language',
  'time_in_nature',
  'morning_tidying',
  'daily_habit_review',
  'schedule_adherence',
  'pomodoro_technique',
  'movement_breaks',
] as const;

export function isValidArticleId(id: string | null | undefined): id is ArticleId {
  return typeof id === 'string' && VALID_ARTICLE_IDS.includes(id);
}

// 計算ロジックのステップ（1つの計算過程を表す）
export interface CalcStep {
  label: string;      // ステップの説明（例: "研究結果"）
  value?: string;     // 値（例: "10年延命"）
  formula?: string;   // 計算式（例: "8年 × 525,600分 ÷ 40年 ÷ 365日"）
  result?: string;    // 結果（例: "288分/日"）
}

// 記事データ（静的、ビルド時バンドル）
export interface LifeImpactArticle {
  habitCategory: ArticleId;
  habitName: string;

  // 固定レイヤー: 普遍的な研究結果（全ユーザー共通）
  article: {
    // 研究紹介テキスト。{{health_inference}}, {{cost_inference}},
    // {{income_inference}}, {{cumulative}} をブロックプレースホルダーとして含む。
    researchBody: string;
    sources: {
      id: number;
      text: string;
      url?: string;
    }[];
  };

  // 推論レイヤー: ユーザープロフィールに基づく推論段落
  // V2: ハードコードプロフィール用に事前作成
  // V3: LLMがユーザープロフィールから動的生成
  inferences: {
    health: string;
    cost: string;
    income: string;
    cumulative: string;
  };

  // 計算用パラメータ（貯金計算に使用、記事表示とは独立）
  calculationParams: {
    dailyHealthMinutes: number;
    dailyCostSaving: number;
    dailyIncomeGain: number;
  };

  confidenceLevel: 'high' | 'medium' | 'low';

  // 計算ロジック（算出根拠の構造化データ、optional）
  calculationLogic?: {
    health: CalcStep[];
    cost: CalcStep[];
    income: CalcStep[];
  };

  // Discover（マーケットプレイス）用メタデータ
  defaultHabitType: 'positive' | 'quit';
  defaultIcon: string;
}

// V2ハードコードプロフィール
export const V2_DEFAULT_PROFILE = {
  nationality: 'Japanese' as const,
  gender: 'male' as const,
  birthYear: 1984,
  age: 42,
  annualIncome: 15_000_000,
  currency: 'JPY' as const,
  remainingWorkingYears: 23,
  dailyWage: 62_500,
  remainingLifeExpectancy: 40,
  userContext: '42歳の日本人男性（年収1,500万円）',
};

// 習慣とエビデンスの紐付け（多対多 + 重み）
export interface HabitEvidence {
  id: string;
  habitId: string;
  articleId: ArticleId;
  weight: number; // 1-100 (パーセンテージ)
}

// 累積インパクト（算出値、保存なし）
export interface LifeImpactSavings {
  completedDays: number;
  healthMinutes: number;
  costSaving: number;
  incomeGain: number;
}
