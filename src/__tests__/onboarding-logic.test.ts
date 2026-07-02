import { describe, it, expect } from 'vitest';
import {
  validateProfileInput,
  canAdvanceFromProfile,
  allHabitPresets,
  onboardingV3Presets,
  ONBOARDING_V3_PRESET_IDS,
  ACHIEVEMENT_RATE_DISPLAY_ORDER,
  BINARY_ACHIEVEMENT_PRESET_IDS,
  availableAchievementRates,
  isAchievementRateAvailable,
  setHabitRate,
  getHabitRate,
  tapHabitRate,
  completeHabitAdvance,
  backInHabits,
  buildDiagnosisSelections,
  buildHabitFromPreset,
  presetPerTimeEffectValue,
  chooseFocusKpi,
  toggleChosenPreset,
  createInitialWizardState,
  profileInputToUserProfile,
  type OnboardingProfileInput,
  type WizardState,
} from '@/lib/onboarding';
import { HABIT_PRESETS, getHabitPreset } from '@/data/habit-presets';
import { KPI_KEYS } from '@/data/kpi/catalog';

// 残置7プリセット（v3 診断には出さない）
const RESIDUAL_PRESET_IDS = [
  'daily_saving_habit',
  'stop_impulse_buying',
  'cook_at_home',
  'deep_focus_work',
  'morning_routine',
  'cut_digital_distraction',
  'keep_learning',
];

// ───────── C-S9: [1] プロフィール 必須・年収任意・不正値制御 ─────────
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

// ───────── AC#5: [2] は精査済み15習慣のみ（残置7プリセットは非表示） ─────────
describe('ONBOARDING_V3_PRESET_IDS / onboardingV3Presets — AC#5', () => {
  it('ちょうど15本を提示する', () => {
    expect(ONBOARDING_V3_PRESET_IDS).toHaveLength(15);
    expect(onboardingV3Presets()).toHaveLength(15);
  });

  it('全てのIDが実在するプリセットに解決できる', () => {
    for (const id of ONBOARDING_V3_PRESET_IDS) {
      expect(getHabitPreset(id)).toBeTruthy();
    }
  });

  it('残置7プリセットは1本も含まれない', () => {
    for (const id of RESIDUAL_PRESET_IDS) {
      expect(ONBOARDING_V3_PRESET_IDS).not.toContain(id);
    }
    const ids = onboardingV3Presets().map((p) => p.id);
    for (const id of RESIDUAL_PRESET_IDS) {
      expect(ids).not.toContain(id);
    }
  });

  it('残置7プリセットが定義自体は存在する（カタログを壊していない）', () => {
    for (const id of RESIDUAL_PRESET_IDS) {
      expect(getHabitPreset(id)).toBeTruthy();
    }
    expect(HABIT_PRESETS.length).toBe(15 + RESIDUAL_PRESET_IDS.length);
  });

  it('allHabitPresets は v3 の15本を返す（互換名）', () => {
    expect(allHabitPresets().map((p) => p.id)).toEqual([...ONBOARDING_V3_PRESET_IDS]);
  });
});

// ───────── AC#13: 15本の articleIds が互いに重複しない（同一エビデンス二重計上なし） ─────────
describe('15習慣の articleId 重複なし — AC#13', () => {
  it('15本が参照する全 articleId に重複がない', () => {
    const allArticleIds = onboardingV3Presets().flatMap((p) => p.articleIds);
    const unique = new Set(allArticleIds);
    expect(unique.size).toBe(allArticleIds.length);
  });
});

// ───────── C-S16: 初期状態（途中離脱は最初[0]からやり直し） ─────────
describe('createInitialWizardState — v3', () => {
  it('step=0、rates は空、habitIndex=0、KPI・チェックは未選択、国=JP のみ既定', () => {
    const s = createInitialWizardState();
    expect(s.step).toBe(0);
    expect(s.rates).toEqual({});
    expect(s.habitIndex).toBe(0);
    expect(s.focusKpi).toBeNull();
    expect(s.chosenPresetIds).toEqual([]);
    expect(s.profile.country).toBe('JP');
    expect(s.profile.age).toBeNull();
    expect(s.profile.gender).toBeNull();
    expect(s.profile.annualIncome).toBeNull();
  });
});

