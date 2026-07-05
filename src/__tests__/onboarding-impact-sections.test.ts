import { describe, it, expect } from 'vitest';
import ja from '@/messages/ja.json';
import en from '@/messages/en.json';
import { KPI_CATALOG } from '@/data/kpi/catalog';
import { ONBOARDING_V3_PRESET_IDS } from '@/lib/onboarding';
import { getHabitPreset } from '@/data/habit-presets';
import { getArticle } from '@/data/impact-articles';
import { habitPotentialV3 } from '@/lib/diagnosis-v3';
import { KPI_KEYS } from '@/data/kpi/catalog';

type Json = string | number | boolean | null | { [k: string]: Json } | Json[];
type Onb = Record<string, Json>;

const onbJa = (ja as unknown as { onboarding: Onb }).onboarding;
const onbEn = (en as unknown as { onboarding: Onb }).onboarding;

function obj(v: Json): Record<string, Json> {
  return v as Record<string, Json>;
}
function str(v: Json): string {
  return v as string;
}

// ───────── F4: KPI ごとの説明セクション文言（4KPIぶん・ja/en） ─────────
describe('F4 [4]結果: KPIごとの説明セクション', () => {
  it('ja: 4KPIぶんの説明文（body）が存在し、十分な長さがある', () => {
    const sections = obj(obj(onbJa.result).kpiSections);
    for (const def of KPI_CATALOG) {
      const body = str(obj(sections[def.key]).body);
      expect(body.length, `ja kpiSections.${def.key}.body`).toBeGreaterThan(20);
    }
  });

  it('en: 4KPIぶんの説明文（body）が存在し、十分な長さがある', () => {
    const sections = obj(obj(onbEn.result).kpiSections);
    for (const def of KPI_CATALOG) {
      const body = str(obj(sections[def.key]).body);
      expect(body.length, `en kpiSections.${def.key}.body`).toBeGreaterThan(20);
    }
  });

  it('健康寿命の説明は「健康寿命」と「研究で示され」の枠組みを含む', () => {
    const body = str(obj(obj(obj(onbJa.result).kpiSections).health_lifespan).body);
    expect(body).toContain('健康寿命');
    expect(body).toContain('研究で示されて');
  });

  it('前向きな気持ちの説明は健康・生産性・人間関係との関連に触れる', () => {
    const body = str(obj(obj(obj(onbJa.result).kpiSections).positive_mood).body);
    expect(body).toContain('生産性');
    expect(body).toContain('人間関係');
  });

  it('エビデンス規律: 過剰な断定（「証明されています」「必ず」）を含まない', () => {
    const sections = obj(obj(onbJa.result).kpiSections);
    for (const def of KPI_CATALOG) {
      const body = str(obj(sections[def.key]).body);
      expect(body, `ja kpiSections.${def.key}.body over-claim`).not.toContain('証明されて');
      expect(body, `ja kpiSections.${def.key}.body over-claim`).not.toContain('必ず');
    }
  });

  it('セクション見出し用の summaryLabel / sectionsLead が ja/en に存在', () => {
    for (const onb of [onbJa, onbEn]) {
      const r = obj(onb.result);
      expect(str(r.summaryLabel).length).toBeGreaterThan(0);
      expect(str(r.sectionsLead).length).toBeGreaterThan(0);
      expect(str(r.habitEffectLabel).length).toBeGreaterThan(0);
    }
  });
});

// ───────── F5/F6: [4] 身についている習慣リストのアイコン・インパクト・記事表示の建材 ─────────
describe('F5/F6 [4] 習慣リスト: アイコン・主要KPI・エビデンス記事の解決', () => {
  it('オンボ15習慣すべてが、アイコン・主要KPI・先頭エビデンス記事を解決できる', () => {
    for (const id of ONBOARDING_V3_PRESET_IDS) {
      const preset = getHabitPreset(id);
      expect(preset, `preset ${id}`).toBeDefined();
      // F5: アイコン名と主要KPIがある
      expect(preset!.icon.length, `icon ${id}`).toBeGreaterThan(0);
      expect(preset!.primaryKpis.length, `primaryKpis ${id}`).toBeGreaterThan(0);
      // F6: 先頭エビデンス記事が既存の記事シートで表示できる（getArticle が解決する）
      const articleId = preset!.articleIds[0];
      expect(articleId, `articleId ${id}`).toBeDefined();
      expect(getArticle(articleId), `article ${articleId}`).toBeDefined();
    }
  });

  // F7: リストは主要KPI1つではなく、効果を持つ全KPIの数字を出す
  it('複数KPIに効く習慣は、効果値>0のKPIが複数返る（全KPI表示の建材）', () => {
    // daily_cardio_habit は健康寿命＋前向きの2軸に効く
    const potential = habitPotentialV3('daily_cardio_habit', null);
    const nonZero = KPI_KEYS.filter((k) => potential.byKpi[k].raw > 0);
    expect(nonZero.length).toBeGreaterThan(1);
  });

  it('効果を持たないKPIは raw=0 で表示対象から除外できる', () => {
    // quit_alcohol_habit は cost_saving のみ（health/mood/earning は 0）
    const potential = habitPotentialV3('quit_alcohol_habit', null);
    expect(potential.byKpi.cost_saving.raw).toBeGreaterThan(0);
    const zeroKpis = KPI_KEYS.filter((k) => potential.byKpi[k].raw === 0);
    expect(zeroKpis.length).toBeGreaterThan(0);
  });
});
