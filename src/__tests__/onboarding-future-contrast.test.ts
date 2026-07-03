import { describe, it, expect } from 'vitest';
import {
  createInitialWizardState,
  setHabitRate,
  buildDiagnosisSelections,
  buildFullPotentialSelections,
  profileInputToUserProfile,
  type WizardState,
} from '@/lib/onboarding';
import { computeDiagnosisV3, type AchievementRate } from '@/lib/diagnosis-v3';
import { KPI_KEYS } from '@/data/kpi/catalog';
import ja from '@/messages/ja.json';
import en from '@/messages/en.json';

type Json = string | number | boolean | null | { [k: string]: Json } | Json[];
function obj(v: Json): Record<string, Json> {
  return v as Record<string, Json>;
}
function str(v: Json): string {
  return v as string;
}

const onbJa = (ja as unknown as { onboarding: Record<string, Json> }).onboarding;
const onbEn = (en as unknown as { onboarding: Record<string, Json> }).onboarding;

function stateWithRates(rates: Record<string, AchievementRate>): WizardState {
  let s = createInitialWizardState();
  for (const [id, rate] of Object.entries(rates)) s = setHabitRate(s, id, rate);
  return s;
}

// ───────── B: 全部100%対比のための達成率=1 selections（受け入れ条件 #7） ─────────
describe('buildFullPotentialSelections（全部100%身についたら）', () => {
  it('回答済み習慣と同じ集合を、全て達成率=1 に置換して返す', () => {
    const state = stateWithRates({
      daily_cardio_habit: 0.3,
      solid_sleep: 0.7,
      eat_vegetables_habit: 0,
    });

    const current = buildDiagnosisSelections(state);
    const full = buildFullPotentialSelections(state);

    // presetId 集合は現在の回答と一致する（習慣を増やさない）
    expect(full.map((s) => s.presetId).sort()).toEqual(current.map((s) => s.presetId).sort());
    // 全 selection の達成率が 1
    expect(full.every((s) => s.rate === 1)).toBe(true);
  });

  it('未回答（rate 未記録）の習慣は含めない', () => {
    const state = stateWithRates({ daily_cardio_habit: 0.3 });
    const full = buildFullPotentialSelections(state);
    expect(full).toHaveLength(1);
    expect(full[0]).toEqual({ presetId: 'daily_cardio_habit', rate: 1 });
  });

  it('100%時の値は diagnosis-v3 に達成率=1 を渡した計算結果と一致する', () => {
    const state = stateWithRates({
      daily_cardio_habit: 0.3,
      solid_sleep: 0.7,
      eat_vegetables_habit: 0,
    });
    const profile = profileInputToUserProfile(state.profile);

    const full = computeDiagnosisV3({
      selections: buildFullPotentialSelections(state),
      profile,
    });
    const expected = computeDiagnosisV3({
      selections: [
        { presetId: 'daily_cardio_habit', rate: 1 },
        { presetId: 'solid_sleep', rate: 1 },
        { presetId: 'eat_vegetables_habit', rate: 1 },
      ],
      profile,
    });

    for (const kpi of KPI_KEYS) {
      expect(full.byKpi[kpi].raw).toBe(expected.byKpi[kpi].raw);
    }
  });

  it('全部100%の値は、現在の達成率での値以上になる（伸びしろ）', () => {
    const state = stateWithRates({
      daily_cardio_habit: 0.3,
      solid_sleep: 0.7,
    });
    const profile = profileInputToUserProfile(state.profile);

    const current = computeDiagnosisV3({ selections: buildDiagnosisSelections(state), profile });
    const full = computeDiagnosisV3({ selections: buildFullPotentialSelections(state), profile });

    for (const kpi of KPI_KEYS) {
      expect(full.byKpi[kpi].raw).toBeGreaterThanOrEqual(current.byKpi[kpi].raw);
    }
  });

  it('全ての回答が既に100%なら、現在値と100%値は一致する', () => {
    const state = stateWithRates({ daily_cardio_habit: 1, solid_sleep: 1 });
    const profile = profileInputToUserProfile(state.profile);

    const current = computeDiagnosisV3({ selections: buildDiagnosisSelections(state), profile });
    const full = computeDiagnosisV3({ selections: buildFullPotentialSelections(state), profile });

    for (const kpi of KPI_KEYS) {
      expect(full.byKpi[kpi].raw).toBe(current.byKpi[kpi].raw);
    }
  });
});

// ───────── B: [4] 結果画面の対比文言（受け入れ条件 #7 / [4]→[5]導線） ─────────
describe('[4] 結果の対比文言（現在ペース vs 全部100%）', () => {
  it('ja: currentLabel / fullLabel が存在し非空', () => {
    const s = obj(onbJa.result);
    expect(str(s.currentLabel).length).toBeGreaterThan(0);
    expect(str(s.fullLabel).length).toBeGreaterThan(0);
  });

  it('en: currentLabel / fullLabel が存在し非空', () => {
    const s = obj(onbEn.result);
    expect(str(s.currentLabel).length).toBeGreaterThan(0);
    expect(str(s.fullLabel).length).toBeGreaterThan(0);
  });

  it('ja: fullLabel は「全部（すべて）100%身についたら」の対比を表す文言', () => {
    const s = obj(onbJa.result);
    expect(str(s.fullLabel)).toContain('100');
  });

  it('[4]→[5] の導線 CTA が「大切にしたいこと（重視）」の選択へ誘導する', () => {
    // [5] は KPI選択（何を充実させたいか）。CTA は習慣選択ではなく KPI選択へ誘導する
    expect(str(obj(onbJa.result).cta)).not.toBe('習慣を選びに進む');
    expect(str(obj(onbJa.result).cta).length).toBeGreaterThan(0);
    expect(str(obj(onbEn.result).cta).length).toBeGreaterThan(0);
  });
});
