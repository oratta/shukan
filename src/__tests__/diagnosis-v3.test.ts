import { describe, it, expect } from 'vitest';
import {
  ACHIEVEMENT_RATES,
  DAYS_PER_YEAR,
  MINUTES_PER_DAY,
  YEN_PER_MAN,
  kpiRawValue,
  formatKpiValue,
  computeDiagnosisV3,
  habitPotentialV3,
  rankPresetsByGrowth,
  type AchievementRate,
} from '@/lib/diagnosis-v3';
import { WORKING_DAYS_PER_YEAR, type DerivedProfileValues } from '@/lib/profile';
import type { KpiKey } from '@/data/kpi/catalog';

// プロト（onboarding-step2-proto.html）のサンプルプロフィール（40歳・寿命90＝残り50年・就業240日/年）
function derivedSample(remainingLifeExpectancy = 50): DerivedProfileValues {
  return {
    age: 40,
    remainingLifeExpectancy,
    dailyWage: 62_500,
    remainingWorkingYears: 25,
  };
}

describe('定数', () => {
  it('達成率は 0 / 0.3 / 0.7 / 1 の4択', () => {
    expect(ACHIEVEMENT_RATES).toEqual([0, 0.3, 0.7, 1]);
  });
  it('単位換算定数', () => {
    expect(DAYS_PER_YEAR).toBe(365);
    expect(MINUTES_PER_DAY).toBe(1440);
    expect(YEN_PER_MAN).toBe(10_000);
    // v3 の金額 KPI は「1年ぶんの就労日」で年額化する（生涯累計ではない）
    expect(WORKING_DAYS_PER_YEAR).toBe(240);
  });
});

// AC#7: per-day効果 × 達成率 × horizon（KPI別）。未来のみ・過去項なし。
describe('kpiRawValue（未来のみ・KPI別 horizon）', () => {
  const derived = derivedSample(50);

  it('health_lifespan = per-day × 残り寿命年 × 365 × 達成率（分の累計）', () => {
    // タバコ per-day=288, rate=1 → 288 × 50 × 365 = 5,256,000 分
    expect(kpiRawValue('health_lifespan', 288, 1, derived)).toBe(5_256_000);
  });

  it('positive_mood = per-day × 達成率（horizon 無し・分/日）', () => {
    expect(kpiRawValue('positive_mood', 72, 1, derived)).toBe(72);
    expect(kpiRawValue('positive_mood', 72, 0.5, derived)).toBe(36);
  });

  it('cost_saving = per-day × 240（就労日/年）× 達成率（円/年）', () => {
    // タバコ per-day=1240, rate=1 → 1240 × 240 = 297,600 円/年
    expect(kpiRawValue('cost_saving', 1240, 1, derived)).toBe(297_600);
  });

  it('earning = per-day × 240 × 達成率（円/年）', () => {
    // タバコ per-day=5690, rate=1 → 5690 × 240 = 1,365,600 円/年
    expect(kpiRawValue('earning', 5690, 1, derived)).toBe(1_365_600);
  });

  it('達成率 0 は全 KPI で 0', () => {
    for (const kpi of ['health_lifespan', 'positive_mood', 'cost_saving', 'earning'] as KpiKey[]) {
      expect(kpiRawValue(kpi, 1000, 0, derived)).toBe(0);
    }
  });

  it('健康は残り寿命年に依存する（プロフィール反映）', () => {
    // 残り40年（V2デフォルト）だと 288 × 40 × 365 = 4,204,800
    expect(kpiRawValue('health_lifespan', 288, 1, derivedSample(40))).toBe(4_204_800);
  });
});

