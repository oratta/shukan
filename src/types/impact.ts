// 有効な記事IDの型安全な定義
export type ArticleId = 'quit_smoking' | 'quit_porn';

const VALID_ARTICLE_IDS: readonly string[] = ['quit_smoking', 'quit_porn'] as const;

export function isValidArticleId(id: string | null | undefined): id is ArticleId {
  return typeof id === 'string' && VALID_ARTICLE_IDS.includes(id);
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

// 累積インパクト（算出値、保存なし）
export interface LifeImpactSavings {
  completedDays: number;
  healthMinutes: number;
  costSaving: number;
  incomeGain: number;
}
