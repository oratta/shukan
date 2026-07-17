import { describe, it, expect } from 'vitest';
import {
  EDITABLE_PAST_DAYS,
  getEditablePastDays,
  getEffectiveStatus,
  getHabitsWithStats,
} from '@/lib/habits';
import type { Habit, HabitCompletion } from '@/types/habit';

// bulk-past-day-editing (issue #107):
// - 一括編集シートの対象日 = 今日を除く過去 EDITABLE_PAST_DAYS 日のうち習慣の対象日（新しい順）
// - 編集可能枠・自動失敗表示・ロケット境界の3つを EDITABLE_PAST_DAYS(=7) に統一
//   （旧仕様: 編集=過去4日 / 自動失敗=5日以上 / ロケット=6日以上 で「5日前が救えない」隙間があった）

function makeHabit(overrides: Partial<Habit> & { id: string }): Habit {
  return {
    name: 'Test Habit',
    icon: 'target',
    frequency: 'everyday',
    type: 'positive',
    createdAt: '2026-01-01',
    archived: false,
    evidences: [],
    sortOrder: 0,
    status: 'active',
    ...overrides,
  };
}

function makeCompletion(
  habitId: string,
  date: string,
  status: HabitCompletion['status'] = 'completed',
  resistRate?: number
): HabitCompletion {
  return {
    habitId,
    date,
    completedAt: `${date}T00:00:00.000Z`,
    status,
    ...(resistRate !== undefined ? { resistRate } : {}),
  };
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function dayOfWeekOf(dateStr: string): number {
  return new Date(dateStr + 'T00:00:00').getDay();
}

describe('EDITABLE_PAST_DAYS 定数', () => {
  it('編集可能枠は過去7日である', () => {
    expect(EDITABLE_PAST_DAYS).toBe(7);
  });
});

describe('getEditablePastDays: 対象日の決定', () => {
  it('毎日習慣は今日を除く過去7日を新しい順で返す', () => {
    const habit = makeHabit({ id: 'h1' });
    const days = getEditablePastDays(habit, []);
    expect(days).toHaveLength(EDITABLE_PAST_DAYS);
    expect(days.map((d) => d.date)).toEqual(
      [1, 2, 3, 4, 5, 6, 7].map((n) => daysAgo(n))
    );
  });

  it('今日は含まれない', () => {
    const habit = makeHabit({ id: 'h1' });
    const days = getEditablePastDays(habit, []);
    expect(days.map((d) => d.date)).not.toContain(daysAgo(0));
  });

  it('記録済みステータスと我慢率を反映する', () => {
    const habit = makeHabit({ id: 'h1', type: 'quit' });
    const completions = [
      makeCompletion('h1', daysAgo(1), 'completed'),
      makeCompletion('h1', daysAgo(2), 'failed', 75),
      makeCompletion('h1', daysAgo(3), 'skipped'),
    ];
    const days = getEditablePastDays(habit, completions);
    expect(days[0]).toMatchObject({ date: daysAgo(1), status: 'completed' });
    expect(days[1]).toMatchObject({ date: daysAgo(2), status: 'failed', resistRate: 75 });
    expect(days[2]).toMatchObject({ date: daysAgo(3), status: 'skipped' });
    expect(days[3]).toMatchObject({ date: daysAgo(4), status: 'none' });
  });

  it('未記録日は編集可能枠内なので none になる（自動失敗表示にならない）', () => {
    const habit = makeHabit({ id: 'h1' });
    const days = getEditablePastDays(habit, []);
    for (const day of days) {
      expect(day.status).toBe('none');
    }
  });

  it('weekday 習慣は月〜金の日だけを返す', () => {
    const habit = makeHabit({ id: 'h1', frequency: 'weekday' });
    const days = getEditablePastDays(habit, []);
    // 過去7日には必ず土日が2日含まれるため 5 日になる
    expect(days).toHaveLength(5);
    for (const day of days) {
      const dow = dayOfWeekOf(day.date);
      expect(dow).toBeGreaterThanOrEqual(1);
      expect(dow).toBeLessThanOrEqual(5);
    }
  });

  it('custom 習慣は指定曜日の日だけを返す', () => {
    const targetDow = dayOfWeekOf(daysAgo(3));
    const habit = makeHabit({ id: 'h1', frequency: 'custom', customDays: [targetDow] });
    const days = getEditablePastDays(habit, []);
    // 過去7日のうち特定曜日はちょうど1日
    expect(days).toHaveLength(1);
    expect(days[0].date).toBe(daysAgo(3));
  });

  it('weekly 習慣は過去7日すべてを返す', () => {
    const habit = makeHabit({ id: 'h1', frequency: 'weekly', weeklyTarget: 3 });
    const days = getEditablePastDays(habit, []);
    expect(days).toHaveLength(EDITABLE_PAST_DAYS);
  });

  it('他の習慣の completion は反映しない', () => {
    const habit = makeHabit({ id: 'h1' });
    const completions = [makeCompletion('other', daysAgo(1), 'completed')];
    const days = getEditablePastDays(habit, completions);
    expect(days[0].status).toBe('none');
  });
});

describe('editablePastDays: 週ドットと一括編集シートの行の1:1一致', () => {
  it('getHabitsWithStats が editablePastDays を返し、getEditablePastDays と一致する', () => {
    const habit = makeHabit({ id: 'h1', type: 'quit' });
    const completions = [makeCompletion('h1', daysAgo(2), 'failed', 25)];
    const [stats] = getHabitsWithStats([habit], completions);
    expect(stats.editablePastDays).toEqual(getEditablePastDays(habit, completions));
    expect(stats.editablePastDays).toHaveLength(EDITABLE_PAST_DAYS);
  });

  it('曜日指定習慣でも editablePastDays は過去7日の対象曜日のみ（シート行と同じ）', () => {
    const targetDow = dayOfWeekOf(daysAgo(3));
    const habit = makeHabit({ id: 'h1', frequency: 'custom', customDays: [targetDow] });
    const [stats] = getHabitsWithStats([habit], []);
    expect(stats.editablePastDays).toHaveLength(1);
    expect(stats.editablePastDays[0].date).toBe(daysAgo(3));
  });
});

describe('自動失敗表示の境界統一（getAllDayStatuses 経由の allDays）', () => {
  it('編集可能枠内（7日前まで）の未記録日は none、8日以上前は failed', () => {
    const habit = makeHabit({ id: 'h1', createdAt: daysAgo(10) });
    const [stats] = getHabitsWithStats([habit], []);
    const byDate = new Map(stats.allDays.map((d) => [d.date, d.status]));
    expect(byDate.get(daysAgo(5))).toBe('none');
    expect(byDate.get(daysAgo(6))).toBe('none');
    expect(byDate.get(daysAgo(7))).toBe('none');
    expect(byDate.get(daysAgo(8))).toBe('failed');
    expect(byDate.get(daysAgo(9))).toBe('failed');
  });
});

describe('getEffectiveStatus の境界統一', () => {
  it('7日前までの未記録は none、8日以上前は failed', () => {
    expect(getEffectiveStatus({ date: daysAgo(7), status: 'none' })).toBe('none');
    expect(getEffectiveStatus({ date: daysAgo(8), status: 'none' })).toBe('failed');
  });

  it('記録済みステータスはそのまま返す', () => {
    expect(getEffectiveStatus({ date: daysAgo(10), status: 'completed' })).toBe('completed');
    expect(getEffectiveStatus({ date: daysAgo(10), status: 'skipped' })).toBe('skipped');
  });
});
