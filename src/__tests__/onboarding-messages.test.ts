import { describe, it, expect } from 'vitest';
import ja from '@/messages/ja.json';
import en from '@/messages/en.json';
import { KPI_CATALOG } from '@/data/kpi/catalog';
import { HABIT_PRESETS } from '@/data/habit-presets';
import { ONBOARDING_V3_PRESET_IDS } from '@/lib/onboarding';

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

// ───────── [0] イントロ 確定文言 ─────────
describe('ja 確定文言（[0] イントロ）', () => {
  it('タイトル・サブタイトル・CTA・補足', () => {
    const s = obj(onbJa.intro);
    expect(str(s.title)).toBe('あなたの毎日の習慣は、一生でどれだけの差を生む？');
    expect(str(s.cta)).toBe('診断を始める');
    expect(str(s.note)).toBe('どの数字も科学研究にもとづいて計算します');
  });
});

// ───────── [1] プロフィール 確定文言 ─────────
describe('ja 確定文言（[1] プロフィール）', () => {
  it('タイトル・年収注記・国・任意', () => {
    const s = obj(onbJa.profile);
    expect(str(s.title)).toBe('あなたのことを教えてください');
    expect(str(s.incomeNote)).toBe('未入力の場合は、年齢・性別・国の平均年収を使って計算します');
    expect(str(s.next)).toBe('次へ');
    expect(str(s.countryJapan)).toBe('日本');
    expect(str(s.optional)).toBe('任意');
  });
});

// ───────── [2] 段階タップ診断 確定文言（v3） ─────────
describe('ja 確定文言（[2] 段階タップ診断・v3）', () => {
  it('ライブ見出し・個別インパクト見出し・質問・カウント・無効ラベル', () => {
    const s = obj(onbJa.habits);
    expect(str(s.liveLead)).toBe('身についている習慣が、あなたにもたらすこと');
    expect(str(s.impactLead)).toBe('この習慣が、残りの人生であなたにもたらすこと');
    expect(str(s.ask)).toBe('あなたは今、これが身についていますか？');
    expect(str(s.countLabel)).toContain('{current}');
    expect(str(s.countLabel)).toContain('{total}');
    expect(str(s.levelDisabled)).toBe('この習慣では選べません');
  });

  it('4択（100/70/30/0）のラベルと説明', () => {
    const lv = obj(obj(onbJa.habits).levels);
    expect(str(obj(lv.full).label)).toBe('完璧に習慣化');
    expect(str(obj(lv.full).desc)).toBe('生活の一部になっている');
    expect(str(obj(lv.most).label)).toBe('だいたい');
    expect(str(obj(lv.sometimes).label)).toBe('たまに');
    expect(str(obj(lv.none).label)).toBe('やってない');
    expect(str(obj(lv.none).desc)).toBe('これから始めたい');
  });

  it('v2 の廃止キー（establishedHeading/sinceLabel/二段構え）が残っていない', () => {
    const s = obj(onbJa.habits);
    expect(s.establishedHeading).toBeUndefined();
    expect(s.activeHeading).toBeUndefined();
    expect(s.sinceLabel).toBeUndefined();
    expect(s.effectPerTime).toBeUndefined();
  });
});

// ───────── [2] 習慣ごとの補足（15本ぶん・v3） ─────────
describe('ja/en habitSub（15習慣ぶん）', () => {
  it('v3 の15プリセットぶんの補足が ja/en に存在し非空', () => {
    const subJa = obj(onbJa.habitSub);
    const subEn = obj(onbEn.habitSub);
    for (const id of ONBOARDING_V3_PRESET_IDS) {
      expect(str(subJa[id]).length, `ja habitSub.${id}`).toBeGreaterThan(0);
      expect(str(subEn[id]).length, `en habitSub.${id}`).toBeGreaterThan(0);
    }
  });
});

// ───────── [3] 計算中（過去参照なし） ─────────
describe('ja 確定文言（[3] 計算中）', () => {
  it('メインコピーと進行マイクロコピー3つ（過去累積の言及なし）', () => {
    const s = obj(onbJa.calculating);
    expect(str(s.title)).toBe('あなたの一生を計算しています…');
    expect(str(s.phase2)).toBe('研究データと照合中…');
    // 未来のみ MVP: 「これまで積み上げてきたぶん」等の過去参照を持たない
    expect(str(s.phase1)).not.toContain('これまで');
  });
});

// ───────── [4] 結果（未来のみ・単一表示・v3） ─────────
describe('ja 確定文言（[4] 結果・未来のみ）', () => {
  it('タイトル・リード・値テンプレ・CTA・補足', () => {
    const s = obj(onbJa.result);
    expect(str(s.title)).toBe('あなたの一生のインパクト');
    expect(str(s.lead).length).toBeGreaterThan(0);
    expect(str(s.value)).toContain('{value}');
    expect(str(s.value)).toContain('{unit}');
    expect(str(s.cta)).toBe('習慣を選びに進む');
    expect(str(s.habitsLabel)).toBe('身についている習慣');
  });

  it('過去/未来二段構えの廃止キーが残っていない', () => {
    const s = obj(onbJa.result);
    expect(s.pastHeading).toBeUndefined();
    expect(s.futureHeading).toBeUndefined();
    expect(s.estimatedLabel).toBeUndefined();
  });
});