// ───────── AC#6: 4択タップで達成率を記録し、再選択で上書きできる ─────────
describe('setHabitRate / getHabitRate — AC#6', () => {
  it('達成率を記録できる', () => {
    let s = createInitialWizardState();
    s = setHabitRate(s, 'daily_cardio_habit', 0.7);
    expect(getHabitRate(s, 'daily_cardio_habit')).toBe(0.7);
  });

  it('再選択で達成率を上書きできる（戻って選び直し）', () => {
    let s = createInitialWizardState();
    s = setHabitRate(s, 'daily_cardio_habit', 0.3);
    s = setHabitRate(s, 'daily_cardio_habit', 1);
    expect(getHabitRate(s, 'daily_cardio_habit')).toBe(1);
  });

  it('未回答は undefined', () => {
    const s = createInitialWizardState();
    expect(getHabitRate(s, 'daily_cardio_habit')).toBeUndefined();
  });

  it('複数習慣を独立に記録する', () => {
    let s = createInitialWizardState();
    s = setHabitRate(s, 'daily_cardio_habit', 1);
    s = setHabitRate(s, 'solid_sleep', 0.3);
    expect(getHabitRate(s, 'daily_cardio_habit')).toBe(1);
    expect(getHabitRate(s, 'solid_sleep')).toBe(0.3);
  });

  it('無効な達成率（二択習慣の30%）は記録されない', () => {
    let s = createInitialWizardState();
    s = setHabitRate(s, 'quit_smoking_for_health', 0.3);
    expect(getHabitRate(s, 'quit_smoking_for_health')).toBeUndefined();
  });
});

