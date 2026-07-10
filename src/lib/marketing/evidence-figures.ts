import { getArticle, getArticleList } from '@/data/impact-articles';
import { V2_DEFAULT_PROFILE, type ArticleId, type LifeImpactArticle } from '@/types/impact';

/**
 * Marketing LP (Clarity) の図表が使う数値は、すべて `src/data/impact-articles/`
 * ＝アプリ本体が使っているエビデンス記事データセットから導出する。
 *
 * このモジュールにハードコードされた「効果の数値」は 1 つも無い。
 * LP に出る棒グラフ・累積カーブ・出典リストは、記事データが更新されれば
 * そのまま追随する。数値の捏造を構造的に不可能にするのが本モジュールの目的。
 */

/** 表に載せる代表習慣。4 指標がまんべんなく埋まるように選んだ固定リスト。 */
export const FEATURED_ARTICLE_IDS: readonly ArticleId[] = [
  'sleep_7hours',
  'daily_walking',
  'daily_cardio',
  'eat_vegetables',
  'daily_meditation',
  'quit_alcohol',
  'home_cooking',
  'daily_saving',
];

/**
 * 健康寿命の値が突出している外れ値。同じ棒グラフに混ぜると他が潰れて読めないので、
 * グラフから外して単独のカードで提示する（軸を歪めないための扱い）。
 */
export const OUTLIER_ARTICLE_ID: ArticleId = 'quit_smoking';

/** 累積カーブの例に使う習慣セット。 */
export const CUMULATIVE_ARTICLE_IDS: readonly ArticleId[] = [
  'sleep_7hours',
  'daily_walking',
  'eat_vegetables',
];

/** 出典セクションに載せる習慣（代表習慣＋外れ値）。 */
export const REFERENCE_ARTICLE_IDS: readonly ArticleId[] = [
  OUTLIER_ARTICLE_ID,
  'sleep_7hours',
  'daily_walking',
  'daily_cardio',
];

export const MINUTES_PER_DAY = 1440;
export const DAYS_PER_YEAR = 365;
export const CUMULATIVE_YEARS = 10;

export type ConfidenceLevel = LifeImpactArticle['confidenceLevel'];

export interface HabitFigure {
  id: ArticleId;
  /** データセット上の日本語名。UI ではロケール別ラベルを使い、これは参考値。 */
  sourceName: string;
  healthMinutes: number;
  costSaving: number;
  incomeGain: number;
  positiveMoodMinutes: number;
  confidence: ConfidenceLevel;
}

function toFigure(id: ArticleId): HabitFigure {
  const article = getArticle(id);
  if (!article) throw new Error(`unknown impact article: ${id}`);
  return {
    id,
    sourceName: article.habitName,
    healthMinutes: article.calculationParams.dailyHealthMinutes,
    costSaving: article.calculationParams.dailyCostSaving,
    incomeGain: article.calculationParams.dailyIncomeGain,
    positiveMoodMinutes: article.calculationParams.dailyPositiveMoodMinutes,
    confidence: article.confidenceLevel,
  };
}

export function getFeaturedHabits(): HabitFigure[] {
  return FEATURED_ARTICLE_IDS.map(toFigure);
}

export function getOutlierHabit(): HabitFigure {
  return toFigure(OUTLIER_ARTICLE_ID);
}

/** 各列の最大値。棒の幅はこの値に対する比率で描く（列ごとに正規化）。 */
export interface ColumnMaxima {
  healthMinutes: number;
  costSaving: number;
  incomeGain: number;
  positiveMoodMinutes: number;
}

export function getColumnMaxima(rows: HabitFigure[]): ColumnMaxima {
  const max = (pick: (r: HabitFigure) => number) =>
    rows.reduce((acc, r) => Math.max(acc, pick(r)), 0);
  return {
    healthMinutes: max((r) => r.healthMinutes),
    costSaving: max((r) => r.costSaving),
    incomeGain: max((r) => r.incomeGain),
    positiveMoodMinutes: max((r) => r.positiveMoodMinutes),
  };
}

export interface CorpusFigures {
  articleCount: number;
  /** 出典の実数（同一文献の重複を除いた数）。 */
  sourceCount: number;
  axisCount: number;
  confidence: Record<ConfidenceLevel, number>;
}

export function getCorpusFigures(): CorpusFigures {
  const list = getArticleList();
  const uniqueSources = new Set<string>();
  const confidence: Record<ConfidenceLevel, number> = { high: 0, medium: 0, low: 0 };

  for (const entry of list) {
    confidence[entry.confidenceLevel] += 1;
    const article = getArticle(entry.id);
    if (!article) continue;
    for (const source of article.article.sources) {
      uniqueSources.add(source.text.trim());
    }
  }

  return {
    articleCount: list.length,
    sourceCount: uniqueSources.size,
    axisCount: 4,
    confidence,
  };
}

/** 累積カーブの前提となる 1 日あたりの健康寿命（分）。単純な線形加算。 */
export function getCumulativeDailyMinutes(): number {
  return CUMULATIVE_ARTICLE_IDS.map(toFigure).reduce((sum, f) => sum + f.healthMinutes, 0);
}

export interface CumulativePoint {
  year: number;
  healthyDays: number;
}

/**
 * 継続年数に対する健康寿命の累積（日）。
 * アプリ本体の `calculateAnnualImpact`（日次 × 365）と同じ線形モデル。
 */
export function getCumulativeSeries(years: number = CUMULATIVE_YEARS): CumulativePoint[] {
  const perDay = getCumulativeDailyMinutes();
  return Array.from({ length: years + 1 }, (_, year) => ({
    year,
    healthyDays: (perDay * DAYS_PER_YEAR * year) / MINUTES_PER_DAY,
  }));
}

export interface ReferenceGroup {
  articleId: ArticleId;
  sources: LifeImpactArticle['article']['sources'];
}

export function getReferenceGroups(): ReferenceGroup[] {
  return REFERENCE_ARTICLE_IDS.map((articleId) => {
    const article = getArticle(articleId);
    if (!article) throw new Error(`unknown impact article: ${articleId}`);
    return { articleId, sources: article.article.sources };
  });
}

/**
 * 数値の前提となるモデルプロフィール。
 * 「誰にとっての値なのか」を LP 上で明示するために公開する。
 */
export const MODEL_PROFILE = V2_DEFAULT_PROFILE;
