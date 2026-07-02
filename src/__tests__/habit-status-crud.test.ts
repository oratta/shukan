import { describe, it, expect } from 'vitest';
import { toHabit, buildHabitInsertRow, type HabitRow } from '@/lib/supabase/habits';
import type { HabitInsertInput } from '@/types/habit';

// change-A: status / established_since の snake_case↔camelCase 往復マッピング検証。
// 実 DB を介さず、書き込みペイロード生成（buildHabitInsertRow）と
// 読み出しマッピング（toHabit）の純粋関数を直接テストする（AC#5 / AC#6）。

function baseRow(overrides: Partial<HabitRow> = {}): HabitRow {
  return {
    id: 'h1',
    user_id: 'u1',
    name: 'Test',
    description: null,
    life_significance: null,
    icon: 'target',
    frequency: 'everyday',
    custom_days: null,
    type: 'positive',
    daily_target: 1,
    weekly_target: 1,
    created_at: '2026-01-01',
    archived: false,
    impact_article_id: null,
    sort_order: 0,
    status: 'active',
    established_since: null,
    ...overrides,
  };
}

function baseInput(overrides: Partial<HabitInsertInput> = {}): HabitInsertInput {
  return {
    name: 'Test',
    icon: 'target',
    frequency: 'everyday',
    type: 'positive',
    dailyTarget: 1,
    evidences: [],
    ...overrides,
  };
}

describe('toHabit: status / established_since 読み出しマッピング', () => {
  it('row.status をそのまま camelCase の status に写す', () => {
    const habit = toHabit(baseRow({ status: 'established' }));
    expect(habit.status).toBe('established');
  });

  it('established_since (snake) を establishedSince (camel) に写す', () => {
    const habit = toHabit(baseRow({ status: 'established', established_since: '2016-04-01' }));
    expect(habit.establishedSince).toBe('2016-04-01');
  });

  it('established_since が null なら establishedSince は undefined', () => {
    const habit = toHabit(baseRow({ established_since: null }));
    expect(habit.establishedSince).toBeUndefined();
  });

  it('status が undefined（未マイグレーション行 / select 漏れ）でも active にフォールバックする', () => {
    // 古い行や select 漏れで status が欠落しても undefined を漏らさない
    const row = baseRow();
    delete (row as Partial<HabitRow>).status;
    const habit = toHabit(row);
    expect(habit.status).toBe('active');
  });
});

describe('buildHabitInsertRow: status / established_since 書き込みマッピング', () => {
  it('established 習慣を established_since 付きで snake_case 行に変換する', () => {
    const row = buildHabitInsertRow('u1', baseInput({ status: 'established', establishedSince: '2016-04-01' }), 3);
    expect(row.status).toBe('established');
    expect(row.established_since).toBe('2016-04-01');
    expect(row.user_id).toBe('u1');
    expect(row.sort_order).toBe(3);
  });

  it('status 未指定なら active を既定にする（後方互換）', () => {
    const row = buildHabitInsertRow('u1', baseInput(), 0);
    expect(row.status).toBe('active');
    expect(row.established_since).toBeNull();
  });

  it('establishedSince 未指定なら established_since は null', () => {
    const row = buildHabitInsertRow('u1', baseInput({ status: 'established' }), 0);
    expect(row.established_since).toBeNull();
  });
});

describe('round-trip: input -> insert row -> habit row -> toHabit', () => {
  it('established + established_since が往復しても保持される', () => {
    const input = baseInput({ status: 'established', establishedSince: '2014-07-15' });
    const insertRow = buildHabitInsertRow('u1', input, 0);
    // DB が割り当てる列を補完して読み出し行を作る
    const dbRow: HabitRow = {
      ...insertRow,
      id: 'generated-id',
      created_at: '2026-06-27T00:00:00Z',
      archived: false,
    };
    const habit = toHabit(dbRow);
    expect(habit.status).toBe('established');
    expect(habit.establishedSince).toBe('2014-07-15');
  });
});