// ───────── [5] KPI選択 確定文言 ─────────
describe('ja 確定文言（[5] KPI選択）', () => {
  it('タイトル・リード・4KPIぶんの説明が存在し非空', () => {
    const s = obj(onbJa.kpiSelect);
    expect(str(s.title)).toBe('あなたの人生で、何を充実させたいですか？');
    expect(str(s.lead).length).toBeGreaterThan(0);
    for (const def of KPI_CATALOG) {
      expect(str(obj(s[def.key]).desc).length, `kpiSelect.${def.key}.desc`).toBeGreaterThan(0);
    }
  });

  it('健康寿命の説明は「寿命との違い」がわかる文になっている', () => {
    const desc = str(obj(obj(onbJa.kpiSelect).health_lifespan).desc);
    expect(desc).toContain('寿命そのものではなく');
    expect(desc).toContain('元気');
  });
});

// ───────── [6] 習慣選択 確定文言 ─────────
describe('ja 確定文言（[6] 習慣選択）', () => {
  it('タイトル・リード（{kpi}補間）・現状%（{percent}補間）・CTA・注記・空表示', () => {
    const s = obj(onbJa.habitSelect);
    expect(str(s.title)).toBe('取り組む習慣を選びましょう');
    expect(str(s.lead)).toContain('{kpi}');
    expect(str(s.current)).toContain('{percent}');
    expect(str(s.cta)).toBe('スタート');
    expect(str(s.note).length).toBeGreaterThan(0);
    expect(str(s.empty).length).toBeGreaterThan(0);
  });
});

// ───────── 旧 [5] 完了画面の廃止キーが残っていない ─────────
describe('旧 done.* キーの削除（完了フロー刷新）', () => {
  it('ja/en とも done 名前空間が存在しない', () => {
    expect(onbJa.done).toBeUndefined();
    expect(onbEn.done).toBeUndefined();
  });
});

// ───────── en は ja と同一キー構造・全非空・補間キー保持（パリティ） ─────────
describe('en パリティ', () => {
  function keyPaths(node: Json, prefix = ''): string[] {
    if (node === null || typeof node !== 'object' || Array.isArray(node)) return [prefix];
    const record = node as Record<string, Json>;
    return Object.keys(record).flatMap((k) =>
      keyPaths(record[k], prefix ? `${prefix}.${k}` : k)
    );
  }

  it('onboarding 名前空間の全キーが ja/en で一致する', () => {
    expect(keyPaths(onbEn).sort()).toEqual(keyPaths(onbJa).sort());
  });

  it('en の各文言は空でない（生キー表示にならない）', () => {
    function assertNonEmpty(node: Json, path = '') {
      if (typeof node === 'string') {
        expect(node.length, `empty at ${path}`).toBeGreaterThan(0);
        return;
      }
      if (node && typeof node === 'object' && !Array.isArray(node)) {
        const record = node as Record<string, Json>;
        for (const key of Object.keys(record)) assertNonEmpty(record[key], `${path}.${key}`);
      }
    }
    assertNonEmpty(onbEn);
  });

  it('en も interpolation キー {current}/{total}/{value}/{unit} を保持', () => {
    expect(str(onbEn.stepLabel)).toContain('{current}');
    expect(str(obj(onbEn.habits).countLabel)).toContain('{current}');
    expect(str(obj(onbEn.result).value)).toContain('{value}');
    expect(str(obj(onbEn.result).value)).toContain('{unit}');
  });
});

// ───────── KPI 4軸同列・プリセット名の i18n が ja/en に揃う ─────────
describe('KPI/プリセット i18n（4軸同列・全カタログ）', () => {
  it('KPI4軸の headline/name/unit が en に存在し非空・単位が日本語のまま残らない', () => {
    for (const def of KPI_CATALOG) {
      const card = obj(obj(onbEn.kpi)[def.key]);
      expect(str(card.headline).length).toBeGreaterThan(0);
      expect(str(card.name).length).toBeGreaterThan(0);
      expect(str(card.unit).length).toBeGreaterThan(0);
      expect(str(card.unit)).not.toMatch(/[円分]/);
    }
  });

  it('ja の kpi.* はカタログ確定文言と一致（リグレッション防止）', () => {
    for (const def of KPI_CATALOG) {
      const card = obj(obj(onbJa.kpi)[def.key]);
      expect(str(card.headline)).toBe(def.headline);
      expect(str(card.name)).toBe(def.name);
      expect(str(card.description)).toBe(def.description);
    }
  });

  it('全プリセットの preset.<id> が ja/en の両方に存在し非空', () => {
    const presetJa = obj(onbJa.preset);
    const presetEn = obj(onbEn.preset);
    for (const preset of HABIT_PRESETS) {
      expect(str(presetJa[preset.id]).length).toBeGreaterThan(0);
      expect(str(presetEn[preset.id]).length).toBeGreaterThan(0);
    }
  });

  it('ja の preset.<id> は habit-presets.ts の確定名と一致する', () => {
    const presetJa = obj(onbJa.preset);
    for (const preset of HABIT_PRESETS) {
      expect(str(presetJa[preset.id])).toBe(preset.name);
    }
  });

  it('KPI ラベル: earning の name は「増える収入」（旧ラベルは残らない）', () => {
    const card = obj(obj(onbJa.kpi).earning);
    expect(str(card.name)).toBe('増える収入');
    // 旧 KPI ラベル（change-A で置換済み）を動的に組み立てて不在を確認する
    const legacyEarningLabel = ['稼', 'ぐ', '能', '力'].join('');
    expect(JSON.stringify(onbJa)).not.toContain(legacyEarningLabel);
  });
});
