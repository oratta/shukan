import { describe, it, expect } from 'vitest';
import {
  validateProfileInput,
  canAdvanceFromProfile,
  canAdvanceFromHabits,
  allHabitPresets,
  buildHabitFromPreset,
  presetPerTimeEffectValue,
  createInitialWizardState,
  toggleEstablished,
  toggleActive,
  setEstablishedYearsAgo,
  isPresetEstablished,
  isPresetActive,
  yearsAgoToEstablishedSince,
  profileInputToUserProfile,
  buildLifetimeImpactInput,
  shouldShowPastBlock,
  DEFAULT_ESTABLISHED_YEARS_AGO,
  type OnboardingProfileInput,
  type WizardState,
} from '@/lib/onboarding';
import { computeLifetimeImpact } from '@/lib/lifetime-impact';
import { HABIT_PRESETS } from '@/data/habit-presets';
import { KPI_KEYS } from '@/data/kpi/catalog';

// ───────── C-S9: [1] プロフィール 必須・年収任意・不正値制御（v1→v2 変更なし） ─────────
describe('validateProfileInput / canAdvanceFromProfile', () => {
  function base(): OnboardingProfileInput {
    return { age: 42, gender: 'male', country: 'JP', annualIncome: null };
  }

  it('年齢・性別・国が揃い年収空欄でも有効', () => {
    expect(canAdvanceFromProfile(base())).toBe(true);
  });
  it('年収を入れても有効', () => {
    expect(canAdvanceFromProfile({ ...base(), annualIncome: 5_000_000 })).toBe(true);
  });
  it('年齢未入力（null）は無効', () => {
    expect(canAdvanceFromProfile({ ...base(), age: null })).toBe(false);
  });
  it('性別未入力（null）は無効', () => {
    expect(canAdvanceFromProfile({ ...base(), gender: null })).toBe(false);
  });
  it('国未入力（空文字）は無効', () => {
    expect(canAdvanceFromProfile({ ...base(), country: '' })).toBe(false);
  });
  it('年齢が範囲外は無効', () => {
    expect(canAdvanceFromProfile({ ...base(), age: -1 })).toBe(false);
    expect(canAdvanceFromProfile({ ...base(), age: 200 })).toBe(false);
    expect(canAdvanceFromProfile({ ...base(), age: 0 })).toBe(false);
  });
  it('年収が負の値は無効', () => {
    expect(canAdvanceFromProfile({ ...base(), annualIncome: -100 })).toBe(false);
  });
  it('validateProfileInput はフィールド別のエラーを返す', () => {
    const errors = validateProfileInput({ age: 300, gender: null, country: '', annualIncome: -5 });
    expect(errors.age).toBeTruthy();
    expect(errors.gender).toBeTruthy();
    expect(errors.country).toBeTruthy();
    expect(errors.annualIncome).toBeTruthy();
  });
});

// ───────── C-S2: [2] セクションB（active）が1つ以上で診断可能（セクションAは任意） ─────────
describe('canAdvanceFromHabits — AC#11', () => {
  it('セクションB が0件では false', () => {
    expect(canAdvanceFromHabits([])).toBe(false);
  });
  it('セクションB が1件で true', () => {
    expect(canAdvanceFromHabits(['cook_at_home'])).toBe(true);
  });
  it('セクションB が複数でも true', () => {
    expect(canAdvanceFromHabits(['cook_at_home', 'daily_saving_habit'])).toBe(true);
  });
});

// ───────── D6: [2] 母集団は全プリセットカタログ（KPI 非依存） ─────────
describe('allHabitPresets — D6', () => {
  it('全プリセットカタログを返す（KPI で絞り込まない）', () => {
    expect(allHabitPresets()).toHaveLength(HABIT_PRESETS.length);
    expect(allHabitPresets().map((p) => p.id)).toEqual(HABIT_PRESETS.map((p) => p.id));
  });
});

// ───────── C-S16: 初期状態（途中離脱は最初[0]からやり直し） ─────────
describe('createInitialWizardState — v2', () => {
  it('step=0、established/active は空、国=JP のみ既定', () => {
    const s = createInitialWizardState();
    expect(s.step).toBe(0);
    expect(s.established).toEqual([]);
    expect(s.activePresetIds).toEqual([]);
    expect(s.profile.country).toBe('JP');
    expect(s.profile.age).toBeNull();
    expect(s.profile.gender).toBeNull();
    expect(s.profile.annualIncome).toBeNull();
  });
});

