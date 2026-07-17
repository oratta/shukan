import { describe, it, expect } from 'vitest';
import {
  getHabitsWithStats,
  getEffectiveStatus,
  nextStatus,
  getTodayString,
} from '@/lib/habits';
import type { Habit, HabitCompletion } from '@/types/habit';

// redesign-quit-habit-input (issue #104):
// - quit の completedToday は completion レコードのみで判定（urge_logs 依存の撤去）
// - nextStatus は達成の二値トグル（3値サイクル不在）
// - getEffectiveStatus（6日放置→failed）は現行維持

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

describe('quit habit completedToday (completion record based)', () => {
  it('urge データが一切なくても、今日の completed レコードだけで completedToday=true になる', () => {
    const habit = makeHabit({ id: 'q1', type: 'quit' });
    const completions = [makeCompletion('q1', getTodayString(), 'completed')];
    const [stats] = getHabitsWithStats([habit], completions);
    expect(stats.completedToday).toBe(true);
  });

  it('今日のレコードが無い quit 習慣は completedToday=false', () => {
    const habit = makeHabit({ id: 'q1', type: 'quit' });
    const [stats] = getHabitsWithStats([habit], []);
    expect(stats.completedToday).toBe(false);
  });

  it('今日が failed の quit 習慣は completedToday=false', () => {
    const habit = makeHabit({ id: 'q1', type: 'quit' });
    const completions = [makeCompletion('q1', getTodayString(), 'failed', 50)];
    const [stats] = getHabitsWithStats([habit], completions);
    expect(stats.completedToday).toBe(false);
  });

  it('rocket_used も達成として扱う（positive と同一ロジック）', () => {
    const habit = makeHabit({ id: 'q1', type: 'quit' });
    const completions = [makeCompletion('q1', getTodayString(), 'rocket_used')];
    const [stats] = getHabitsWithStats([habit], completions);
    expect(stats.completedToday).toBe(true);
  });
});

describe('nextStatus binary toggle', () => {
  it('none をタップすると completed になる', () => {
    expect(nextStatus('none')).toBe('completed');
  });

  it('completed をタップすると none に戻る（取り消し）', () => {
    expect(nextStatus('completed')).toBe('none');
  });

  it('rocket_used をタップすると none に戻る', () => {
    expect(nextStatus('rocket_used')).toBe('none');
  });

  it('failed をタップすると none に戻る（タップだけで failed になる経路が無い）', () => {
    expect(nextStatus('failed')).toBe('none');
  });

  it('skipped をタップすると none に戻る', () => {
    expect(nextStatus('skipped')).toBe('none');
  });

  it('どの入力からも failed は返らない（3値サイクル不在）', () => {
    const inputs = ['none', 'completed', 'failed', 'rocket_used', 'skipped'] as const;
    for (const s of inputs) {
      expect(nextStatus(s)).not.toBe('failed');
    }
  });
});

describe('getEffectiveStatus (現行維持)', () => {
  function daysAgo(n: number): string {
    const d = new Date();
    d.setDate(d.getDate() - n);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  it('6日以上前の none は failed 扱いになる', () => {
    expect(getEffectiveStatus({ date: daysAgo(6), status: 'none' })).toBe('failed');
  });

  it('5日前までの none は none のまま', () => {
    expect(getEffectiveStatus({ date: daysAgo(5), status: 'none' })).toBe('none');
    expect(getEffectiveStatus({ date: daysAgo(0), status: 'none' })).toBe('none');
  });

  it('none 以外はそのまま返す', () => {
    expect(getEffectiveStatus({ date: daysAgo(10), status: 'completed' })).toBe('completed');
    expect(getEffectiveStatus({ date: daysAgo(10), status: 'skipped' })).toBe('skipped');
  });
});
