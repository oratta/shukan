import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import ja from '@/messages/ja.json';
import en from '@/messages/en.json';
import { KPI_KEYS } from '@/data/kpi/catalog';

// Discover ページ刷新（F11〜F14）。オンボ中心の KPI 選択 → インパクト順ソート、
// 写真主役カード、ゼロから習慣を作る＋ボタン。ソースリード＋メッセージキーで固定する。

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const src = readFileSync(resolve(projectRoot, 'src/app/(app)/discover/page.tsx'), 'utf-8');

type Dict = Record<string, unknown>;
const discoverJa = (ja as unknown as { discover: Dict }).discover;
const discoverEn = (en as unknown as { discover: Dict }).discover;

describe('F11: Discover の KPI は4軸（前向きな気持ちの時間を含む）', () => {
  it('DISCOVER_KPIS が4つの正準 KPI キーをすべて含む', () => {
    for (const key of KPI_KEYS) {
      expect(src, `KPI key ${key}`).toContain(`'${key}'`);
    }
    // 4軸ぶんの正式名ラベル（impact.*）を参照する
    for (const labelKey of [
      'impact.dailyHealth',
      'impact.dailyPositiveMood',
      'impact.dailyCost',
      'impact.dailyIncome',
    ]) {
      expect(src, labelKey).toContain(labelKey);
    }
  });

  it('KpiIcon（オンボと同じアイコン）を再利用する', () => {
    expect(src).toContain('KpiIcon');
  });
});

describe('F12: 写真主役のコンパクトカード', () => {
  it('写真を全面に敷き、テーマ別の可読性レイヤー（dark=スクリム/light=ベール）を重ねる', () => {
    expect(src).toContain('absolute inset-0');
    expect(src).toContain('banner-scrim');
    expect(src).toContain('banner-veil');
  });

  it('旧 Notion 風タイル（bg-card rounded-xl shadow-sm の白タイル・h-28画像）を使わない', () => {
    expect(src).not.toContain('relative h-28');
  });
});

describe('F13: KPI 選択 → インパクト順ソート', () => {
  it('selectedKpi 状態を持ち、選んだ KPI の param で降順ソートする', () => {
    expect(src).toContain('selectedKpi');
    expect(src).toContain('setSelectedKpi');
    expect(src).toMatch(/sort\(/);
    expect(src).toContain('calculationParams[param]');
  });
});

describe('F14: ゼロから習慣をつくる＋ボタンが HabitForm 新規作成を起動', () => {
  it('プレフィルなしで HabitForm を開くハンドラを持つ', () => {
    expect(src).toContain('handleCreateFromScratch');
    expect(src).toContain('setPrefilledEvidences([])');
    expect(src).toContain('HabitForm');
  });
  it('＋アイコン（Plus）とラベル discover.createFromScratch を表示する', () => {
    expect(src).toContain('Plus');
    expect(src).toContain('discover.createFromScratch');
  });
});

describe('新規 discover メッセージキーが ja/en に存在する', () => {
  for (const key of ['createFromScratch', 'createFromScratchSub', 'sortLead']) {
    it(`discover.${key} が ja/en にある`, () => {
      expect(typeof discoverJa[key], `ja discover.${key}`).toBe('string');
      expect(typeof discoverEn[key], `en discover.${key}`).toBe('string');
    });
  }
});