// 表示単位: 健康=生涯年(小数1桁) / 前向き=分/日 / 出費削減・増える収入=万円/年
describe('formatKpiValue（表示単位・四捨五入）', () => {
  it('health_lifespan: 365日以上は「年」小数1桁', () => {
    // 5,256,000 分 = 3650 日 = 10.0 年（プロトのタバコ例）
    expect(formatKpiValue('health_lifespan', 5_256_000)).toEqual({ display: '10.0', unit: '年' });
    // 7.0年（達成率0.7相当）
    expect(formatKpiValue('health_lifespan', 3_679_200)).toEqual({ display: '7.0', unit: '年' });
  });

  it('health_lifespan: ちょうど365日は 1.0 年', () => {
    // 525,600 分 = 365 日 = 1.0 年
    expect(formatKpiValue('health_lifespan', 525_600)).toEqual({ display: '1.0', unit: '年' });
  });

  it('health_lifespan: 365日未満は「日」（四捨五入）', () => {
    // 524,160 分 = 364 日
    expect(formatKpiValue('health_lifespan', 524_160)).toEqual({ display: '364', unit: '日' });
    // 0 分 = 0 日
    expect(formatKpiValue('health_lifespan', 0)).toEqual({ display: '0', unit: '日' });
  });

  it('positive_mood: 分/日（四捨五入・桁区切り）', () => {
    expect(formatKpiValue('positive_mood', 72)).toEqual({ display: '72', unit: '分/日' });
    expect(formatKpiValue('positive_mood', 36.4)).toEqual({ display: '36', unit: '分/日' });
    expect(formatKpiValue('positive_mood', 0)).toEqual({ display: '0', unit: '分/日' });
  });

  it('cost_saving / earning: 万円/年（円→万円・四捨五入）', () => {
    // 297,600 円 → 29.76 万円 → 30 万円/年
    expect(formatKpiValue('cost_saving', 297_600)).toEqual({ display: '30', unit: '万円/年' });
    // 1,365,600 円 → 136.56 万円 → 137 万円/年
    expect(formatKpiValue('earning', 1_365_600)).toEqual({ display: '137', unit: '万円/年' });
    // 桁区切り: 12,345,678 円 → 1234.56 万円 → 1,235 万円/年
    expect(formatKpiValue('earning', 12_345_678)).toEqual({ display: '1,235', unit: '万円/年' });
    expect(formatKpiValue('cost_saving', 0)).toEqual({ display: '0', unit: '万円/年' });
  });
});

describe('computeDiagnosisV3（プリセット×達成率の集計・未来のみ）', () => {
  it('タバコ 100%（V2デフォルトプロフィール=残り寿命40年）', () => {
    const result = computeDiagnosisV3({
      selections: [{ presetId: 'quit_smoking_for_health', rate: 1 }],
      profile: null,
    });
    // health: 288 × 40 × 365 = 4,204,800 分 = 2920 日 = 8.0 年
    expect(result.byKpi.health_lifespan).toEqual({ raw: 4_204_800, display: '8.0', unit: '年' });
    // mood: タバコの per-day mood=0
    expect(result.byKpi.positive_mood).toEqual({ raw: 0, display: '0', unit: '分/日' });
    // cost: 1240 × 240 = 297,600 → 30 万円/年
    expect(result.byKpi.cost_saving).toEqual({ raw: 297_600, display: '30', unit: '万円/年' });
    // earn: 5690 × 240 = 1,365,600 → 137 万円/年
    expect(result.byKpi.earning).toEqual({ raw: 1_365_600, display: '137', unit: '万円/年' });
  });

  it('達成率で線形にスケールする（30%）', () => {
    const full = computeDiagnosisV3({
      selections: [{ presetId: 'quit_smoking_for_health', rate: 1 }],
      profile: null,
    });
    const partial = computeDiagnosisV3({
      selections: [{ presetId: 'quit_smoking_for_health', rate: 0.3 }],
      profile: null,
    });
    expect(partial.byKpi.earning.raw).toBeCloseTo(full.byKpi.earning.raw * 0.3, 5);
    // 1,365,600 × 0.3 = 409,680 → 40.968 万円 → 41 万円/年
    expect(partial.byKpi.earning.display).toBe('41');
  });

  it('複数習慣は KPI ごとに加算される', () => {
    const result = computeDiagnosisV3({
      selections: [
        { presetId: 'quit_smoking_for_health', rate: 1 },
        { presetId: 'daily_cardio_habit', rate: 1 },
      ],
      profile: null,
    });
    // cost: タバコ1240 + 運動350 = 1590 → ×240 = 381,600 円 → 38.16 → 38 万円/年
    expect(result.byKpi.cost_saving.raw).toBe(381_600);
    expect(result.byKpi.cost_saving.display).toBe('38');
    // mood: タバコ0 + 運動72 = 72 分/日
    expect(result.byKpi.positive_mood.raw).toBe(72);
  });

  it('全習慣 0% は全 KPI ゼロ表示（エラーにしない）', () => {
    const result = computeDiagnosisV3({
      selections: [
        { presetId: 'quit_smoking_for_health', rate: 0 },
        { presetId: 'daily_cardio_habit', rate: 0 },
      ],
      profile: null,
    });
    expect(result.byKpi.health_lifespan).toEqual({ raw: 0, display: '0', unit: '日' });
    expect(result.byKpi.positive_mood).toEqual({ raw: 0, display: '0', unit: '分/日' });
    expect(result.byKpi.cost_saving).toEqual({ raw: 0, display: '0', unit: '万円/年' });
    expect(result.byKpi.earning).toEqual({ raw: 0, display: '0', unit: '万円/年' });
  });

  it('選択なしでも全 KPI ゼロ', () => {
    const result = computeDiagnosisV3({ selections: [], profile: null });
    expect(result.byKpi.earning.raw).toBe(0);
  });

  it('未知プリセットは 0 として扱う', () => {
    const result = computeDiagnosisV3({
      selections: [{ presetId: 'nonexistent_preset', rate: 1 }],
      profile: null,
    });
    expect(result.byKpi.health_lifespan.raw).toBe(0);
    expect(result.byKpi.earning.raw).toBe(0);
  });
});

