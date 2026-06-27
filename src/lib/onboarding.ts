// オンボーディング v2「一生インパクト診断」の判断ロジック・完了時書き込み（純粋関数中心）。
//
// UI（src/components/onboarding/*）はこのモジュールの関数を使うだけにし、レンダリングと
// ロジックを分離する（decisions.md D-C2）。これにより node 環境の Vitest で state 遷移・
// バリデーション・相互排他・書き込み順序を単体検証できる（D-C1 / D-C5）。
//
// v2 の要点（plan.md change-C）:
//   - 画面は [0]イントロ [1]プロフィール [2]習慣選択(2分類) [3]計算中 [4]結果 [5]完了 の6つ。
//   - KPI 選択ステップは持たない（[4] は4軸同列）。trackedKpis は完了時に全 KpiKey を保存（D5）。
//   - [2] のプリセット母集団は全カタログ（KPI 非依存・D6）。
//   - セクションA（established）/B（active）はプリセット単位で相互排他（D2・二重計上防止）。
//   - 完了時は established（status='established' + established_since）と active（status='active'）を保存。

import type { HabitInsertInput } from '@/types/habit';
import type { KpiKey } from '@/data/kpi/catalog';
import { getKpi, KPI_KEYS } from '@/data/kpi/catalog';
import { getHabitPreset, HABIT_PRESETS, type HabitPreset } from '@/data/habit-presets';
import { getArticle } from '@/data/impact-articles';
import type { ProfileGender, UserProfile } from '@/lib/supabase/profiles';
import { upsertUserProfile } from '@/lib/supabase/profiles';
import { insertHabit, replaceHabitEvidences } from '@/lib/supabase/habits';
import type { EstablishedHabitInput, LifetimeImpactInput, LifetimeImpactResult } from '@/lib/lifetime-impact';

// 性別の選択肢（DB の CHECK 制約と一致。UI では male/female/other を提示）
export type OnboardingGender = 'male' | 'female' | 'other';

export interface OnboardingProfileInput {
  age: number | null;
  gender: OnboardingGender | null;
  country: string;
  annualIncome: number | null;
}

/** 画面ステップ（[0]イントロ 〜 [5]完了）。 */
export type OnboardingStep = 0 | 1 | 2 | 3 | 4 | 5;

/** セクションA（既に身についた習慣）の1件。yearsAgo は「いつから」（おおよその年数）。 */
export interface EstablishedSelection {
  presetId: string;
  yearsAgo: number;
}

export interface WizardState {
  step: OnboardingStep;
  profile: OnboardingProfileInput;
  /** セクションA: 既に習慣になっているもの（established）。 */
  established: EstablishedSelection[];
  /** セクションB: これから始めたいもの（active）。 */
  activePresetIds: string[];
}

// バリデーション定数
export const MIN_AGE = 1;
export const MAX_AGE = 120;
export const DEFAULT_CURRENCY = 'JPY';
/** セクションA でチェックしたときの既定の「いつから」（年）。UI で調整可能。 */
export const DEFAULT_ESTABLISHED_YEARS_AGO = 1;

/** 初期状態。永続化しないため、リロード/再アクセス時はこの初期状態（[0]）に戻る（C-S16）。 */
export function createInitialWizardState(): WizardState {
  return {
    step: 0,
    profile: { age: null, gender: null, country: 'JP', annualIncome: null },
    established: [],
    activePresetIds: [],
  };
}

// ───────── [1] プロフィール ─────────

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
  return Object.keys(validateProfileInput(input)).length === 0;
}

// ───────── [2] 習慣選択（2分類） ─────────

/** [2] に提示する全プリセットカタログ（KPI 非依存・D6）。 */
export function allHabitPresets(): readonly HabitPreset[] {
  return HABIT_PRESETS;
}

/** セクションB（active）が1つ以上選ばれていれば診断できる（セクションA は任意・AC#11 / C-S2）。 */
export function canAdvanceFromHabits(activePresetIds: string[]): boolean {
  return activePresetIds.length > 0;
}

export function isPresetEstablished(state: WizardState, presetId: string): boolean {
  return state.established.some((e) => e.presetId === presetId);
}

export function isPresetActive(state: WizardState, presetId: string): boolean {
  return state.activePresetIds.includes(presetId);
}

