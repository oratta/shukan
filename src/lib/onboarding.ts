// オンボーディングの判断ロジック・完了時書き込みオーケストレーション（純粋関数中心）。
//
// UI（src/app/onboarding/*）はこのモジュールの関数を使うだけにし、レンダリングと
// ロジックを分離する（decisions.md D-C2）。これにより node 環境の Vitest で
// クリック→state 遷移・バリデーション・書き込み順序を単体検証できる（D-C1）。

import type { Habit } from '@/types/habit';
import type { KpiKey } from '@/data/kpi/catalog';
import { getKpi } from '@/data/kpi/catalog';
import { getHabitPreset, getPresetsForKpi, type HabitPreset } from '@/data/habit-presets';
import { getArticle } from '@/data/impact-articles';
import type { ProfileGender } from '@/lib/supabase/profiles';
import { upsertUserProfile } from '@/lib/supabase/profiles';
import { insertHabit, replaceHabitEvidences } from '@/lib/supabase/habits';

// 性別の選択肢（DB の CHECK 制約と一致。UI では male/female/other を提示）
export type OnboardingGender = 'male' | 'female' | 'other';

export interface OnboardingProfileInput {
  age: number | null;
  gender: OnboardingGender | null;
  country: string;
  annualIncome: number | null;
}

export interface WizardState {
  step: 1 | 2 | 3 | 4;
  selectedKpi: KpiKey | null;
  profile: OnboardingProfileInput;
  selectedPresetIds: string[];
}

// バリデーション定数
export const MIN_AGE = 1;
export const MAX_AGE = 120;
export const DEFAULT_CURRENCY = 'JPY';

/** 初期状態。永続化しないため、リロード/再アクセス時はこの初期状態に戻る（C-S16）。 */
export function createInitialWizardState(): WizardState {
  return {
    step: 1,
    selectedKpi: null,
    profile: { age: null, gender: null, country: 'JP', annualIncome: null },
    selectedPresetIds: [],
  };
}

// ───────── [1] KPI 選択 ─────────

/** KPI が1つ選ばれていれば次へ進める（C-S7）。 */
export function canAdvanceFromKpi(selectedKpi: KpiKey | null): boolean {
  return selectedKpi !== null;
}

// ───────── [2] プロフィール ─────────

export interface ProfileErrors {
  age?: string;
  gender?: string;
  country?: string;
  annualIncome?: string;
}

/** フィールド別バリデーション（C-S9）。エラーがなければ各キーは undefined。 */
export function validateProfileInput(input: OnboardingProfileInput): ProfileErrors {
  const errors: ProfileErrors = {};

  if (
    input.age === null ||
    !Number.isFinite(input.age) ||
    !Number.isInteger(input.age) ||
    input.age < MIN_AGE ||
    input.age > MAX_AGE
  ) {
    errors.age = 'invalid';
  }

  if (input.gender !== 'male' && input.gender !== 'female' && input.gender !== 'other') {
    errors.gender = 'required';
  }

  if (!input.country || input.country.trim() === '') {
    errors.country = 'required';
  }

  // 年収は任意。入力された場合のみ非負・有限を要求。
  if (
    input.annualIncome !== null &&
    (!Number.isFinite(input.annualIncome) || input.annualIncome < 0)
  ) {
    errors.annualIncome = 'invalid';
  }

  return errors;
}

/** 必須が揃い不正値がなければ次へ進める（年収空欄でも可・C-S9）。 */
export function canAdvanceFromProfile(input: OnboardingProfileInput): boolean {
  const errors = validateProfileInput(input);
  return Object.keys(errors).length === 0;
}

// ───────── [3] 習慣プリセット ─────────

/** 選んだ KPI 向けプリセットのみ返す（C-S10）。 */
export function presetsForKpi(kpi: KpiKey): HabitPreset[] {
  return getPresetsForKpi(kpi);
}

/** 1つ以上選んでいれば開始できる（C-S11）。 */
export function canAdvanceFromPresets(selectedPresetIds: string[]): boolean {
  return selectedPresetIds.length > 0;
}

/** 「1回あたりの効果」の構造化結果（UI 側で i18n を適用するためロケール非依存で返す）。 */
export interface PresetEffect {
  kpi: KpiKey;
  /** 1回あたりの効果量（丸め済み・常に非負）。 */
  value: number;
  /** 出費削減（減らす量）なら true。表示時にマイナス符号を付ける。 */
  isReduction: boolean;
}

/**
 * プリセットの「1回あたりの効果」を選んだ KPI 軸で算出する（C-S10）。
 * プリセットが参照する記事群の calculationParams を合算する。
 * KPI名・単位・符号などの**文言は付けず**、構造化データで返す（en/ja の i18n は UI 側で適用）。
 * 未知プリセット・効果0は null（UI 非表示判定に使える）。
 */