describe('habitPotentialV3（習慣単体の生涯ポテンシャル・達成率100%）', () => {
  it('その習慣を 100% やったときの4KPI値（computeDiagnosisV3 の rate=1 と一致）', () => {
    const potential = habitPotentialV3('quit_smoking_for_health', null);
    const viaCompute = computeDiagnosisV3({
      selections: [{ presetId: 'quit_smoking_for_health', rate: 1 }],
      profile: null,
    });
    expect(potential.byKpi).toEqual(viaCompute.byKpi);
    expect(potential.byKpi.earning.display).toBe('137');
  });
});

// ───────── [6] 習慣選択: 伸びしろランキング ─────────
describe('rankPresetsByGrowth（伸びしろ = (1-達成率) × 100%ポテンシャル）', () => {
  it('達成率100% の習慣は候補から除外される', () => {
    const ranked = rankPresetsByGrowth('health_lifespan', { quit_smoking_for_health: 1 }, null);
    expect(ranked.map((c) => c.presetId)).not.toContain('quit_smoking_for_health');
  });

  it('その KPI に効果のない習慣は除外される（例: 前向きに効かないタバコ）', () => {
    // タバコは positive_mood の per-day 効果を持たない（[2] の個別インパクトで "—" 表示）
    expect(habitPotentialV3('quit_smoking_for_health', null).byKpi.positive_mood.raw).toBe(0);
    const ranked = rankPresetsByGrowth('positive_mood', {}, null, 15);
    expect(ranked.map((c) => c.presetId)).not.toContain('quit_smoking_for_health');
  });

  it('伸びしろの大きい順に並び、既定で最大5件を返す', () => {
    const ranked = rankPresetsByGrowth('health_lifespan', {}, null);
    expect(ranked.length).toBe(5);
    for (let i = 1; i < ranked.length; i++) {
      expect(ranked[i - 1].growth.raw).toBeGreaterThanOrEqual(ranked[i].growth.raw);
    }
  });

  it('全て未回答（0% 扱い）なら伸びしろ = 100%ポテンシャルに一致する', () => {
    const ranked = rankPresetsByGrowth('earning', {}, null, 1);
    expect(ranked[0].rate).toBe(0);
    expect(ranked[0].growth.raw).toBe(
      habitPotentialV3(ranked[0].presetId, null).byKpi.earning.raw
    );
  });

  it('達成率が上がるほど伸びしろが減る（70%達成済みなら残り3割）', () => {
    const top = rankPresetsByGrowth('health_lifespan', {}, null, 1)[0];
    const ranked = rankPresetsByGrowth('health_lifespan', { [top.presetId]: 0.7 }, null, 15);
    const demoted = ranked.find((c) => c.presetId === top.presetId);
    expect(demoted).toBeTruthy();
    expect(demoted!.rate).toBe(0.7);
    expect(demoted!.growth.raw).toBeCloseTo(top.growth.raw * 0.3, 6);
  });

  it('growth は新表示単位で整形される（earning は万円/年）', () => {
    const ranked = rankPresetsByGrowth('earning', {}, null, 1);
    expect(ranked[0].growth.unit).toBe('万円/年');
  });
});

// 型の健全性（コンパイル時チェックの意図をテストにも残す）
describe('AchievementRate 型', () => {
  it('4値のみ許容（値域チェック）', () => {
    const rates: AchievementRate[] = [0, 0.3, 0.7, 1];
    expect(rates).toHaveLength(4);
  });
});