// ───────── AC#6: タップ遷移の連打ガード（tapHabitRate / completeHabitAdvance / backInHabits） ─────────
describe('tapHabitRate / completeHabitAdvance / backInHabits — 連打ガード', () => {
  /** [2] で habitIndex 番目の習慣を表示している状態を作る。 */
  function atHabit(index: number): WizardState {
    return { ...createInitialWizardState(), step: 2, habitIndex: index };
  }

  it('タップで達成率を記録し advancing=true（余韻）に入る', () => {
    const s = tapHabitRate(atHabit(0), ONBOARDING_V3_PRESET_IDS[0], 0.7);
    expect(getHabitRate(s, ONBOARDING_V3_PRESET_IDS[0])).toBe(0.7);
    expect(s.advancing).toBe(true);
    expect(s.habitIndex).toBe(0); // 進むのはタイマー満了（completeHabitAdvance）
  });

  it('余韻中の再タップは無視される（習慣の無回答スキップを防ぐ）', () => {
    const first = tapHabitRate(atHabit(0), ONBOARDING_V3_PRESET_IDS[0], 1);
    const second = tapHabitRate(first, ONBOARDING_V3_PRESET_IDS[0], 0);
    expect(second).toBe(first); // 状態不変（0 で上書きされない）
    expect(getHabitRate(second, ONBOARDING_V3_PRESET_IDS[0])).toBe(1);
  });

  it('completeHabitAdvance で次の習慣へ進み advancing が解除される', () => {
    const tapped = tapHabitRate(atHabit(0), ONBOARDING_V3_PRESET_IDS[0], 0.3);
    const s = completeHabitAdvance(tapped);
    expect(s.habitIndex).toBe(1);
    expect(s.advancing).toBe(false);
    expect(s.step).toBe(2);
  });

  it('余韻中でなければ completeHabitAdvance は no-op（連打で余分に発火したタイマー対策）', () => {
    const tapped = tapHabitRate(atHabit(0), ONBOARDING_V3_PRESET_IDS[0], 1);
    const advanced = completeHabitAdvance(tapped);
    const again = completeHabitAdvance(advanced); // 2本目のタイマー発火を模擬
    expect(again).toBe(advanced); // 二重に進まない
    expect(again.habitIndex).toBe(1);
  });

  it('連打しても習慣は1つずつしか進まない（タップ2回＋タイマー2回発火の通し）', () => {
    let s = atHabit(0);
    s = tapHabitRate(s, ONBOARDING_V3_PRESET_IDS[0], 1); // 1回目タップ
    s = tapHabitRate(s, ONBOARDING_V3_PRESET_IDS[0], 0); // 連打（無視される）
    s = completeHabitAdvance(s); // 1本目のタイマー
    s = completeHabitAdvance(s); // 2本目のタイマー（no-op）
    expect(s.habitIndex).toBe(1);
    expect(getHabitRate(s, ONBOARDING_V3_PRESET_IDS[0])).toBe(1);
  });

  it('最後の習慣で completeHabitAdvance すると [3] 計算中へ進む', () => {
    const last = ONBOARDING_V3_PRESET_IDS.length - 1;
    const tapped = tapHabitRate(atHabit(last), ONBOARDING_V3_PRESET_IDS[last], 0);
    const s = completeHabitAdvance(tapped);
    expect(s.step).toBe(3);
    expect(s.advancing).toBe(false);
  });

  it('無効な達成率のタップは記録も遷移もしない（二択習慣の30%）', () => {
    const s0 = atHabit(0);
    const s = tapHabitRate(s0, 'quit_smoking_for_health', 0.3);
    expect(s).toBe(s0);
    expect(s.advancing).toBe(false);
  });

  it('backInHabits で前の習慣へ戻り、先頭では [1] プロフィールへ戻る', () => {
    expect(backInHabits(atHabit(3)).habitIndex).toBe(2);
    const s = backInHabits(atHabit(0));
    expect(s.step).toBe(1);
    expect(s.habitIndex).toBe(0);
  });

  it('余韻中の backInHabits は無視される（進む/戻るの競合防止）', () => {
    const tapped = tapHabitRate(atHabit(3), ONBOARDING_V3_PRESET_IDS[3], 0.7);
    expect(backInHabits(tapped)).toBe(tapped);
  });

  it('初期状態は advancing=false', () => {
    expect(createInitialWizardState().advancing).toBe(false);
  });
});

// ───────── 段階タップ4択・二択習慣の無効化 ─────────
describe('availableAchievementRates — 4択・二択の無効化', () => {
  it('通常の習慣は 4択すべて（降順 100/70/30/0）', () => {
    expect(availableAchievementRates('daily_cardio_habit')).toEqual([1, 0.7, 0.3, 0]);
  });

  it('タバコは 100%/0% の二択（30%/70% を無効化）', () => {
    expect(availableAchievementRates('quit_smoking_for_health')).toEqual([1, 0]);
    expect(BINARY_ACHIEVEMENT_PRESET_IDS.has('quit_smoking_for_health')).toBe(true);
  });

  it('表示順の定数は 100/70/30/0', () => {
    expect(ACHIEVEMENT_RATE_DISPLAY_ORDER).toEqual([1, 0.7, 0.3, 0]);
  });

  it('isAchievementRateAvailable: タバコの30%/70%は不可、100%/0%は可', () => {
    expect(isAchievementRateAvailable('quit_smoking_for_health', 0.3)).toBe(false);
    expect(isAchievementRateAvailable('quit_smoking_for_health', 0.7)).toBe(false);
    expect(isAchievementRateAvailable('quit_smoking_for_health', 1)).toBe(true);
    expect(isAchievementRateAvailable('quit_smoking_for_health', 0)).toBe(true);
    expect(isAchievementRateAvailable('daily_cardio_habit', 0.3)).toBe(true);
  });
});