export function presetPerTimeEffectValue(
  presetId: string,
  kpi: KpiKey
): PresetEffect | null {
  const preset = getHabitPreset(presetId);
  const def = getKpi(kpi);
  if (!preset || !def) return null;

  let value = 0;
  for (const articleId of preset.articleIds) {
    const article = getArticle(articleId);
    if (!article) continue;
    const p = article.calculationParams;
    switch (kpi) {
      case 'health_lifespan':
        value += p.dailyHealthMinutes;
        break;
      case 'positive_mood':
        value += p.dailyPositiveMoodMinutes;
        break;
      case 'cost_saving':
        value += p.dailyCostSaving;
        break;
      case 'earning':
        value += p.dailyIncomeGain;
        break;
    }
  }

  const rounded = Math.round(value);
  if (rounded === 0) return null;

  // 出費削減は「減らす」量なのでマイナス表示、それ以外はプラス表示。
  return { kpi, value: rounded, isReduction: kpi === 'cost_saving' };
}

// ───────── [4] 完了時の書き込み ─────────

/**
 * プリセットから Habit（insert 入力）を組み立てる。
 * 必須フィールドは既存 Discover の習慣採用フロー（habit-form.tsx）と同じ既定値で補う:
 *   frequency='everyday' / customDays=undefined / weeklyTarget=undefined /
 *   dailyTarget = quit ? 3 : 1 / type=プリセットの defaultHabitType / impactArticleId=undefined。
 * 未知プリセットは null。
 */
export function buildHabitFromPreset(
  presetId: string
): Omit<Habit, 'id' | 'createdAt' | 'archived' | 'sortOrder'> | null {
  const preset = getHabitPreset(presetId);
  if (!preset) return null;

  return {
    name: preset.name,
    description: undefined,
    lifeSignificance: undefined,
    icon: preset.icon,
    frequency: 'everyday',
    customDays: undefined,
    type: preset.defaultHabitType,
    dailyTarget: preset.defaultHabitType === 'quit' ? 3 : 1,
    weeklyTarget: undefined,
    impactArticleId: undefined,
    evidences: [],
  };
}

export interface OnboardingWriteInput {
  userId: string;
  selectedKpi: KpiKey;
  profile: OnboardingProfileInput;
  selectedPresetIds: string[];
  /**
   * 既に書き込み済みのプリセットID集合（部分失敗→再試行時に重複 insert を避ける・D-C3）。
   * habit insert は冪等でないため、ここに含まれる presetId はスキップする。
   * 省略時は空集合（初回書き込み）。
   */
  completedPresetIds?: ReadonlySet<string>;
}

/**
 * 完了時の一括書き込み（D3 の順序）:
 *   1. upsert user_profiles（tracked_kpis=選んだKPIキー。冪等＝再試行安全）
 *   2. 選んだプリセットごとに insert habits（completedPresetIds 済みはスキップ）
 *   3. その habit に replaceHabitEvidences（プリセットの articleIds、weight=100）
 * いずれかが失敗したら、それまでに成功した presetId 集合を例外に載せて throw する。
 * 呼び出し側は[4]に留まりエラー表示し、その集合を completedPresetIds に渡して再試行する（C-S14・D-C3）。
 *
 * @returns 今回 + これまでに書き込みが成功したプリセットID集合（全成功時の確認用）
 */
export async function runOnboardingWrite(
  input: OnboardingWriteInput
): Promise<Set<string>> {
  const birthYear =
    input.profile.age !== null ? new Date().getFullYear() - input.profile.age : null;

  // 既に書き込み済みのプリセットを引き継ぐ（再試行時の重複防止）
  const completed = new Set<string>(input.completedPresetIds ?? []);

  try {
    // 1. profile（冪等 upsert。再試行で重複しない）
    await upsertUserProfile(input.userId, {
      birthYear,
      gender: (input.profile.gender ?? 'unspecified') as ProfileGender,
      country: input.profile.country,
      annualIncome: input.profile.annualIncome,
      currency: DEFAULT_CURRENCY,
      trackedKpis: [input.selectedKpi],
    });

    // 2 & 3. habits ＋ evidences（プリセット順・未完了分のみ）
    for (const presetId of input.selectedPresetIds) {
      if (completed.has(presetId)) continue; // 書き込み済みはスキップ（重複防止）

      const habitInput = buildHabitFromPreset(presetId);
      const preset = getHabitPreset(presetId);
      if (!habitInput || !preset) {
        completed.add(presetId); // 無効プリセットは「処理済み」扱いで再試行ループに残さない
        continue;
      }

      const created = await insertHabit(input.userId, habitInput);
      const evidences = preset.articleIds.map((articleId) => ({
        articleId,
        weight: 100,
      }));
      if (evidences.length > 0) {
        await replaceHabitEvidences(created.id, evidences);
      }
      // habit + evidences の両方が成功した時点で「完了」とマーク
      completed.add(presetId);
    }

    return completed;
  } catch (error) {
    // それまでに成功した集合を例外に載せ、呼び出し側が再試行に引き継げるようにする
    throw new OnboardingWriteError(error, completed);
  }
}

/**
 * 書き込み失敗時の例外。succeededPresetIds に「それまでに成功した presetId」を載せる。
 * 呼び出し側はこれを completedPresetIds として再試行に渡し、重複 insert を避ける（D-C3）。
 */
export class OnboardingWriteError extends Error {
  readonly cause: unknown;
  readonly succeededPresetIds: Set<string>;

  constructor(cause: unknown, succeededPresetIds: Set<string>) {
    super(cause instanceof Error ? cause.message : 'onboarding write failed');
    this.name = 'OnboardingWriteError';
    this.cause = cause;
    this.succeededPresetIds = succeededPresetIds;
  }
}
