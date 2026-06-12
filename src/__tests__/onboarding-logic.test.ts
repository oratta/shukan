import { describe, it, expect } from 'vitest';
import {
  canAdvanceFromKpi,
  validateProfileInput,
  canAdvanceFromProfile,
  canAdvanceFromPresets,
  buildHabitFromPreset,
  presetPerTimeEffectValue,
  createInitialWizardState,
  type OnboardingProfileInput,
} from '@/lib/onboarding';

// --- C-S7: [1] 単一選択・未選択は次へ無効 ---
describe('canAdvanceFromKpi', () => {
  it('KPI未選択では false', () => {
    expect(canAdvanceFromKpi(null)).toBe(false);
  });
  it('KPI選択済みでは true', () => {
    expect(canAdvanceFromKpi('cost_saving')).toBe(true);
  });
});

// --- C-S9: [2] 必須・年収任意・不正値制御 ---
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

  it('年齢が負の値は無効', () => {
    expect(canAdvanceFromProfile({ ...base(), age: -1 })).toBe(false);
  });

  it('年齢が200は無効（上限超過）', () => {
    expect(canAdvanceFromProfile({ ...base(), age: 200 })).toBe(false);
  });

  it('年齢0は無効', () => {
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

  it('有効な入力ではエラーなし（全フィールド undefined）', () => {
    const errors = validateProfileInput(base());
    expect(errors.age).toBeUndefined();
    expect(errors.gender).toBeUndefined();
    expect(errors.country).toBeUndefined();
    expect(errors.annualIncome).toBeUndefined();
  });
});

// --- C-S11: [3] 1つ以上選択でボタン有効 ---
describe('canAdvanceFromPresets', () => {
  it('0枚では false', () => {
    expect(canAdvanceFromPresets([])).toBe(false);
  });
  it('1枚では true', () => {
    expect(canAdvanceFromPresets(['cook_at_home'])).toBe(true);
  });
  it('複数枚でも true', () => {
    expect(canAdvanceFromPresets(['cook_at_home', 'daily_saving_habit'])).toBe(true);
  });
});

// --- C-S16: 途中離脱は最初からやり直し（初期 state は未選択） ---
describe('createInitialWizardState', () => {
  it('step は 1、選択は空、プロフィールは国=JP のみ既定', () => {
    const s = createInitialWizardState();
    expect(s.step).toBe(1);
    expect(s.selectedKpi).toBeNull();
    expect(s.selectedPresetIds).toEqual([]);
    expect(s.profile.country).toBe('JP');
    expect(s.profile.age).toBeNull();
    expect(s.profile.gender).toBeNull();
    expect(s.profile.annualIncome).toBeNull();
  });
});

// --- C-S10: 1回あたりの効果（構造化・ロケール非依存。文言は UI 側で i18n 適用） ---
describe('presetPerTimeEffectValue', () => {
  it('cost_saving は isReduction=true で正の value を返す（文言は含まない）', () => {
    const effect = presetPerTimeEffectValue('cook_at_home', 'cost_saving');
    expect(effect).not.toBeNull();
    expect(effect!.kpi).toBe('cost_saving');
    expect(effect!.value).toBeGreaterThan(0);
    expect(effect!.isReduction).toBe(true);
  });

  it('health_lifespan は isReduction=false で正の value を返す', () => {
    const effect = presetPerTimeEffectValue('daily_cardio_habit', 'health_lifespan');
    expect(effect).not.toBeNull();
    expect(effect!.kpi).toBe('health_lifespan');
    expect(effect!.value).toBeGreaterThan(0);
    expect(effect!.isReduction).toBe(false);
  });

  it('返り値に日本語の単位文字列を含まない（ロケール非依存）', () => {
    const effect = presetPerTimeEffectValue('cook_at_home', 'cost_saving');
    expect(JSON.stringify(effect)).not.toMatch(/[円分]/);
  });

  it('未知プリセットは null', () => {
    expect(presetPerTimeEffectValue('___nope___', 'cost_saving')).toBeNull();
  });
});

// --- C-S13: プリセット→Habit 変換（Discover 採用フローと同じ既定値） ---
describe('buildHabitFromPreset', () => {
  it('positive プリセットは type=positive / frequency=everyday / dailyTarget=1 / weeklyTarget=undefined', () => {
    const habit = buildHabitFromPreset('cook_at_home');
    expect(habit).toBeTruthy();
    expect(habit!.type).toBe('positive');
    expect(habit!.frequency).toBe('everyday');
    expect(habit!.dailyTarget).toBe(1);
    expect(habit!.weeklyTarget).toBeUndefined();
    expect(habit!.customDays).toBeUndefined();
    expect(habit!.impactArticleId).toBeUndefined();
    expect(habit!.evidences).toEqual([]);
    expect(habit!.name).toBe('自炊する');
  });

  it('quit プリセットは type=quit / dailyTarget=3（Discover の quit 既定値）', () => {
    const habit = buildHabitFromPreset('quit_smoking_for_health');
    expect(habit!.type).toBe('quit');
    expect(habit!.dailyTarget).toBe(3);
  });

  it('未知プリセットは null', () => {
    expect(buildHabitFromPreset('___nope___')).toBeNull();
  });
});
