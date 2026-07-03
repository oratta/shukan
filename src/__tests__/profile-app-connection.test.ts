import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import ja from '@/messages/ja.json';
import en from '@/messages/en.json';
import { KPI_CATALOG, type KpiKey } from '@/data/kpi/catalog';
import {
  resolveTrackedKpiDefinitions,
  validateProfileSettingsInput,
  canSaveProfileSettings,
  userProfileToSettingsInput,
  buildUserProfileInput,
  toggleTrackedKpi,
  type ProfileSettingsInput,
} from '@/lib/profile-settings';
import { computeHabitLifetimeEffect } from '@/lib/diagnosis-v3';
import type { UserProfile } from '@/lib/supabase/profiles';

// change-5: profile-app-connection
//
// タスク D（D-4 除く）。オンボ成果物（user_profiles）をアプリ本体に接続する:
//   - ホームに tracked_kpis を反映（AC#12）
//   - 設定画面でプロフィール編集・保存（AC#13）
//   - established の生涯効果を resolveDerivedProfileValues で個人化（AC#14）

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
function readSource(rel: string): string {
  return readFileSync(resolve(projectRoot, rel), 'utf-8');
}

const ALL_KPI_KEYS = KPI_CATALOG.map((d) => d.key);

function makeProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    userId: 'u1',
    birthYear: 1990,
    gender: 'male',
    country: 'JP',
    annualIncome: 5_000_000,
    currency: 'JPY',
    trackedKpis: [...ALL_KPI_KEYS],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

// ============================================================
// Scenario 5-1: ホームに tracked_kpis の KPI が表示される（AC#12）
// ============================================================

describe('resolveTrackedKpiDefinitions (Scenario 5-1)', () => {
  it('tracked_kpis を KPI カタログ順の定義に解決する', () => {
    const defs = resolveTrackedKpiDefinitions(['earning', 'health_lifespan']);
    // カタログ順（health_lifespan が earning より前）を維持する
    expect(defs.map((d) => d.key)).toEqual(['health_lifespan', 'earning']);
  });

  it('カタログに存在しないキーは除外する', () => {
    const defs = resolveTrackedKpiDefinitions(['health_lifespan', 'bogus_kpi']);
    expect(defs.map((d) => d.key)).toEqual(['health_lifespan']);
  });

  it('空配列は全4 KPI にフォールバックする（プロフィール未設定の既定値）', () => {
    expect(resolveTrackedKpiDefinitions([]).map((d) => d.key)).toEqual(ALL_KPI_KEYS);
  });

  it('null / undefined も全4 KPI にフォールバックする（エラーにしない）', () => {
    expect(resolveTrackedKpiDefinitions(null).map((d) => d.key)).toEqual(ALL_KPI_KEYS);
    expect(resolveTrackedKpiDefinitions(undefined).map((d) => d.key)).toEqual(ALL_KPI_KEYS);
  });

  it('全キー不正のときも全4 KPI にフォールバックする', () => {
    expect(resolveTrackedKpiDefinitions(['x', 'y']).map((d) => d.key)).toEqual(ALL_KPI_KEYS);
  });
});

describe('ホームが TrackedKpisCard と profile を配線している (Scenario 5-1)', () => {
  const home = readSource('src/app/(app)/page.tsx');
  it('TrackedKpisCard をインポートして描画する', () => {
    expect(home).toContain('TrackedKpisCard');
  });
  it('useProfile フックで profile を取得する', () => {
    expect(home).toContain('useProfile');
  });
});

describe('TrackedKpisCard は tracked_kpis を KPI 名で描画する (Scenario 5-1)', () => {
  const src = readSource('src/components/habits/tracked-kpis-card.tsx');
  it('resolveTrackedKpiDefinitions で表示 KPI を解決する', () => {
    expect(src).toContain('resolveTrackedKpiDefinitions');
  });
  it('KPI 名は正準 onboarding.kpi.*.name を参照する（造語を作らない）', () => {
    expect(src).toContain('onboarding.kpi.');
  });
});

// ============================================================
// Scenario 5-2: 設定画面でプロフィールを編集・保存できる（AC#13）
// ============================================================

