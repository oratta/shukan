import { describe, it, expect } from 'vitest';
import {
  calculateDailyImpact,
  calculateImpactSavings,
  calculateMultiEvidenceImpact,
  calculateTotalSavings,
  renderArticle,
  formatHealthMinutes,
  formatCurrency,
} from '@/lib/impact';
import type { HabitEvidence, LifeImpactArticle, LifeImpactSavings } from '@/types/impact';
import type { HabitCompletion, HabitWithStats } from '@/types/habit';

// --- Test Fixtures ---

const mockArticleQuitSmoking: LifeImpactArticle = {
  habitCategory: 'quit_smoking',
  habitName: '禁煙',
  article: {
    researchBody: '研究によると{{health_inference}}。コスト面では{{cost_inference}}。収入面では{{income_inference}}。累積では{{cumulative}}。',
    sources: [{ id: 1, text: 'Source 1', url: 'https://example.com' }],
  },
  inferences: {
    health: '寿命が10年延びる',
    cost: '年間20万円の節約',
    income: '生産性が向上する',
    cumulative: '10年で200万円',
  },
  calculationParams: {
    dailyHealthMinutes: 30,
    dailyCostSaving: 550,
    dailyIncomeGain: 200,
  },
  confidenceLevel: 'high',
  defaultHabitType: 'quit',
  defaultIcon: 'cigarette-off',
};

const mockArticleDailyCardio: LifeImpactArticle = {
  habitCategory: 'daily_cardio',
  habitName: '毎日有酸素運動',
  article: {
    researchBody: '有酸素運動の効果{{health_inference}}',
    sources: [],
  },
  inferences: {
    health: '心疾患リスク低減',
    cost: '医療費削減',
    income: '集中力向上',
    cumulative: '10年で大幅改善',
  },
  calculationParams: {
    dailyHealthMinutes: 45,
    dailyCostSaving: 300,
    dailyIncomeGain: 500,
  },
  confidenceLevel: 'high',
  defaultHabitType: 'positive',
  defaultIcon: 'person-standing',
};

function mockGetArticle(id: string): LifeImpactArticle | undefined {
  const articles: Record<string, LifeImpactArticle> = {
    quit_smoking: mockArticleQuitSmoking,
    daily_cardio: mockArticleDailyCardio,
  };
  return articles[id];
}

function makeEvidence(articleId: string, weight: number): HabitEvidence {
  return {
    id: `ev-${articleId}`,
    habitId: 'habit-1',
    articleId: articleId as HabitEvidence['articleId'],
    weight,
  };
}

function makeCompletion(habitId: string, date: string, status: string = 'completed'): HabitCompletion {
  return {
    id: `comp-${date}`,
    habitId,
    date,
    status: status as HabitCompletion['status'],
  };
}

// --- Tests ---

describe('calculateDailyImpact', () => {
  it('単一エビデンス（weight=100）の場合、記事のパラメータがそのまま返る', () => {
    const evidences = [makeEvidence('quit_smoking', 100)];
    const result = calculateDailyImpact(evidences, mockGetArticle);
    expect(result).toEqual({
      healthMinutes: 30,
      costSaving: 550,
      incomeGain: 200,
    });
  });

  it('単一エビデンス（weight=50）の場合、パラメータが半分になる', () => {
    const evidences = [makeEvidence('quit_smoking', 50)];
    const result = calculateDailyImpact(evidences, mockGetArticle);
    expect(result).toEqual({
      healthMinutes: 15,
      costSaving: 275,
      incomeGain: 100,
    });
  });

  it('複数エビデンスの重み付き合算', () => {
    const evidences = [
      makeEvidence('quit_smoking', 100),  // 30, 550, 200
      makeEvidence('daily_cardio', 60),   // 45*0.6=27, 300*0.6=180, 500*0.6=300
    ];
    const result = calculateDailyImpact(evidences, mockGetArticle);
    expect(result.healthMinutes).toBe(57);  // 30 + 27
    expect(result.costSaving).toBe(730);    // 550 + 180
    expect(result.incomeGain).toBe(500);    // 200 + 300
  });

  it('エビデンス0件の場合、全て0', () => {
    const result = calculateDailyImpact([], mockGetArticle);
    expect(result).toEqual({ healthMinutes: 0, costSaving: 0, incomeGain: 0 });
  });

  it('存在しないarticleIdはスキップされる', () => {
    const evidences = [
      makeEvidence('quit_smoking', 100),
      makeEvidence('nonexistent' as string, 100),
    ];
    const result = calculateDailyImpact(evidences, mockGetArticle);
    expect(result).toEqual({
      healthMinutes: 30,
      costSaving: 550,
      incomeGain: 200,
    });
  });
});

