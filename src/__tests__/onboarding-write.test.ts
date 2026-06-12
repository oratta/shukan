import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Supabase library mocks ---
const upsertUserProfileMock = vi.fn();
const insertHabitMock = vi.fn();
const replaceHabitEvidencesMock = vi.fn();

vi.mock('@/lib/supabase/profiles', () => ({
  upsertUserProfile: (...args: unknown[]) => upsertUserProfileMock(...args),
}));

vi.mock('@/lib/supabase/habits', () => ({
  insertHabit: (...args: unknown[]) => insertHabitMock(...args),
  replaceHabitEvidences: (...args: unknown[]) => replaceHabitEvidencesMock(...args),
}));

import { runOnboardingWrite } from '@/lib/onboarding';

const callOrder: string[] = [];

beforeEach(() => {
  upsertUserProfileMock.mockReset();
  insertHabitMock.mockReset();
  replaceHabitEvidencesMock.mockReset();
  callOrder.length = 0;

  upsertUserProfileMock.mockImplementation(async () => {
    callOrder.push('profile');
    return {};
  });
  insertHabitMock.mockImplementation(async (_userId: string, habit: { name: string }) => {
    callOrder.push(`habit:${habit.name}`);
    return { id: `id-${habit.name}` };
  });
  replaceHabitEvidencesMock.mockImplementation(async (habitId: string) => {
    callOrder.push(`evidence:${habitId}`);
    return [];
  });
});

function input() {
  return {
    userId: 'user-1',
    selectedKpi: 'cost_saving' as const,
    profile: { age: 42, gender: 'male' as const, country: 'JP', annualIncome: null },
    selectedPresetIds: ['cook_at_home', 'daily_saving_habit'],
  };
}

describe('runOnboardingWrite — C-S13 書き込み順序と内容', () => {
  it('profile → habits → evidences の順で書き込む', async () => {
    await runOnboardingWrite(input());
    expect(callOrder[0]).toBe('profile');
    // 各 habit の直後にその habit の evidence が書かれる
    expect(callOrder).toEqual([
      'profile',
      'habit:自炊する',
      'evidence:id-自炊する',
      'habit:毎日の節約',
      'evidence:id-毎日の節約',
    ]);
  });

  it('upsertUserProfile に tracked_kpis=選んだKPIキーと入力値を渡す', async () => {
    await runOnboardingWrite(input());
    expect(upsertUserProfileMock).toHaveBeenCalledTimes(1);
    const [userId, payload] = upsertUserProfileMock.mock.calls[0];
    expect(userId).toBe('user-1');
    expect(payload.trackedKpis).toEqual(['cost_saving']);
    expect(payload.birthYear).toBe(new Date().getFullYear() - 42);
    expect(payload.gender).toBe('male');
    expect(payload.country).toBe('JP');
    expect(payload.annualIncome).toBeNull();
    expect(payload.currency).toBe('JPY');
  });

  it('年収入力時は annualIncome をそのまま保存', async () => {
    await runOnboardingWrite({
      ...input(),
      profile: { age: 30, gender: 'female', country: 'JP', annualIncome: 4_000_000 },
    });
    const [, payload] = upsertUserProfileMock.mock.calls[0];
    expect(payload.annualIncome).toBe(4_000_000);
  });

  it('各 habit に articleIds 分の evidence を weight=100 で書き込む', async () => {
    await runOnboardingWrite(input());
    // cook_at_home の articleIds = ['home_cooking','intermittent_fasting']
    const cookCall = replaceHabitEvidencesMock.mock.calls.find(
      (c) => c[0] === 'id-自炊する'
    );
    expect(cookCall).toBeTruthy();
    const evidences = cookCall![1] as { articleId: string; weight: number }[];
    expect(evidences).toEqual([
      { articleId: 'home_cooking', weight: 100 },
      { articleId: 'intermittent_fasting', weight: 100 },
    ]);
  });
});

describe('runOnboardingWrite — C-S14 失敗時の再試行', () => {
  it('habits insert 失敗時は例外を投げ、profile は冪等に再試行できる', async () => {
    insertHabitMock.mockImplementationOnce(async () => {
      throw new Error('insert failed');
    });
    await expect(runOnboardingWrite(input())).rejects.toThrow('insert failed');

    // 再試行: 今度は成功
    insertHabitMock.mockImplementation(async (_u: string, habit: { name: string }) => ({
      id: `id-${habit.name}`,
    }));
    await expect(runOnboardingWrite(input())).resolves.toBeUndefined();
    // profile は2回呼ばれる（冪等 upsert）
    expect(upsertUserProfileMock).toHaveBeenCalledTimes(2);
  });

  it('プリセットが空の場合は何も書かない（呼び出し側でガードする前提でも安全）', async () => {
    await runOnboardingWrite({ ...input(), selectedPresetIds: [] });
    expect(upsertUserProfileMock).toHaveBeenCalledTimes(1);
    expect(insertHabitMock).not.toHaveBeenCalled();
  });
});