// ───────── buildDiagnosisSelections（回答済みだけを集計対象に） ─────────
describe('buildDiagnosisSelections', () => {
  it('回答済みプリセットだけを表示順で返す', () => {
    let s = createInitialWizardState();
    s = setHabitRate(s, 'solid_sleep', 0.7);
    s = setHabitRate(s, 'daily_cardio_habit', 1);
    const sels = buildDiagnosisSelections(s);
    // 表示順（cardio が先）
    expect(sels).toEqual([
      { presetId: 'daily_cardio_habit', rate: 1 },
      { presetId: 'solid_sleep', rate: 0.7 },
    ]);
  });

  it('0% の回答も含める（集計上は0だが「回答済み」）', () => {
    let s = createInitialWizardState();
    s = setHabitRate(s, 'daily_cardio_habit', 0);
    expect(buildDiagnosisSelections(s)).toEqual([{ presetId: 'daily_cardio_habit', rate: 0 }]);
  });

  it('未回答は含めない', () => {
    const s = createInitialWizardState();
    expect(buildDiagnosisSelections(s)).toEqual([]);
  });
});

// ───────── [5] KPI選択 / [6] 習慣選択（完了フロー刷新・2026-07-02） ─────────
describe('chooseFocusKpi / toggleChosenPreset', () => {
  it('KPI を選ぶと focusKpi が入り [6] へ進む', () => {
    const s = chooseFocusKpi({ ...createInitialWizardState(), step: 5 }, 'health_lifespan');
    expect(s.focusKpi).toBe('health_lifespan');
    expect(s.step).toBe(6);
    expect(s.chosenPresetIds).toEqual([]);
  });

  it('KPI を選び直すとチェック済み習慣はリセットされる（候補が変わるため）', () => {
    let s = chooseFocusKpi({ ...createInitialWizardState(), step: 5 }, 'health_lifespan');
    s = toggleChosenPreset(s, 'daily_cardio_habit');
    expect(s.chosenPresetIds).toEqual(['daily_cardio_habit']);
    s = chooseFocusKpi({ ...s, step: 5 }, 'earning');
    expect(s.focusKpi).toBe('earning');
    expect(s.chosenPresetIds).toEqual([]);
  });

  it('toggleChosenPreset はチェックのオン/オフを切り替える', () => {
    let s = createInitialWizardState();
    s = toggleChosenPreset(s, 'solid_sleep');
    s = toggleChosenPreset(s, 'daily_cardio_habit');
    expect(s.chosenPresetIds).toEqual(['solid_sleep', 'daily_cardio_habit']);
    s = toggleChosenPreset(s, 'solid_sleep');
    expect(s.chosenPresetIds).toEqual(['daily_cardio_habit']);
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

// ───────── C-S10: 1回あたりの効果（診断計算の建材・ロケール非依存） ─────────
describe('presetPerTimeEffectValue', () => {
  it('cost_saving は isReduction=true で正の value', () => {
    const e = presetPerTimeEffectValue('quit_alcohol_habit', 'cost_saving');
    expect(e).not.toBeNull();
    expect(e!.value).toBeGreaterThan(0);
    expect(e!.isReduction).toBe(true);
  });
  it('未知プリセットは null', () => {
    expect(presetPerTimeEffectValue('___nope___', 'cost_saving')).toBeNull();
  });
  it('返り値に日本語の単位文字列を含まない', () => {
    const e = presetPerTimeEffectValue('quit_alcohol_habit', 'cost_saving');
    expect(JSON.stringify(e)).not.toMatch(/[円分]/);
  });
});

// ───────── プリセット→Habit 変換（常に active 既定・established_since は書かない） ─────────
describe('buildHabitFromPreset', () => {
  it('status は常に省略（active 既定）・established_since も書かない', () => {
    const h = buildHabitFromPreset('daily_cardio_habit');
    expect(h).toBeTruthy();
    expect(h!.type).toBe('positive');
    expect(h!.frequency).toBe('everyday');
    expect(h!.dailyTarget).toBe(1);
    expect(h!.status).toBeUndefined();
    expect(h!.establishedSince).toBeUndefined();
    expect(h!.name).toBe('少し息が切れるくらいの運動を毎日15分以上行う');
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
