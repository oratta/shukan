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
    // [6] でチェックした「取り組む」習慣（チェック順は書き込み順に影響しない）
    chosenPresetIds: ['quit_smoking_for_health', 'daily_cardio_habit', 'solid_sleep'],
  };
}

describe('runOnboardingWrite — チェックした習慣を一律 active で登録', () => {
  it('profile → 習慣（15本の表示順）の順で書き込む', async () => {
    await runOnboardingWrite(input());
    expect(callOrder[0]).toBe('profile');
    // 表示順: daily_cardio(1番目) → solid_sleep(2番目) → quit_smoking(9番目)。全て active
    expect(callOrder).toEqual([
      'profile',
      'habit:少し息が切れるくらいの運動を毎日15分以上行う:active',
      'evidence:id-少し息が切れるくらいの運動を毎日15分以上行う',
      'habit:毎日6〜8時間の睡眠をとる:active',
      'evidence:id-毎日6〜8時間の睡眠をとる',
      'habit:タバコを1本も吸わない:active',
      'evidence:id-タバコを1本も吸わない',
    ]);
  });

  it('全ての習慣で status・established_since を渡さない（active 既定・established 自動変換は廃止）', async () => {
    await runOnboardingWrite(input());
    expect(insertHabitMock.mock.calls.length).toBe(3);
    for (const call of insertHabitMock.mock.calls) {
      const habit = call[1] as { status?: string; establishedSince?: string };
      expect(habit.status).toBeUndefined();
      expect(habit.establishedSince).toBeUndefined();
    }
  });

  it('チェックしていない習慣は insert されない', async () => {
    await runOnboardingWrite(input());
    const names = insertHabitMock.mock.calls.map((c) => (c[1] as { name: string }).name);
    expect(names).not.toContain('野菜・果物を1日5皿（約350g）食べる');
  });

  it('D5: trackedKpis に全4 KpiKey を保存する（[5] の選択は保存しない）', async () => {
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

// ───────── チェック0件でも完了できる（habit 0件・profile のみ） ─────────
describe('runOnboardingWrite — チェック0件（選ばずに始める）', () => {
  it('chosenPresetIds が空でも profile だけ書ける', async () => {
    await runOnboardingWrite({ ...input(), chosenPresetIds: [] });
    expect(upsertUserProfileMock).toHaveBeenCalledTimes(1);
    expect(insertHabitMock).not.toHaveBeenCalled();
  });

  it('未知プリセットIDが混ざっても insert されずエラーにもならない', async () => {
    await runOnboardingWrite({ ...input(), chosenPresetIds: ['___nope___'] });
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