// ───────── C-S3: セクションA/B の相互排他（D2・二重計上防止） ─────────
describe('toggleEstablished / toggleActive — 相互排他（C-S3）', () => {
  function base(): WizardState {
    return createInitialWizardState();
  }

  it('toggleEstablished で established に追加され、デフォルト年数が入る', () => {
    const s = toggleEstablished(base(), 'quit_drinking');
    expect(isPresetEstablished(s, 'quit_drinking')).toBe(true);
    const sel = s.established.find((e) => e.presetId === 'quit_drinking');
    expect(sel?.yearsAgo).toBe(DEFAULT_ESTABLISHED_YEARS_AGO);
  });

  it('再度 toggleEstablished で established から外れる', () => {
    let s = toggleEstablished(base(), 'quit_drinking');
    s = toggleEstablished(s, 'quit_drinking');
    expect(isPresetEstablished(s, 'quit_drinking')).toBe(false);
  });

  it('active にあるプリセットを established にすると active から外れる（相互排他）', () => {
    let s = toggleActive(base(), 'cook_at_home');
    expect(isPresetActive(s, 'cook_at_home')).toBe(true);
    s = toggleEstablished(s, 'cook_at_home');
    expect(isPresetEstablished(s, 'cook_at_home')).toBe(true);
    expect(isPresetActive(s, 'cook_at_home')).toBe(false);
  });

  it('established にあるプリセットを active にすると established から外れる（逆も同様）', () => {
    let s = toggleEstablished(base(), 'cook_at_home');
    s = toggleActive(s, 'cook_at_home');
    expect(isPresetActive(s, 'cook_at_home')).toBe(true);
    expect(isPresetEstablished(s, 'cook_at_home')).toBe(false);
  });

  it('同一プリセットが established と active の両方に同時に存在しない', () => {
    let s = base();
    s = toggleEstablished(s, 'cook_at_home');
    s = toggleActive(s, 'daily_saving_habit');
    s = toggleActive(s, 'cook_at_home'); // 競合: established→active へ移動
    const inBoth = s.established.some((e) => s.activePresetIds.includes(e.presetId));
    expect(inBoth).toBe(false);
  });
});

// ───────── C-S5: 「いつから」年数の設定と開始日変換 ─────────
describe('setEstablishedYearsAgo / yearsAgoToEstablishedSince — C-S5', () => {
  it('setEstablishedYearsAgo で対象プリセットの年数だけ更新する', () => {
    let s = toggleEstablished(createInitialWizardState(), 'quit_drinking');
    s = setEstablishedYearsAgo(s, 'quit_drinking', 10);
    expect(s.established.find((e) => e.presetId === 'quit_drinking')?.yearsAgo).toBe(10);
  });

  it('yearsAgo=10 は約10年前の YYYY-MM-DD を返す', () => {
    const now = new Date('2026-06-27T00:00:00Z');
    expect(yearsAgoToEstablishedSince(10, now)).toBe('2016-06-27');
  });

  it('yearsAgo=0 は当日', () => {
    const now = new Date('2026-06-27T00:00:00Z');
    expect(yearsAgoToEstablishedSince(0, now)).toBe('2026-06-27');
  });

  it('負の年数は0年にクランプ（当日）', () => {
    const now = new Date('2026-06-27T00:00:00Z');
    expect(yearsAgoToEstablishedSince(-5, now)).toBe('2026-06-27');
  });
});