describe('calculateImpactSavings', () => {
  it('完了日数に応じた累積インパクトを計算', () => {
    const completions = [
      makeCompletion('habit-1', '2026-03-01'),
      makeCompletion('habit-1', '2026-03-02'),
      makeCompletion('habit-1', '2026-03-03'),
    ];
    const result = calculateImpactSavings('habit-1', completions, mockArticleQuitSmoking);
    expect(result.completedDays).toBe(3);
    expect(result.healthMinutes).toBe(90);   // 3 * 30
    expect(result.costSaving).toBe(1650);    // 3 * 550
    expect(result.incomeGain).toBe(600);     // 3 * 200
  });

  it('rocket_usedもcompletedとしてカウントされる', () => {
    const completions = [
      makeCompletion('habit-1', '2026-03-01', 'completed'),
      makeCompletion('habit-1', '2026-03-02', 'rocket_used'),
    ];
    const result = calculateImpactSavings('habit-1', completions, mockArticleQuitSmoking);
    expect(result.completedDays).toBe(2);
  });

  it('failedはカウントされない', () => {
    const completions = [
      makeCompletion('habit-1', '2026-03-01', 'completed'),
      makeCompletion('habit-1', '2026-03-02', 'failed'),
    ];
    const result = calculateImpactSavings('habit-1', completions, mockArticleQuitSmoking);
    expect(result.completedDays).toBe(1);
  });

  it('他の習慣のcompletionは含まれない', () => {
    const completions = [
      makeCompletion('habit-1', '2026-03-01'),
      makeCompletion('habit-2', '2026-03-02'),
    ];
    const result = calculateImpactSavings('habit-1', completions, mockArticleQuitSmoking);
    expect(result.completedDays).toBe(1);
  });
});

describe('calculateMultiEvidenceImpact', () => {
  it('複数エビデンスの重み付き累積インパクト', () => {
    const completions = [
      makeCompletion('habit-1', '2026-03-01'),
      makeCompletion('habit-1', '2026-03-02'),
    ];
    const evidences = [
      makeEvidence('quit_smoking', 100),  // daily: 30, 550, 200
      makeEvidence('daily_cardio', 50),   // daily: 22.5, 150, 250
    ];
    const result = calculateMultiEvidenceImpact('habit-1', completions, evidences, mockGetArticle);
    expect(result.completedDays).toBe(2);
    expect(result.healthMinutes).toBe(2 * (30 + 22.5)); // 105
    expect(result.costSaving).toBe(2 * (550 + 150));     // 1400
    expect(result.incomeGain).toBe(2 * (200 + 250));     // 900
  });
});

describe('calculateTotalSavings', () => {
  it('全習慣のインパクトを合算', () => {
    const habits: HabitWithStats[] = [
      { impactSavings: { completedDays: 5, healthMinutes: 100, costSaving: 1000, incomeGain: 500 } },
      { impactSavings: { completedDays: 3, healthMinutes: 60, costSaving: 300, incomeGain: 200 } },
    ] as HabitWithStats[];

    const result = calculateTotalSavings(habits);
    expect(result.completedDays).toBe(8);
    expect(result.healthMinutes).toBe(160);
    expect(result.costSaving).toBe(1300);
    expect(result.incomeGain).toBe(700);
  });

  it('impactSavingsがない習慣はスキップ', () => {
    const habits: HabitWithStats[] = [
      { impactSavings: { completedDays: 5, healthMinutes: 100, costSaving: 1000, incomeGain: 500 } },
      {} as HabitWithStats,  // no impactSavings
    ] as HabitWithStats[];

    const result = calculateTotalSavings(habits);
    expect(result.completedDays).toBe(5);
  });
});

