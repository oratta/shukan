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

import { runOnboardingWrite, OnboardingWriteError } from '@/lib/onboarding';
import { KPI_KEYS } from '@/data/kpi/catalog';

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
  insertHabitMock.mockImplementation(
    async (_userId: string, habit: { name: string; status?: string }) => {
      callOrder.push(`habit:${habit.name}:${habit.status ?? 'active'}`);
      return { id: `id-${habit.name}` };
    }
  );
  replaceHabitEvidencesMock.mockImplementation(async (habitId: string) => {
    callOrder.push(`evidence:${habitId}`);
    return [];
  });
});

function input() {
  return {
    userId: 'user-1',
    profile: { age: 42, gender: 'male' as const, country: 'JP', annualIncome: null },
    established: [{ presetId: 'quit_alcohol_habit', establishedSince: '2016-06-27' }],
    activePresetIds: ['cook_at_home', 'daily_saving_habit'],
  };
}

describe('runOnboardingWrite — C-S1 書き込み順序と内容（v2）', () => {
  it('profile → established habits → active habits の順で書き込む', async () => {
    await runOnboardingWrite(input());
    expect(callOrder[0]).toBe('profile');
    expect(callOrder).toEqual([
      'profile',
      'habit:アルコールを週100g（ビール500ml×5本）以内に抑える:established',
      'evidence:id-アルコールを週100g（ビール500ml×5本）以内に抑える',
      'habit:自炊する:active',
      'evidence:id-自炊する',
      'habit:毎日の節約:active',
      'evidence:id-毎日の節約',
    ]);
  });

  it('established 習慣は status=established と established_since 付きで insert される（AC#10）', async () => {
    await runOnboardingWrite(input());
    const estCall = insertHabitMock.mock.calls.find(
      (c) => (c[1] as { name: string }).name === 'アルコールを週100g（ビール500ml×5本）以内に抑える'
    );
    expect(estCall).toBeTruthy();
    const habit = estCall![1] as { status?: string; establishedSince?: string };
    expect(habit.status).toBe('established');
    expect(habit.establishedSince).toBe('2016-06-27');
  });

  it('active 習慣は status を渡さない（active 既定・後方互換）', async () => {
    await runOnboardingWrite(input());
    const activeCall = insertHabitMock.mock.calls.find(
      (c) => (c[1] as { name: string }).name === '自炊する'
    );
    const habit = activeCall![1] as { status?: string; establishedSince?: string };
    expect(habit.status).toBeUndefined();
    expect(habit.establishedSince).toBeUndefined();
  });

  it('D5: trackedKpis に全4 KpiKey を保存する', async () => {
    await runOnboardingWrite(input());
    const [userId, payload] = upsertUserProfileMock.mock.calls[0];
    expect(userId).toBe('user-1');
    expect([...payload.trackedKpis].sort()).toEqual([...KPI_KEYS].sort());
    expect(payload.birthYear).toBe(new Date().getFullYear() - 42);
    expect(payload.gender).toBe('male');
    expect(payload.country).toBe('JP');
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
    const cookCall = replaceHabitEvidencesMock.mock.calls.find((c) => c[0] === 'id-自炊する');
    expect(cookCall).toBeTruthy();
    const evidences = cookCall![1] as { articleId: string; weight: number }[];
    expect(evidences).toEqual([
      { articleId: 'home_cooking', weight: 100 },
      { articleId: 'intermittent_fasting', weight: 100 },
    ]);
  });

  it('established が空でも active のみ書き込める', async () => {
    await runOnboardingWrite({ ...input(), established: [] });
    const names = insertHabitMock.mock.calls.map((c) => (c[1] as { name: string }).name);
    expect(names).toEqual(['自炊する', '毎日の節約']);
  });
});

describe('runOnboardingWrite — C-S14 失敗時の再試行（v2）', () => {
  it('insert 失敗時は OnboardingWriteError を投げ、成功済み presetId を載せる', async () => {
    // established は成功・最初の active で失敗
    insertHabitMock
      .mockImplementationOnce(async (_u: string, habit: { name: string }) => ({ id: `id-${habit.name}` }))
      .mockImplementationOnce(async () => {
        throw new Error('boom');
      });

    let caught: OnboardingWriteError | null = null;
    try {
      await runOnboardingWrite(input());
    } catch (e) {
      caught = e as OnboardingWriteError;
    }
    expect(caught).toBeInstanceOf(OnboardingWriteError);
    // established(quit_alcohol_habit) は成功済みとして集合に入る
    expect([...caught!.succeededPresetIds]).toContain('quit_alcohol_habit');
  });

  it('部分失敗→再試行で重複 insert しない（成功済みプリセットをスキップ）', async () => {
    insertHabitMock
      .mockImplementationOnce(async (_u: string, habit: { name: string }) => ({ id: `id-${habit.name}` }))
      .mockImplementationOnce(async () => {
        throw new Error('boom');
      });

    let succeeded = new Set<string>();
    try {
      await runOnboardingWrite(input());
    } catch (e) {
      succeeded = (e as OnboardingWriteError).succeededPresetIds;
    }

    insertHabitMock.mockReset();
    insertHabitMock.mockImplementation(async (_u: string, habit: { name: string }) => {
      callOrder.push(`habit:${habit.name}`);
      return { id: `id-${habit.name}` };
    });
    replaceHabitEvidencesMock.mockImplementation(async () => []);

    await runOnboardingWrite({ ...input(), completedPresetIds: succeeded });

    const insertedNames = insertHabitMock.mock.calls.map((c) => (c[1] as { name: string }).name);
    // 成功済み（アルコールを週100g（ビール500ml×5本）以内に抑える）は再 insert されない
    expect(insertedNames).not.toContain('アルコールを週100g（ビール500ml×5本）以内に抑える');
    expect(insertedNames).toContain('自炊する');
  });

  it('habit / active が空でも profile だけ書ける', async () => {
    await runOnboardingWrite({ ...input(), established: [], activePresetIds: [] });
    expect(upsertUserProfileMock).toHaveBeenCalledTimes(1);
    expect(insertHabitMock).not.toHaveBeenCalled();
  });
});
