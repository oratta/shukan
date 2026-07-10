import { describe, it, expect } from 'vitest';
import ja from '@/messages/ja.json';
import en from '@/messages/en.json';

// change-1: kpi-label-unification
//
// KPI 正式名は「健康寿命」「出費削減」「増える収入」「前向きな気持ちの時間」のみ。
// 旧名・言い換え・造語（「コスト削減」「収入増加」等）を UI 文言・ラベル定義に残さない。
// 英語 KPI 名の正準は onboarding.kpi.*.name 側とし、impact.* をそれに合わせる。
// 記事本文プローズ（src/data/impact-articles/）は置換対象外なのでここでは検証しない。

type Json = string | number | boolean | null | { [k: string]: Json } | Json[];
const impactJa = (ja as unknown as { impact: Record<string, Json> }).impact;
const impactEn = (en as unknown as { impact: Record<string, Json> }).impact;
const evidenceJa = (ja as unknown as { evidence: Record<string, Json> }).evidence;
const kpiEn = (en as unknown as { onboarding: { kpi: Record<string, { name: string }> } })
  .onboarding.kpi;

describe('ja impact ラベルの正式名統一', () => {
  it('impact.dailyCost は「出費削減」', () => {
    expect(impactJa.dailyCost).toBe('出費削減');
  });
  it('impact.dailyIncome は「増える収入」', () => {
    expect(impactJa.dailyIncome).toBe('増える収入');
  });
  it('impact.dailyHealth は「健康寿命」', () => {
    expect(impactJa.dailyHealth).toBe('健康寿命');
  });
  it('旧ラベル「コスト削減」「収入増加」が impact ラベル定義に残っていない', () => {
    const values = Object.values(impactJa).filter((v): v is string => typeof v === 'string');
    for (const v of values) {
      expect(v).not.toContain('コスト削減');
      expect(v).not.toContain('収入増加');
    }
  });
});

describe('ja evidence 算出根拠ラベルの正式名統一', () => {
  it('evidence.feedbackCost は「出費削減の算出根拠」', () => {
    expect(evidenceJa.feedbackCost).toBe('出費削減の算出根拠');
  });
  it('evidence.feedbackIncome は「増える収入の算出根拠」', () => {
    expect(evidenceJa.feedbackIncome).toBe('増える収入の算出根拠');
  });
  it('旧ラベル「コスト削減」「収入増加」が evidence ラベル定義に残っていない', () => {
    const values = Object.values(evidenceJa).filter((v): v is string => typeof v === 'string');
    for (const v of values) {
      expect(v).not.toContain('コスト削減');
      expect(v).not.toContain('収入増加');
    }
  });
});

describe('ja impact.fiveDaysImpact の日本語化', () => {
  it('英語（ASCII 英字）が残存しない', () => {
    expect(impactJa.fiveDaysImpact).not.toMatch(/[A-Za-z]/);
  });
  it('非空の文字列である', () => {
    expect(typeof impactJa.fiveDaysImpact).toBe('string');
    expect((impactJa.fiveDaysImpact as string).length).toBeGreaterThan(0);
  });
});

describe('en impact.* の KPI 英語名が正準 onboarding.kpi.*.name と一致', () => {
  it('dailyHealth === onboarding.kpi.health_lifespan.name（Healthy lifespan）', () => {
    expect(impactEn.dailyHealth).toBe(kpiEn.health_lifespan.name);
    expect(impactEn.dailyHealth).toBe('Healthy lifespan');
  });
  it('dailyCost === onboarding.kpi.cost_saving.name（Cost saving）', () => {
    expect(impactEn.dailyCost).toBe(kpiEn.cost_saving.name);
    expect(impactEn.dailyCost).toBe('Cost saving');
  });
  it('dailyIncome === onboarding.kpi.earning.name（Income Growth）', () => {
    expect(impactEn.dailyIncome).toBe(kpiEn.earning.name);
    expect(impactEn.dailyIncome).toBe('Income Growth');
  });
  it('旧英語ラベル（Cost Savings / Income Gain / Health）が残っていない', () => {
    expect(impactEn.dailyCost).not.toBe('Cost Savings');
    expect(impactEn.dailyIncome).not.toBe('Income Gain');
    expect(impactEn.dailyHealth).not.toBe('Health');
  });
});

describe('LP ImpactAxes コピーの KPI 名統一', () => {
  // LP リニューアル（#53）で旧 Process.tsx / Detail.tsx の alt 文言は廃止され、
  // KPI 名は marketing.impact.axes（ja/en）のコピーに集約された。ここではその
  // ImpactAxes コピーが正式 KPI 名を使い、旧軸名を残していないことを検証する。
  const oldAxisTokens = ['生涯コスト', '可処分時間', '集中時間'];
  const canonical = ['健康寿命', '出費削減', '増える収入', '前向きな気持ちの時間'];

  const marketingJa = (ja as unknown as {
    marketing: { impact: { axes: Array<{ label: string; desc: string }>; note: string } };
  }).marketing;
  const axisLabels = marketingJa.impact.axes.map((a) => a.label);
  const impactBlob = JSON.stringify(marketingJa.impact);

  it('ImpactAxes の軸ラベルに4つの正式 KPI 名が含まれる', () => {
    for (const t of canonical) expect(axisLabels).toContain(t);
  });
  it('ImpactAxes コピーに旧軸名が残っていない', () => {
    for (const t of oldAxisTokens) expect(impactBlob).not.toContain(t);
  });
});
