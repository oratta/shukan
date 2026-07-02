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
    // タバコ=完璧(100%→established) / 運動=だいたい(70%→active) / 睡眠=たまに(30%→active)
    // / 野菜=やってない(0%→登録しない)
    rates: {
      quit_smoking_for_health: 1 as const,
      daily_cardio_habit: 0.7 as const,
      solid_sleep: 0.3 as const,
      eat_vegetables_habit: 0 as const,
    },
  };
}

describe('runOnboardingWrite — 達成率→status 自動変換（AC#10）', () => {
  it('profile → 習慣（15本の表示順）の順で書き込む', async () => {
    await runOnboardingWrite(input());
    expect(callOrder[0]).toBe('profile');
    // 表示順: daily_cardio(1番目・70%) → solid_sleep(2番目・30%) → quit_smoking(9番目・100%)
    // 野菜(0%)は登録されない
    expect(callOrder).toEqual([
      'profile',
      'habit:少し息が切れるくらいの運動を毎日15分以上行う:active',
      'evidence:id-少し息が切れるくらいの運動を毎日15分以上行う',
      'habit:毎日6〜8時間の睡眠をとる:active',
      'evidence:id-毎日6〜8時間の睡眠をとる',
      'habit:タバコを1本も吸わない:established',
      'evidence:id-タバコを1本も吸わない',
    ]);
  });

  it('達成率100% の習慣は status=established・established_since を渡さない（常に null）', async () => {
    await runOnboardingWrite(input());
    const estCall = insertHabitMock.mock.calls.find(
      (c) => (c[1] as { name: string }).name === 'タバコを1本も吸わない'
    );
    expect(estCall).toBeTruthy();
    const habit = estCall![1] as { status?: string; establishedSince?: string };
    expect(habit.status).toBe('established');
    expect(habit.establishedSince).toBeUndefined();
  });

  it('達成率70%/30% の習慣は status を渡さない（active 既定）', async () => {
    await runOnboardingWrite(input());
    for (const name of ['少し息が切れるくらいの運動を毎日15分以上行う', '毎日6〜8時間の睡眠をとる']) {
      const call = insertHabitMock.mock.calls.find(
        (c) => (c[1] as { name: string }).name === name
      );
      const habit = call![1] as { status?: string; establishedSince?: string };
      expect(habit.status).toBeUndefined();
      expect(habit.establishedSince).toBeUndefined();
    }
  });

  it('達成率0% の習慣は insert されない', async () => {
    await runOnboardingWrite(input());
    const names = insertHabitMock.mock.calls.map((c) => (c[1] as { name: string }).name);
    expect(names).not.toContain('野菜・果物を1日5皿（約350g）食べる');
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
    const cardioCall = replaceHabitEvidencesMock.mock.calls.find(
      (c) => c[0] === 'id-少し息が切れるくらいの運動を毎日15分以上行う'
    );
    expect(cardioCall).toBeTruthy();
    const evidences = cardioCall![1] as { articleId: string; weight: number }[];
    expect(evidences).toEqual([{ articleId: 'daily_cardio', weight: 100 }]);
  });
});

// ───────── AC#11: 全習慣 0% でも完了できる（habit 0件・profile のみ） ─────────
describe('runOnboardingWrite — 全習慣0%（AC#11）', () => {
  it('rates が空でも profile だけ書ける', async () => {
    await runOnboardingWrite({ ...input(), rates: {} });
    expect(upsertUserProfileMock).toHaveBeenCalledTimes(1);
    expect(insertHabitMock).not.toHaveBeenCalled();
  });

  it('全習慣0% でも profile だけ書ける（habit 0件）', async () => {
    await runOnboardingWrite({
      ...input(),
      rates: { quit_smoking_for_health: 0, daily_cardio_habit: 0, solid_sleep: 0 },
    });
    expect(upsertUserProfileMock).toHaveBeenCalledTimes(1);
    expect(insertHabitMock).not.toHaveBeenCalled();
  });
});

describe('runOnboardingWrite — C-S14 失敗時の再試行（v3）', () => {
  it('insert 失敗時は OnboardingWriteError を投げ、成功済み presetId を載せる', async () => {
    // 1本目（運動）成功・2本目（睡眠）で失敗
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
    // 運動（daily_cardio_habit）は成功済みとして集合に入る
    expect([...caught!.succeededPresetIds]).toContain('daily_cardio_habit');
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
    // 成功済み（運動）は再 insert されない
    expect(insertedNames).not.toContain('少し息が切れるくらいの運動を毎日15分以上行う');
    // 残り（睡眠・タバコ）は insert される
    expect(insertedNames).toContain('毎日6〜8時間の睡眠をとる');
    expect(insertedNames).toContain('タバコを1本も吸わない');
  });
});