/**
 * セクションA（established）のトグル。
 * 追加時は active から外し（相互排他・D2）既定年数を入れる。既にあれば外す。
 */
export function toggleEstablished(state: WizardState, presetId: string): WizardState {
  if (isPresetEstablished(state, presetId)) {
    return { ...state, established: state.established.filter((e) => e.presetId !== presetId) };
  }
  return {
    ...state,
    established: [...state.established, { presetId, yearsAgo: DEFAULT_ESTABLISHED_YEARS_AGO }],
    activePresetIds: state.activePresetIds.filter((id) => id !== presetId),
  };
}

/**
 * セクションB（active）のトグル。
 * 追加時は established から外す（相互排他・D2）。既にあれば外す。
 */
export function toggleActive(state: WizardState, presetId: string): WizardState {
  if (isPresetActive(state, presetId)) {
    return { ...state, activePresetIds: state.activePresetIds.filter((id) => id !== presetId) };
  }
  return {
    ...state,
    activePresetIds: [...state.activePresetIds, presetId],
    established: state.established.filter((e) => e.presetId !== presetId),
  };
}

/** セクションA の対象プリセットの「いつから」（年数）を更新する。 */
export function setEstablishedYearsAgo(
  state: WizardState,
  presetId: string,
  yearsAgo: number
): WizardState {
  return {
    ...state,
    established: state.established.map((e) =>
      e.presetId === presetId ? { ...e, yearsAgo } : e
    ),
  };
}

/**
 * 「いつから」（おおよその年数）を開始日（YYYY-MM-DD）に変換する。
 * 負値は0年（当日）にクランプ。年数のみの概算なので月日は基準日（now）を踏襲する。
 */
export function yearsAgoToEstablishedSince(yearsAgo: number, now: Date = new Date()): string {
  const years = Math.max(0, Math.floor(yearsAgo));
  const d = new Date(Date.UTC(now.getUTCFullYear() - years, now.getUTCMonth(), now.getUTCDate()));
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// ───────── [3]→[4] 結果計算 ─────────

/** OnboardingProfileInput を計算用 UserProfile に変換する（保存はしない・計算入力専用）。 */
export function profileInputToUserProfile(input: OnboardingProfileInput): UserProfile {
  const birthYear = input.age !== null ? new Date().getFullYear() - input.age : null;
  return {
    userId: '',
    birthYear,
    gender: (input.gender ?? 'unspecified') as ProfileGender,
    country: input.country,
    annualIncome: input.annualIncome,
    currency: DEFAULT_CURRENCY,
    trackedKpis: [],
    createdAt: '',
    updatedAt: '',
  };
}

/** ウィザード状態から合算計算（computeLifetimeImpact）の入力を組み立てる。 */
export function buildLifetimeImpactInput(
  state: WizardState,
  now: Date = new Date()
): LifetimeImpactInput {
  const establishedHabits: EstablishedHabitInput[] = state.established.map((e) => ({
    presetId: e.presetId,
    establishedSince: yearsAgoToEstablishedSince(e.yearsAgo, now),
  }));
  return {
    activePresetIds: state.activePresetIds,
    establishedHabits,
    profile: profileInputToUserProfile(state.profile),
    now,
  };
}

/** [4] 過去累積ブロック（ブロック1）を表示するか。既存習慣がある場合のみ（AC#12）。 */
export function shouldShowPastBlock(result: LifetimeImpactResult): boolean {
  return result.pastIsEstimated;
}

// ───────── [3] 1回あたりの効果（プリセットカードの表示） ─────────

/** 「1回あたりの効果」の構造化結果（UI 側で i18n を適用するためロケール非依存で返す）。 */
export interface PresetEffect {
  kpi: KpiKey;
  /** 1回あたりの効果量（丸め済み・常に非負）。 */
  value: number;
  /** 出費削減（減らす量）なら true。表示時にマイナス符号を付ける。 */
  isReduction: boolean;
}

/**
 * プリセットの「1回あたりの効果」を指定 KPI 軸で算出する（C-S10）。
 * プリセットが参照する記事群の calculationParams を合算する。文言は付けず構造化データで返す。
 * 未知プリセット・効果0は null（UI 非表示判定に使える）。
 */
export function presetPerTimeEffectValue(presetId: string, kpi: KpiKey): PresetEffect | null {
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

  return { kpi, value: rounded, isReduction: kpi === 'cost_saving' };
}

// ───────── [4]→[5] 完了時の書き込み ─────────

/**
 * プリセットから Habit（insert 入力）を組み立てる。
 * 必須フィールドは既存 Discover の習慣採用フロー（habit-form.tsx）と同じ既定値で補う。
 * established の習慣は opts で status='established' / establishedSince を運ぶ（change-A の配線・C-S1）。
 * 未知プリセットは null。
 */
export function buildHabitFromPreset(
  presetId: string,
  opts?: { status?: 'active' | 'established'; establishedSince?: string }
): HabitInsertInput | null {
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
    // status を省略すると 'active' 既定（後方互換）。established のときのみ値を渡す。
    ...(opts?.status ? { status: opts.status } : {}),
    ...(opts?.establishedSince ? { establishedSince: opts.establishedSince } : {}),
  };
}

