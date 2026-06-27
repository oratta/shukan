import { describe, it, expect } from 'vitest';
import ja from '@/messages/ja.json';
import en from '@/messages/en.json';
import { KPI_CATALOG } from '@/data/kpi/catalog';
import { HABIT_PRESETS } from '@/data/habit-presets';

// 確定文言は docs/context/onboarding-screens-v2.md（2026-06-26 確定版）から転記する。

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

// ───────── C-S6: [0] イントロ 確定文言 ─────────
describe('C-S6: ja 確定文言（[0] イントロ）', () => {
  it('タイトル・サブタイトル・CTA・補足', () => {
    const s = obj(onbJa.intro);
    expect(str(s.title)).toBe('あなたの毎日の習慣は、一生でどれだけの差を生む？');
    expect(str(s.subtitle)).toBe(
      'いくつかの質問に答えるだけ。今のあなたに、習慣が一生でどれだけのインパクトを生むかを診断します。'
    );
    expect(str(s.cta)).toBe('診断を始める');
    expect(str(s.note)).toBe('どの数字も科学研究にもとづいて計算します');
  });
});

// ───────── C-S6: [1] プロフィール 確定文言 ─────────
describe('C-S6: ja 確定文言（[1] プロフィール）', () => {
  it('タイトル・サブタイトル・年収注記・国', () => {
    const s = obj(onbJa.profile);
    expect(str(s.title)).toBe('あなたのことを教えてください');
    expect(str(s.subtitle)).toBe('一生のインパクトをあなた用に計算するために使います。');
    expect(str(s.incomeNote)).toBe('未入力の場合は、年齢・性別・国の平均年収を使って計算します');
    expect(str(s.next)).toBe('次へ');
    expect(str(s.countryJapan)).toBe('日本');
    expect(str(s.optional)).toBe('任意');
  });
});

// ───────── C-S6: [2] 習慣選択（2分類）確定文言 ─────────
describe('C-S6: ja 確定文言（[2] 習慣選択 2分類）', () => {
  it('タイトル・2セクションの見出しと補足・いつから・CTA', () => {
    const s = obj(onbJa.habits);
    expect(str(s.title)).toBe('あなたの習慣を教えてください');
    expect(str(s.subtitle)).toBe('続けやすいものを選びましょう。あとから追加・削除できます。');
    expect(str(s.establishedHeading)).toBe('もう習慣になっているもの');
    expect(str(s.establishedNote)).toBe(
      '選ぶと「習慣化済み」になり、これまで積み上げてきたぶんを計算します。'
    );
    expect(str(s.activeHeading)).toBe('これから始めたいもの');
    expect(str(s.activeNote)).toBe('1つ以上選ぶと診断できます。');
    expect(str(s.sinceLabel)).toBe('いつから？');
    expect(str(s.cta)).toBe('診断する');
  });
});

// ───────── C-S6: [3] 計算中 確定文言 ─────────
describe('C-S6: ja 確定文言（[3] 計算中）', () => {
  it('メインコピーと進行マイクロコピー3つ', () => {
    const s = obj(onbJa.calculating);
    expect(str(s.title)).toBe('あなたの一生を計算しています…');
    expect(str(s.phase1)).toBe('これまで積み上げてきたぶんを集計中…');
    expect(str(s.phase2)).toBe('研究データと照合中…');
    expect(str(s.phase3)).toBe('これから積み上がるぶんを計算中…');
  });
});

// ───────── C-S6: [4] 結果（二段構え）確定文言 ─────────
describe('C-S6: ja 確定文言（[4] 結果 二段構え）', () => {
  it('タイトル・ブロック1/2 見出し・推定・CTA・補足・値テンプレ', () => {
    const s = obj(onbJa.result);
    expect(str(s.title)).toBe('あなたの一生のインパクト');
    expect(str(s.pastHeading)).toBe('あなたはもう、これだけ積んできました');
    expect(str(s.futureHeading)).toBe('続ければ、これだけ積み上がります');
    expect(str(s.estimatedLabel)).toBe('推定');
    expect(str(s.futureNote)).toBe('未来のぶんは「今日の1回」を一生続けたときの差です。');
    expect(str(s.cta)).toBe('この内容ではじめる');
    expect(str(s.footnote)).toBe(
      '計算の前提（年齢・性別・国・年収）は設定からいつでも見直せます'
    );
    expect(str(s.valueGain)).toContain('{value}');
    expect(str(s.valueGain)).toContain('{unit}');
    expect(str(s.valueReduction)).toContain('{value}');
  });
});

// ───────── C-S6: [5] 完了 確定文言 ─────────
describe('C-S6: ja 確定文言（[5] 完了）', () => {
  it('タイトル・本文・区分ラベル・CTA', () => {
    const s = obj(onbJa.done);
    expect(str(s.title)).toBe('準備ができました');
    expect(str(s.body)).toBe('今日の1回から、あなたのインパクトが積み上がっていきます。');
    expect(str(s.establishedLabel)).toBe('習慣化済み');
    expect(str(s.activeLabel)).toBe('これから始める');
    expect(str(s.cta)).toBe('はじめる');
  });
});

// ───────── C-S6: en は ja と同一キー構造・全非空・補間キー保持（en リグレッションなし）（AC#13） ─────────
describe('C-S6: en パリティ（AC#13）', () => {
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

  it('en も interpolation キー {copy 相当}/{kpiName}/{current}/{total}/{effect}/{value}/{unit} を保持', () => {
    expect(str(onbEn.stepLabel)).toContain('{current}');
    expect(str(onbEn.stepLabel)).toContain('{total}');
    expect(str(obj(onbEn.habits).effectPerTime)).toContain('{effect}');
    expect(str(obj(onbEn.habits).effectGain)).toContain('{kpiName}');
    expect(str(obj(onbEn.habits).effectGain)).toContain('{value}');
    expect(str(obj(onbEn.result).valueGain)).toContain('{value}');
    expect(str(obj(onbEn.result).valueGain)).toContain('{unit}');
  });
});

// ───────── C-S6: KPI 4軸同列・プリセット名の i18n が ja/en に揃う（KPI 選択ステップなし） ─────────
describe('C-S6: KPI/プリセット i18n（4軸同列・全カタログ）', () => {
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

  it('全プリセットの preset.<id> が ja/en の両方に存在し非空（KPI 非依存・全カタログ・D6）', () => {
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

  it('効果テンプレ effectReduction/effectGain が ja/en に存在し補間キーを保持', () => {
    for (const ns of [onbJa, onbEn]) {
      const h = obj(ns.habits);
      for (const key of ['effectReduction', 'effectGain']) {
        const tmpl = str(h[key]);
        expect(tmpl).toContain('{kpiName}');
        expect(tmpl).toContain('{value}');
        expect(tmpl).toContain('{unit}');
      }
    }
  });
});
