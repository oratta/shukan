import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  calculateStreak,
  getCompletionRate,
  calculateRockets,
  getAllDayStatuses,
  getHabitsWithStats,
  isCompletedToday,
  getRecentDays,
} from '@/lib/habits';
import type { HabitCompletion, Habit } from '@/types/habit';
import type { LifeImpactArticle } from '@/types/impact';

// --- Helpers ---

function makeCompletion(habitId: string, date: string, status: string = 'completed'): HabitCompletion {
  return {
    id: `comp-${date}`,
    habitId,
    date,
    status: status as HabitCompletion['status'],
  };
}

function makeDates(start: string, count: number): string[] {
  const dates: string[] = [];
  const d = new Date(start);
  for (let i = 0; i < count; i++) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    dates.push(`${year}-${month}-${day}`);
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

function getDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// --- Tests ---

describe('isCompletedToday', () => {
  it('今日completedがあればtrue', () => {
    const today = getDateString(new Date());
    const completions = [makeCompletion('h1', today, 'completed')];
    expect(isCompletedToday('h1', completions)).toBe(true);
  });

  it('今日rocket_usedがあればtrue', () => {
    const today = getDateString(new Date());
    const completions = [makeCompletion('h1', today, 'rocket_used')];
    expect(isCompletedToday('h1', completions)).toBe(true);
  });

  it('今日failedのみならfalse', () => {
    const today = getDateString(new Date());
    const completions = [makeCompletion('h1', today, 'failed')];
    expect(isCompletedToday('h1', completions)).toBe(false);
  });

  it('今日のcompletionがなければfalse', () => {
    const completions = [makeCompletion('h1', '2026-01-01', 'completed')];
    expect(isCompletedToday('h1', completions)).toBe(false);
  });

  it('別の習慣のcompletionはfalse', () => {
    const today = getDateString(new Date());
    const completions = [makeCompletion('h2', today, 'completed')];
    expect(isCompletedToday('h1', completions)).toBe(false);
  });
});

describe('calculateStreak', () => {
  it('completionが0件なら current=0, longest=0', () => {
    expect(calculateStreak('h1', [])).toEqual({ current: 0, longest: 0 });
  });

  it('今日だけ完了なら current=1, longest=1', () => {
    const today = getDateString(new Date());
    const completions = [makeCompletion('h1', today)];
    expect(calculateStreak('h1', completions)).toEqual({ current: 1, longest: 1 });
  });

  it('連続3日（今日含む）なら current=3', () => {
    const today = new Date();
    const dates = [];
    for (let i = 2; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      dates.push(getDateString(d));
    }
    const completions = dates.map(d => makeCompletion('h1', d));
    const result = calculateStreak('h1', completions);
    expect(result.current).toBe(3);
    expect(result.longest).toBe(3);
  });

  it('昨日までの連続5日（今日は未完了）なら current=5', () => {
    const today = new Date();
    const dates = [];
    for (let i = 5; i >= 1; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      dates.push(getDateString(d));
    }
    const completions = dates.map(d => makeCompletion('h1', d));
    const result = calculateStreak('h1', completions);
    expect(result.current).toBe(5);
  });

  it('2日前に途切れていれば current=0', () => {
    const today = new Date();
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const completions = [makeCompletion('h1', getDateString(twoDaysAgo))];
    const result = calculateStreak('h1', completions);
    expect(result.current).toBe(0);
  });

  it('rocket_usedもストリークにカウントされる', () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const completions = [
      makeCompletion('h1', getDateString(yesterday), 'completed'),
      makeCompletion('h1', getDateString(today), 'rocket_used'),
    ];
    const result = calculateStreak('h1', completions);
    expect(result.current).toBe(2);
  });

  it('failedはストリークに含まれない', () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const completions = [
      makeCompletion('h1', getDateString(yesterday), 'failed'),
      makeCompletion('h1', getDateString(today), 'completed'),
    ];
    const result = calculateStreak('h1', completions);
    expect(result.current).toBe(1); // failedで途切れる
  });

  it('longestは過去の最長ストリークを反映', () => {
    const today = new Date();
    // 20日前から15日前まで6日連続、今日だけ完了
    const dates = [];
    for (let i = 20; i >= 15; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      dates.push(getDateString(d));
    }
    dates.push(getDateString(today));
    const completions = dates.map(d => makeCompletion('h1', d));
    const result = calculateStreak('h1', completions);
    expect(result.current).toBe(1);
    expect(result.longest).toBe(6);
  });
});

describe('getCompletionRate', () => {
  it('全日完了なら1.0', () => {
    const today = new Date();
    const completions = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      completions.push(makeCompletion('h1', getDateString(d)));
    }
    expect(getCompletionRate('h1', completions, 7)).toBe(1.0);
  });

  it('半分完了なら0.5', () => {
    const today = new Date();
    const completions = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i * 2);
      completions.push(makeCompletion('h1', getDateString(d)));
    }
    expect(getCompletionRate('h1', completions, 10)).toBe(0.5);
  });

  it('days=0の場合0を返す', () => {
    expect(getCompletionRate('h1', [], 0)).toBe(0);
  });
});