/** 書き込み対象の established 習慣（開始日付き）。 */
export interface OnboardingEstablishedWrite {
  presetId: string;
  establishedSince: string;
}

export interface OnboardingWriteInput {
  userId: string;
  profile: OnboardingProfileInput;
  /** セクションA: established 習慣（status='established' + established_since で保存）。 */
  established: OnboardingEstablishedWrite[];
  /** セクションB: active 習慣（status='active' で保存）。 */
  activePresetIds: string[];
  /**
   * 既に書き込み済みのプリセットID集合（部分失敗→再試行時に重複 insert を避ける・D-C3）。
   * 省略時は空集合（初回書き込み）。
   */
  completedPresetIds?: ReadonlySet<string>;
}

/**
 * 完了時の一括書き込み:
 *   1. upsert user_profiles（tracked_kpis=全 KpiKey・D5。冪等＝再試行安全）
 *   2. established 習慣を insert（status='established' + established_since）→ evidences
 *   3. active 習慣を insert（status 省略＝active）→ evidences
 * いずれかが失敗したら、それまでに成功した presetId 集合を例外に載せて throw する（C-S14・D-C3）。
 *
 * @returns 今回 + これまでに書き込みが成功したプリセットID集合
 */
export async function runOnboardingWrite(input: OnboardingWriteInput): Promise<Set<string>> {
  const birthYear =
    input.profile.age !== null ? new Date().getFullYear() - input.profile.age : null;

  const completed = new Set<string>(input.completedPresetIds ?? []);

  try {
    // 1. profile（冪等 upsert・trackedKpis=全4軸）
    await upsertUserProfile(input.userId, {
      birthYear,
      gender: (input.profile.gender ?? 'unspecified') as ProfileGender,
      country: input.profile.country,
      annualIncome: input.profile.annualIncome,
      currency: DEFAULT_CURRENCY,
      trackedKpis: [...KPI_KEYS],
    });

    // 2. established 習慣（過去累積の母集団）
    for (const { presetId, establishedSince } of input.established) {
      if (completed.has(presetId)) continue;
      await writeHabit(input.userId, presetId, completed, {
        status: 'established',
        establishedSince,
      });
    }

    // 3. active 習慣（未来積み上げの母集団）
    for (const presetId of input.activePresetIds) {
      if (completed.has(presetId)) continue;
      await writeHabit(input.userId, presetId, completed);
    }

    return completed;
  } catch (error) {
    throw new OnboardingWriteError(error, completed);
  }
}

/** habit insert + evidences を1件分書き込み、成功したら completed に追加する。 */
async function writeHabit(
  userId: string,
  presetId: string,
  completed: Set<string>,
  opts?: { status?: 'active' | 'established'; establishedSince?: string }
): Promise<void> {
  const habitInput = buildHabitFromPreset(presetId, opts);
  const preset = getHabitPreset(presetId);
  if (!habitInput || !preset) {
    completed.add(presetId); // 無効プリセットは処理済み扱いで再試行ループに残さない
    return;
  }

  const created = await insertHabit(userId, habitInput);
  const evidences = preset.articleIds.map((articleId) => ({ articleId, weight: 100 }));
  if (evidences.length > 0) {
    await replaceHabitEvidences(created.id, evidences);
  }
  completed.add(presetId);
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