function input(overrides: Partial<ProfileSettingsInput> = {}): ProfileSettingsInput {
  return {
    birthYear: 1990,
    gender: 'male',
    annualIncome: 5_000_000,
    trackedKpis: [...ALL_KPI_KEYS],
    ...overrides,
  };
}

const NOW = new Date('2026-07-03T00:00:00Z');

describe('validateProfileSettingsInput (Scenario 5-2)', () => {
  it('妥当な入力はエラーなし', () => {
    expect(validateProfileSettingsInput(input(), NOW)).toEqual({});
    expect(canSaveProfileSettings(input(), NOW)).toBe(true);
  });

  it('birthYear=null（未入力）は許容する', () => {
    expect(validateProfileSettingsInput(input({ birthYear: null }), NOW).birthYear).toBeUndefined();
  });

  it('未来の生年は invalid', () => {
    expect(validateProfileSettingsInput(input({ birthYear: 2030 }), NOW).birthYear).toBe('invalid');
  });

  it('1900 未満の生年は invalid', () => {
    expect(validateProfileSettingsInput(input({ birthYear: 1800 }), NOW).birthYear).toBe('invalid');
  });

  it('annualIncome=null（未入力）は許容する', () => {
    expect(validateProfileSettingsInput(input({ annualIncome: null }), NOW).annualIncome).toBeUndefined();
  });

  it('負の収入は invalid', () => {
    expect(validateProfileSettingsInput(input({ annualIncome: -1 }), NOW).annualIncome).toBe('invalid');
  });

  it('KPI 未選択（空）は保存不可', () => {
    const errors = validateProfileSettingsInput(input({ trackedKpis: [] }), NOW);
    expect(errors.trackedKpis).toBe('empty');
    expect(canSaveProfileSettings(input({ trackedKpis: [] }), NOW)).toBe(false);
  });
});

describe('userProfileToSettingsInput (Scenario 5-2)', () => {
  it('プロフィールの値を編集フォーム初期値に写す', () => {
    const result = userProfileToSettingsInput(makeProfile({ trackedKpis: ['earning'] }));
    expect(result.birthYear).toBe(1990);
    expect(result.gender).toBe('male');
    expect(result.annualIncome).toBe(5_000_000);
    expect(result.trackedKpis).toEqual(['earning']);
  });

  it('プロフィール未設定（null）は全4 KPI・生年/収入 null の既定値でフォールバックする', () => {
    const result = userProfileToSettingsInput(null);
    expect(result.birthYear).toBeNull();
    expect(result.annualIncome).toBeNull();
    expect(result.trackedKpis).toEqual(ALL_KPI_KEYS);
  });
});

describe('buildUserProfileInput (Scenario 5-2)', () => {
  it('upsert 入力に country=JP / currency=JPY を固定する', () => {
    const result = buildUserProfileInput(input({ trackedKpis: ['health_lifespan'] }));
    expect(result).toEqual({
      birthYear: 1990,
      gender: 'male',
      country: 'JP',
      annualIncome: 5_000_000,
      currency: 'JPY',
      trackedKpis: ['health_lifespan'],
    });
  });
});

describe('toggleTrackedKpi (Scenario 5-2)', () => {
  it('未選択の KPI を追加する', () => {
    expect(toggleTrackedKpi(['health_lifespan'], 'earning' as KpiKey)).toEqual([
      'health_lifespan',
      'earning',
    ]);
  });
  it('選択済みの KPI を外す', () => {
    expect(toggleTrackedKpi(['health_lifespan', 'earning'], 'earning' as KpiKey)).toEqual([
      'health_lifespan',
    ]);
  });
});

describe('設定画面が ProfileEditor を配線している (Scenario 5-2)', () => {
  const settings = readSource('src/app/(app)/settings/page.tsx');
  it('ProfileEditor をインポートして描画する', () => {
    expect(settings).toContain('ProfileEditor');
  });
});

describe('ProfileEditor が保存経路を配線している (Scenario 5-2)', () => {
  const src = readSource('src/components/settings/profile-editor.tsx');
  it('buildUserProfileInput で upsert 入力を組み立てる', () => {
    expect(src).toContain('buildUserProfileInput');
  });
  it('生年・性別・収入・KPI 選択の全項目を編集できる', () => {
    expect(src).toContain('birthYear');
    expect(src).toContain('gender');
    expect(src).toContain('annualIncome');
    expect(src).toContain('toggleTrackedKpi');
  });
});