describe('renderArticle', () => {
  it('プレースホルダーをinferencesで置換する', () => {
    const result = renderArticle(mockArticleQuitSmoking);
    expect(result).toContain('寿命が10年延びる');
    expect(result).toContain('年間20万円の節約');
    expect(result).toContain('生産性が向上する');
    expect(result).toContain('10年で200万円');
    expect(result).not.toContain('{{');
  });

  it('未知のプレースホルダーはそのまま残る', () => {
    const article: LifeImpactArticle = {
      ...mockArticleQuitSmoking,
      article: {
        ...mockArticleQuitSmoking.article,
        researchBody: '{{unknown_key}}は不明',
      },
    };
    const result = renderArticle(article);
    expect(result).toContain('{{unknown_key}}');
  });
});

describe('formatHealthMinutes', () => {
  it('60分未満は「X分」', () => {
    expect(formatHealthMinutes(30)).toBe('30分');
    expect(formatHealthMinutes(0)).toBe('0分');
    expect(formatHealthMinutes(59)).toBe('59分');
  });

  it('60分以上は「X時間Y分」', () => {
    expect(formatHealthMinutes(60)).toBe('1時間');
    expect(formatHealthMinutes(90)).toBe('1時間30分');
    expect(formatHealthMinutes(150)).toBe('2時間30分');
  });

  it('1440分以上は「X日Y時間」', () => {
    expect(formatHealthMinutes(1440)).toBe('1日');
    expect(formatHealthMinutes(1500)).toBe('1日1時間');
    expect(formatHealthMinutes(2880)).toBe('2日');
  });

  it('小数は四捨五入される', () => {
    expect(formatHealthMinutes(30.4)).toBe('30分');
    expect(formatHealthMinutes(30.6)).toBe('31分');
  });

  it('カスタム単位', () => {
    const units = { min: 'min', hour: 'hr', day: 'd' };
    expect(formatHealthMinutes(90, units)).toBe('1hr30min');
  });
});

describe('formatCurrency', () => {
  it('10万以上は「¥X万」', () => {
    expect(formatCurrency(100000)).toBe('¥10万');
    expect(formatCurrency(500000)).toBe('¥50万');
  });

  it('1万-10万は「¥X.X万」', () => {
    expect(formatCurrency(15000)).toBe('¥1.5万');
    expect(formatCurrency(10000)).toBe('¥1.0万');
  });

  it('1万未満は「¥X,XXX」', () => {
    expect(formatCurrency(5000)).toBe('¥5,000');
    expect(formatCurrency(550)).toBe('¥550');
  });

  it('useMan=falseでは万表記しない', () => {
    expect(formatCurrency(100000, false)).toBe('¥100,000');
  });

  it('useMan=falseで大きな金額も具体的数字', () => {
    expect(formatCurrency(547500, false)).toBe('¥547,500');
    expect(formatCurrency(1712000, false)).toBe('¥1,712,000');
  });

  it('useMan=falseで1万未満は同じ結果', () => {
    expect(formatCurrency(5000, false)).toBe('¥5,000');
    expect(formatCurrency(550, false)).toBe('¥550');
  });
});

describe('Daily impact aggregation for DailyImpactSummary', () => {
  it('複数習慣のデイリーインパクト合計を正しく算出', () => {
    // Simulate: 3 habits, 2 with evidences, 1 without
    const ev1 = [makeEvidence('quit_smoking', 100)]; // 30min, ¥550, ¥200
    const ev2 = [makeEvidence('daily_cardio', 100)]; // 45min, ¥300, ¥500

    const daily1 = calculateDailyImpact(ev1, mockGetArticle);
    const daily2 = calculateDailyImpact(ev2, mockGetArticle);

    // Total = sum of all habits with evidences
    const totalHealth = daily1.healthMinutes + daily2.healthMinutes;
    const totalCost = daily1.costSaving + daily2.costSaving;
    const totalIncome = daily1.incomeGain + daily2.incomeGain;

    expect(totalHealth).toBe(75);   // 30 + 45
    expect(totalCost).toBe(850);    // 550 + 300
    expect(totalIncome).toBe(700);  // 200 + 500

    // Earned = only completed habits (simulate habit1 completed, habit2 not)
    const earnedHealth = daily1.healthMinutes;
    const earnedCost = daily1.costSaving;
    const earnedIncome = daily1.incomeGain;

    expect(earnedHealth).toBe(30);
    expect(earnedCost).toBe(550);
    expect(earnedIncome).toBe(200);
  });
});
