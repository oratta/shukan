// 設定画面のプロフィール編集とホームの tracked_kpis 表示のための純粋関数群（change-5）。
//
// オンボ成果物（user_profiles）をアプリ本体に接続する。DB I/O は持たず、
// 表示 KPI の解決・入力妥当性・upsert 入力の組み立てのみを担う。
//
// 用語ルール: あの4つは「KPI」とだけ呼ぶ（造語を作らない）。

import { KPI_CATALOG, type KpiKey, type KpiDefinition } from '@/data/kpi/catalog';
import type { UserProfile, UserProfileInput, ProfileGender } from '@/lib/supabase/profiles';

const VALID_KPI_KEYS = new Set<string>(KPI_CATALOG.map((d) => d.key));

/** 生年の下限（現実的な最古年）。 */
export const MIN_BIRTH_YEAR = 1900;

/**
 * tracked_kpis（DB の string[]）を表示用 KPI 定義に解決する。
 *   - KPI_CATALOG の並び順を維持する
 *   - カタログに存在しないキーは除外する
 *   - 空 / null / undefined（プロフィール未設定）は全4 KPI にフォールバック（config rule）
 */
export function resolveTrackedKpiDefinitions(
  trackedKpis: readonly string[] | null | undefined
): KpiDefinition[] {
  const selected = new Set((trackedKpis ?? []).filter((k) => VALID_KPI_KEYS.has(k)));
  if (selected.size === 0) return [...KPI_CATALOG];
  return KPI_CATALOG.filter((d) => selected.has(d.key));
}

/** 設定画面のプロフィール編集フォームの入力値。 */
export interface ProfileSettingsInput {
  birthYear: number | null;
  gender: ProfileGender;
  annualIncome: number | null;
  trackedKpis: KpiKey[];
}

/** 入力エラー（キーが立っていれば無効）。 */
export interface ProfileSettingsErrors {
  birthYear?: 'invalid';
  annualIncome?: 'invalid';
  trackedKpis?: 'empty';
}

/**
 * 入力妥当性を検証する。
 *   - birthYear は null（未入力）許容。数値のときは 1900〜今年の整数のみ
 *   - annualIncome は null（未入力）許容。数値のときは 0 以上
 *   - trackedKpis は 1 つ以上必須
 */
export function validateProfileSettingsInput(
  input: ProfileSettingsInput,
  now: Date = new Date()
): ProfileSettingsErrors {
  const errors: ProfileSettingsErrors = {};

  if (
    input.birthYear !== null &&
    (!Number.isInteger(input.birthYear) ||
      input.birthYear < MIN_BIRTH_YEAR ||
      input.birthYear > now.getFullYear())
  ) {
    errors.birthYear = 'invalid';
  }

  if (
    input.annualIncome !== null &&
    (!Number.isFinite(input.annualIncome) || input.annualIncome < 0)
  ) {
    errors.annualIncome = 'invalid';
  }

  if (input.trackedKpis.length === 0) {
    errors.trackedKpis = 'empty';
  }

  return errors;
}

/** 保存可能か（エラーが 1 つも無いか）。 */
export function canSaveProfileSettings(
  input: ProfileSettingsInput,
  now: Date = new Date()
): boolean {
  return Object.keys(validateProfileSettingsInput(input, now)).length === 0;
}

/**
 * UserProfile（または null）を編集フォーム初期値へ変換する。
 * null（プロフィール未設定）は全4 KPI・生年/収入 null・gender 未指定でフォールバックする。
 */
export function userProfileToSettingsInput(profile: UserProfile | null): ProfileSettingsInput {
  if (!profile) {
    return {
      birthYear: null,
      gender: 'unspecified',
      annualIncome: null,
      trackedKpis: KPI_CATALOG.map((d) => d.key),
    };
  }
  return {
    birthYear: profile.birthYear,
    gender: profile.gender,
    annualIncome: profile.annualIncome,
    trackedKpis: resolveTrackedKpiDefinitions(profile.trackedKpis).map((d) => d.key),
  };
}

/**
 * 編集フォーム入力 → upsert 用 UserProfileInput。
 * country / currency は日本固定（オンボ入力に合わせる）。
 */
export function buildUserProfileInput(input: ProfileSettingsInput): UserProfileInput {
  return {
    birthYear: input.birthYear,
    gender: input.gender,
    country: 'JP',
    annualIncome: input.annualIncome,
    currency: 'JPY',
    trackedKpis: input.trackedKpis,
  };
}

/** KPI 選択のトグル（純粋。含まれていれば外す・無ければ追加）。 */
export function toggleTrackedKpi(kpis: KpiKey[], kpi: KpiKey): KpiKey[] {
  return kpis.includes(kpi) ? kpis.filter((k) => k !== kpi) : [...kpis, kpi];
}
