import { describe, it, expect } from 'vitest';
import ja from '@/messages/ja.json';
import en from '@/messages/en.json';
import { KPI_CATALOG } from '@/data/kpi/catalog';

// 確定文言は docs/context/onboarding-screens.md（2026-06-12 確定）から一字一句変えない。

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

describe('C-S17: ja 確定文言（画面[1]）', () => {
  it('[1] タイトル・サブタイトル・ボタン・補足が確定文言どおり', () => {
    const s1 = obj(onbJa.step1);
    expect(str(s1.title)).toBe('どんな自分に切り替えますか？');
    expect(str(s1.subtitle)).toBe(
      'まずは1つに集中しましょう。あとからいつでも変えられます。'
    );
    expect(str(s1.next)).toBe('次へ');
    expect(str(s1.note)).toBe('どの数字も科学研究にもとづいて計算します');
  });
});

describe('C-S6: 4カードの確定文言（見出し・KPI名・説明文）', () => {
  const expected = {
    health_lifespan: {
      headline: '長く健康でいられる自分へ',
      name: '健康寿命',
      description: '習慣の積み重ねが健康寿命を何分延ばすかを記録します',
    },
    positive_mood: {
      headline: '前向きな気持ちで過ごせる自分へ',
      name: '前向きな気持ちの時間',
      description: '前向きでいられる時間が何分増えるかを記録します',
    },
    cost_saving: {
      headline: 'お金で諦めない自分へ',
      name: '出費削減',
      description: '生涯の出費をいくら（円）減らせるかを記録します',
    },
    earning: {
      headline: '稼ぐ力のある自分へ',
      name: '稼ぐ能力',
      description: '生涯で稼ぐ能力がいくら（円）上がるかを記録します',
    },
  };

  for (const def of KPI_CATALOG) {
    it(`${def.key} の見出し/KPI名/説明文が確定文言`, () => {
      const card = obj(obj(onbJa.kpi)[def.key]);
      expect(str(card.headline)).toBe(expected[def.key].headline);
      expect(str(card.name)).toBe(expected[def.key].name);
      expect(str(card.description)).toBe(expected[def.key].description);
    });
    it(`${def.key} のメッセージはカタログと一致する`, () => {
      const card = obj(obj(onbJa.kpi)[def.key]);
      expect(str(card.headline)).toBe(def.headline);
      expect(str(card.name)).toBe(def.name);
      expect(str(card.description)).toBe(def.description);
    });
  }
});

describe('C-S8: 画面[2] 確定文言・注記', () => {
  it('タイトル・サブタイトル・年収注記が確定文言どおり', () => {
    const s2 = obj(onbJa.step2);
    expect(str(s2.title)).toBe('あなたの数字で計算します');
    expect(str(s2.subtitle)).toBe('選んだKPIをあなた用に計算するために使います。');
    expect(str(s2.incomeNote)).toBe(
      '未入力の場合は、年齢・性別・国の平均年収を使って計算します'
    );
    expect(str(s2.next)).toBe('次へ');
    expect(str(s2.countryJapan)).toBe('日本');
  });
});

describe('C-S10/C-S12: 画面[3][4] 確定文言（interpolation キー含む）', () => {
  it('[3] タイトルは {copy} 差し込み・ボタンは「この習慣ではじめる」', () => {
    const s3 = obj(onbJa.step3);
    expect(str(s3.title)).toBe('「{copy}」に効く習慣');
    expect(str(s3.title)).toContain('{copy}');
    expect(str(s3.start)).toBe('この習慣ではじめる');
    expect(str(s3.subtitle)).toBe(
      '続けやすいものを1つ以上選んでください。あとから追加・削除できます。'
    );
  });
  it('[4] タイトル・本文（{kpiName} 差し込み）・ボタン', () => {
    const s4 = obj(onbJa.step4);
    expect(str(s4.title)).toBe('準備ができました');
    expect(str(s4.body)).toBe('今日の1回から、あなたの「{kpiName}」が積み上がっていきます。');
    expect(str(s4.body)).toContain('{kpiName}');
    expect(str(s4.start)).toBe('はじめる');
  });
});

describe('C-S18: en は ja と同一キー構造でキー欠落なし', () => {
  function keyPaths(node: Json, prefix = ''): string[] {
    if (node === null || typeof node !== 'object' || Array.isArray(node)) {
      return [prefix];
    }
    const record = node as Record<string, Json>;
    return Object.keys(record).flatMap((k) =>
      keyPaths(record[k], prefix ? `${prefix}.${k}` : k)
    );
  }

  it('onboarding 名前空間の全キーが ja/en で一致する', () => {
    const jaKeys = keyPaths(onbJa).sort();
    const enKeys = keyPaths(onbEn).sort();
    expect(enKeys).toEqual(jaKeys);
  });

  it('en の各文言は空でない（生キー表示にならない）', () => {
    function assertNonEmpty(node: Json, path = '') {
      if (typeof node === 'string') {
        expect(node.length, `empty at ${path}`).toBeGreaterThan(0);
        return;
      }
      if (node && typeof node === 'object' && !Array.isArray(node)) {
        const record = node as Record<string, Json>;
        for (const k of Object.keys(record)) {
          assertNonEmpty(record[k], `${path}.${k}`);
        }
      }
    }
    assertNonEmpty(onbEn);
  });

  it('en も interpolation キー {copy} / {kpiName} / {current} / {total} / {effect} を保持', () => {
    expect(str(obj(onbEn.step3).title)).toContain('{copy}');
    expect(str(obj(onbEn.step4).body)).toContain('{kpiName}');
    expect(str(onbEn.stepLabel)).toContain('{current}');
    expect(str(onbEn.stepLabel)).toContain('{total}');
    expect(str(obj(onbEn.step3).effectPerTime)).toContain('{effect}');
  });
});