// ───────── C-S4: 結果ブロック表示判定 + 合算入力組み立て ─────────
describe('buildLifetimeImpactInput / shouldShowPastBlock — C-S4 / AC#12', () => {
  function profile(): OnboardingProfileInput {
    return { age: 40, gender: 'male', country: 'JP', annualIncome: 5_000_000 };
  }

  it('established が0件のとき shouldShowPastBlock=false（過去ブロック非表示）', () => {
    let s = createInitialWizardState();
    s = { ...s, profile: profile() };
    s = toggleActive(s, 'cook_at_home');
    const result = computeLifetimeImpact(buildLifetimeImpactInput(s));
    expect(shouldShowPastBlock(result)).toBe(false);
    expect(result.pastIsEstimated).toBe(false);
  });

  it('established が1件以上のとき shouldShowPastBlock=true（過去ブロック表示）', () => {
    let s = createInitialWizardState();
    s = { ...s, profile: profile() };
    s = toggleActive(s, 'cook_at_home');
    s = toggleEstablished(s, 'quit_drinking');
    s = setEstablishedYearsAgo(s, 'quit_drinking', 10);
    const result = computeLifetimeImpact(buildLifetimeImpactInput(s));
    expect(shouldShowPastBlock(result)).toBe(true);
    expect(result.pastIsEstimated).toBe(true);
  });

  it('buildLifetimeImpactInput は active を future・established を past 母集団に振り分ける', () => {
    let s = createInitialWizardState();
    s = { ...s, profile: profile() };
    s = toggleActive(s, 'cook_at_home');
    s = toggleEstablished(s, 'quit_drinking');
    s = setEstablishedYearsAgo(s, 'quit_drinking', 10);
    const input = buildLifetimeImpactInput(s);
    expect(input.activePresetIds).toEqual(['cook_at_home']);
    expect(input.establishedHabits).toHaveLength(1);
    expect(input.establishedHabits[0].presetId).toBe('quit_drinking');
    expect(input.establishedHabits[0].establishedSince).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(input.profile).not.toBeNull();
  });
});

// ───────── profileInputToUserProfile ─────────
describe('profileInputToUserProfile', () => {
  it('age→birthYear 換算・gender 既定・currency=JPY を埋める', () => {
    const p = profileInputToUserProfile({ age: 40, gender: 'female', country: 'JP', annualIncome: 6_000_000 });
    expect(p.birthYear).toBe(new Date().getFullYear() - 40);
    expect(p.gender).toBe('female');
    expect(p.annualIncome).toBe(6_000_000);
    expect(p.currency).toBe('JPY');
  });
  it('gender 未入力は unspecified にフォールバック', () => {
    const p = profileInputToUserProfile({ age: 40, gender: null, country: 'JP', annualIncome: null });
    expect(p.gender).toBe('unspecified');
  });
});

// ───────── C-S10: 1回あたりの効果（v2 でも継続使用・ロケール非依存） ─────────
describe('presetPerTimeEffectValue', () => {
  it('cost_saving は isReduction=true で正の value', () => {
    const e = presetPerTimeEffectValue('cook_at_home', 'cost_saving');
    expect(e).not.toBeNull();
    expect(e!.value).toBeGreaterThan(0);
    expect(e!.isReduction).toBe(true);
  });
  it('未知プリセットは null', () => {
    expect(presetPerTimeEffectValue('___nope___', 'cost_saving')).toBeNull();
  });
  it('返り値に日本語の単位文字列を含まない', () => {
    const e = presetPerTimeEffectValue('cook_at_home', 'cost_saving');
    expect(JSON.stringify(e)).not.toMatch(/[円分]/);
  });
});

// ───────── C-S13: プリセット→Habit 変換（status/established_since 配線） ─────────
describe('buildHabitFromPreset — status / establishedSince（v2）', () => {
  it('オプション無指定は status 省略（active 既定・後方互換）', () => {
    const h = buildHabitFromPreset('cook_at_home');
    expect(h).toBeTruthy();
    expect(h!.type).toBe('positive');
    expect(h!.frequency).toBe('everyday');
    expect(h!.dailyTarget).toBe(1);
    expect(h!.status).toBeUndefined();
    expect(h!.establishedSince).toBeUndefined();
    expect(h!.name).toBe('自炊する');
  });

  it('established 指定で status=established と establishedSince を運ぶ', () => {
    const h = buildHabitFromPreset('quit_drinking', {
      status: 'established',
      establishedSince: '2016-06-27',
    });
    expect(h!.status).toBe('established');
    expect(h!.establishedSince).toBe('2016-06-27');
  });

  it('quit プリセットは type=quit / dailyTarget=3', () => {
    const h = buildHabitFromPreset('quit_smoking_for_health');
    expect(h!.type).toBe('quit');
    expect(h!.dailyTarget).toBe(3);
  });

  it('未知プリセットは null', () => {
    expect(buildHabitFromPreset('___nope___')).toBeNull();
  });
});

// ───────── D5: trackedKpis は4軸すべて（参照固定） ─────────
describe('KPI_KEYS — D5 全4軸', () => {
  it('4軸ある', () => {
    expect(KPI_KEYS).toHaveLength(4);
  });
});