describe('calculateRockets', () => {
  it('completionが0件なら rockets=0, nextIn=10', () => {
    expect(calculateRockets('h1', [])).toEqual({ rockets: 0, nextIn: 10 });
  });

  it('連続10日でロケット1個獲得', () => {
    const today = new Date();
    const completions = [];
    for (let i = 9; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      completions.push(makeCompletion('h1', getDateString(d)));
    }
    const result = calculateRockets('h1', completions);
    expect(result.rockets).toBe(1);
  });

  it('連続20日でロケット2個獲得', () => {
    const today = new Date();
    const completions = [];
    for (let i = 19; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      completions.push(makeCompletion('h1', getDateString(d)));
    }
    const result = calculateRockets('h1', completions);
    expect(result.rockets).toBe(2);
  });

  it('rocket_usedの分だけ減算される', () => {
    const today = new Date();
    const completions: HabitCompletion[] = [];
    for (let i = 9; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      completions.push(makeCompletion('h1', getDateString(d)));
    }
    // 1つ使用済み
    const d11 = new Date(today);
    d11.setDate(d11.getDate() + 1);
    completions.push(makeCompletion('h1', getDateString(d11), 'rocket_used'));
    const result = calculateRockets('h1', completions);
    expect(result.rockets).toBe(0); // 1 earned - 1 used = 0
  });

  it('nextInは次のロケットまでの残り日数', () => {
    const today = new Date();
    const completions = [];
    for (let i = 2; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      completions.push(makeCompletion('h1', getDateString(d)));
    }
    const result = calculateRockets('h1', completions);
    expect(result.nextIn).toBe(7); // 10 - 3 = 7
  });
});

describe('getAllDayStatuses', () => {
  it('完了した日はcompletedステータス', () => {
    const today = getDateString(new Date());
    const completions = [makeCompletion('h1', today, 'completed')];
    const result = getAllDayStatuses('h1', completions, today);
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe('completed');
  });

  it('5日以上前の未完了日はfailedになる', () => {
    const today = new Date();
    const tenDaysAgo = new Date(today);
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
    const result = getAllDayStatuses('h1', [], getDateString(tenDaysAgo));
    // 10日前〜今日 = 11日分
    expect(result).toHaveLength(11);
    // 5日以上前はfailed
    const failedDays = result.filter(d => d.status === 'failed');
    expect(failedDays.length).toBe(6); // 10,9,8,7,6,5日前
    // 4日以内はnone
    const noneDays = result.filter(d => d.status === 'none');
    expect(noneDays.length).toBe(5); // 4,3,2,1,0日前
  });
});

describe('getHabitsWithStats - multi-evidence', () => {
  const mockArticle: LifeImpactArticle = {
    habitCategory: 'quit_smoking',
    habitName: '禁煙',
    article: { researchBody: '', sources: [] },
    inferences: { health: '', cost: '', income: '', cumulative: '' },
    calculationParams: { dailyHealthMinutes: 30, dailyCostSaving: 500, dailyIncomeGain: 100 },
    confidenceLevel: 'high',
    defaultHabitType: 'quit',
    defaultIcon: '🚭',
  };

  const getArticle = (id: string) => id === 'quit_smoking' ? mockArticle : undefined;

  it('evidences配列があればマルチエビデンス計算を使用', () => {
    const today = getDateString(new Date());
    const habits: Habit[] = [{
      id: 'h1',
      userId: 'u1',
      name: 'Test',
      type: 'quit',
      frequency: 'daily',
      createdAt: today,
      archived: false,
      sortOrder: 0,
      evidences: [{ id: 'ev1', habitId: 'h1', articleId: 'quit_smoking' as const, weight: 100 }],
    }];
    const completions = [makeCompletion('h1', today)];

    const result = getHabitsWithStats(habits, completions, [], undefined, getArticle);
    expect(result[0].impactSavings).toBeDefined();
    expect(result[0].impactSavings!.completedDays).toBe(1);
    expect(result[0].impactSavings!.healthMinutes).toBe(30);
  });

  it('evidencesが空でimpactArticleIdがあればレガシー計算を使用', () => {
    const today = getDateString(new Date());
    const habits: Habit[] = [{
      id: 'h1',
      userId: 'u1',
      name: 'Test',
      type: 'quit',
      frequency: 'daily',
      createdAt: today,
      archived: false,
      sortOrder: 0,
      evidences: [],
      impactArticleId: 'quit_smoking' as const,
    }];
    const completions = [makeCompletion('h1', today)];

    const result = getHabitsWithStats(habits, completions, [], undefined, getArticle);
    expect(result[0].impactSavings).toBeDefined();
    expect(result[0].impactSavings!.completedDays).toBe(1);
  });

  it('エビデンスもimpactArticleIdもなければimpactSavingsなし', () => {
    const today = getDateString(new Date());
    const habits: Habit[] = [{
      id: 'h1',
      userId: 'u1',
      name: 'Test',
      type: 'positive',
      frequency: 'daily',
      createdAt: today,
      archived: false,
      sortOrder: 0,
      evidences: [],
    }];

    const result = getHabitsWithStats(habits, [], [], undefined, getArticle);
    expect(result[0].impactSavings).toBeUndefined();
  });
});