describe('ProfileEditor が保存失敗をハンドリングする (完成度)', () => {
  const src = readSource('src/components/settings/profile-editor.tsx');
  it('保存失敗を catch する（unhandled rejection を防ぐ）', () => {
    expect(src).toContain('catch');
  });
  it('失敗時にエラーメッセージ profileSaveError を表示する', () => {
    expect(src).toContain('profileSaveError');
  });
});

describe('設定画面がプロフィール読み込み中にインジケータを表示する (完成度)', () => {
  const settings = readSource('src/app/(app)/settings/page.tsx');
  it('profileLoading 中にローディング表示（スピナー）を出す', () => {
    expect(settings).toMatch(/profileLoading[\s\S]*animate-spin/);
  });
});

describe('useProfile フックが Supabase 経路を配線している (Scenario 5-2)', () => {
  const src = readSource('src/hooks/useProfile.ts');
  it('fetchUserProfile で読み出す', () => {
    expect(src).toContain('fetchUserProfile');
  });
  it('upsertUserProfile で保存する', () => {
    expect(src).toContain('upsertUserProfile');
  });
});

describe('update RLS ポリシーが migration に存在する (Scenario 5-2)', () => {
  it('user_profiles の update ポリシーが定義されている', () => {
    const mig = readSource('supabase/migrations/20260612010000_user_profiles.sql');
    expect(mig).toContain('for update');
  });
});

// ============================================================
// Scenario 5-3: established の生涯効果が profile で個人化される（AC#14）
// ============================================================

const perDay = {
  healthMinutes: 30,
  positiveMoodMinutes: 0,
  costSaving: 100,
  incomeGain: 0,
};

describe('computeHabitLifetimeEffect の個人化 (Scenario 5-3)', () => {
  it('余命が長いプロフィールほど health_lifespan の生涯効果が大きい', () => {
    // 若い（余命が長い）ユーザー vs 年配（余命が短い）ユーザー
    const young = computeHabitLifetimeEffect(perDay, makeProfile({ birthYear: 2000 }));
    const old = computeHabitLifetimeEffect(perDay, makeProfile({ birthYear: 1950 }));
    expect(young.byKpi.health_lifespan.raw).toBeGreaterThan(old.byKpi.health_lifespan.raw);
  });

  it('プロフィール未設定（null）でもエラーにせず V2 既定値でフォールバックする', () => {
    const fallback = computeHabitLifetimeEffect(perDay, null);
    // V2 既定: 残り寿命40年 → 30分/日 × 40年 × 365日
    expect(fallback.byKpi.health_lifespan.raw).toBe(30 * 40 * 365);
  });
});

describe('ホームが profile を EstablishedSection に接続している (Scenario 5-3)', () => {
  const home = readSource('src/app/(app)/page.tsx');
  it('EstablishedSection に profile を渡す', () => {
    expect(home).toMatch(/EstablishedSection[\s\S]*profile=/);
  });
});

// ============================================================
// メッセージキー（ja/en）
// ============================================================

type Dict = Record<string, unknown>;
const habitsJa = (ja as unknown as { habits: Dict }).habits;
const habitsEn = (en as unknown as { habits: Dict }).habits;
const settingsJa = (ja as unknown as { settings: Dict }).settings;
const settingsEn = (en as unknown as { settings: Dict }).settings;

describe('新規メッセージキーが ja/en に存在する', () => {
  it('tracked KPIs カード見出し', () => {
    expect(typeof habitsJa.trackedKpisTitle).toBe('string');
    expect(typeof habitsEn.trackedKpisTitle).toBe('string');
  });

  it('設定プロフィール編集セクションのラベル一式', () => {
    for (const key of [
      'profile',
      'profileDescription',
      'birthYear',
      'gender',
      'genderMale',
      'genderFemale',
      'genderOther',
      'annualIncome',
      'trackedKpis',
      'saveProfile',
      'profileSaved',
      'profileSaveError',
    ]) {
      expect(typeof settingsJa[key], `ja settings.${key}`).toBe('string');
      expect(typeof settingsEn[key], `en settings.${key}`).toBe('string');
    }
  });
});
