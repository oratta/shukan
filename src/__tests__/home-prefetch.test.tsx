import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * issue #59: ホーム初回ロードの habits+completions を Server Component で prefetch する。
 *
 * - fetchInitialHabitData: server クライアントで habits + completions を取得し、
 *   未ログイン / エラー時は null を返してクライアント側フォールバックに委ねる
 * - (app)/page.tsx: async Server Component として prefetch 結果を
 *   DashboardClient に initialData props で渡す
 * - useHabits: initialData を受けたときは初期表示のスピナー（loading=true）を出さない
 */

// --- Fake supabase client (server) --------------------------------------

interface FakeSupabaseOptions {
  user: { id: string } | null;
  habitsRows?: unknown[];
  completionRows?: unknown[];
  habitsError?: Error | null;
}

function makeFakeSupabase(opts: FakeSupabaseOptions) {
  const calls: { tables: string[] } = { tables: [] };
  const client = {
    auth: {
      getUser: async () => ({ data: { user: opts.user } }),
    },
    from(table: string) {
      calls.tables.push(table);
      const result =
        table === 'habits'
          ? { data: opts.habitsRows ?? [], error: opts.habitsError ?? null }
          : { data: opts.completionRows ?? [], error: null };
      const chain = {
        select: () => chain,
        gte: () => chain,
        order: () => Promise.resolve(result),
      };
      return chain;
    },
  };
  return { client, calls };
}

const habitRow = {
  id: 'h1',
  user_id: 'u1',
  name: '読書',
  description: null,
  life_significance: null,
  icon: 'book',
  frequency: 'everyday',
  custom_days: null,
  type: 'positive',
  weekly_target: null,
  created_at: '2026-01-01T00:00:00Z',
  archived: false,
  impact_article_id: null,
  sort_order: 0,
  status: 'active',
  established_since: null,
  habit_evidences: [],
};

const completionRow = {
  id: 'c1',
  user_id: 'u1',
  habit_id: 'h1',
  date: '2026-07-10',
  completed_at: '2026-07-10T09:00:00Z',
  status: 'completed',
  note: null,
};

// --- fetchInitialHabitData ------------------------------------------------

describe('fetchInitialHabitData (habits-server)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.doUnmock('@/lib/supabase/server');
  });

  it('ログイン済みなら habits + completions を server クライアントで取得して返す', async () => {
    const { client } = makeFakeSupabase({
      user: { id: 'u1' },
      habitsRows: [habitRow],
      completionRows: [completionRow],
    });
    vi.doMock('@/lib/supabase/server', () => ({
      createClient: async () => client,
    }));
    const { fetchInitialHabitData } = await import('@/lib/supabase/habits-server');

    const data = await fetchInitialHabitData();
    expect(data).not.toBeNull();
    expect(data!.habits).toHaveLength(1);
    expect(data!.habits[0]).toMatchObject({ id: 'h1', name: '読書', type: 'positive' });
    expect(data!.completions).toHaveLength(1);
    expect(data!.completions[0]).toMatchObject({
      habitId: 'h1',
      date: '2026-07-10',
      status: 'completed',
    });
  });

  it('未ログインなら null を返し、テーブルへのクエリを発行しない', async () => {
    const { client, calls } = makeFakeSupabase({ user: null });
    vi.doMock('@/lib/supabase/server', () => ({
      createClient: async () => client,
    }));
    const { fetchInitialHabitData } = await import('@/lib/supabase/habits-server');

    const data = await fetchInitialHabitData();
    expect(data).toBeNull();
    expect(calls.tables).toHaveLength(0);
  });

  it('取得エラー時は throw せず null（クライアント側フォールバック）', async () => {
    const { client } = makeFakeSupabase({
      user: { id: 'u1' },
      habitsError: new Error('boom'),
    });
    vi.doMock('@/lib/supabase/server', () => ({
      createClient: async () => client,
    }));
    const { fetchInitialHabitData } = await import('@/lib/supabase/habits-server');

    await expect(fetchInitialHabitData()).resolves.toBeNull();
  });

  it('DynamicServerError（digest=DYNAMIC_SERVER_USAGE）は握りつぶさず再 throw する', async () => {
    // build 時の静的レンダリング試行で cookies() が投げるエラー。Next.js の
    // dynamic 判定シグナルなので catch → null に落とすと build ログが汚れる（PR #79 指摘）
    const dynamicServerError = Object.assign(
      new Error('Dynamic server usage: Route / used `cookies`'),
      { digest: 'DYNAMIC_SERVER_USAGE' }
    );
    vi.doMock('@/lib/supabase/server', () => ({
      createClient: async () => {
        throw dynamicServerError;
      },
    }));
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const { fetchInitialHabitData } = await import('@/lib/supabase/habits-server');
      await expect(fetchInitialHabitData()).rejects.toBe(dynamicServerError);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });
});

// --- habit-list.tsx: DndContext の静的 id（hydration mismatch 回帰防止） ----

describe('habit-list.tsx DndContext', () => {
  it('DndContext に静的な id prop を渡している（dnd-kit 自動連番 id の SSR mismatch 防止）', () => {
    // 本 PR で習慣カードが SSR されるようになったため、id 無しだと server 側の
    // 自動連番（DndDescribedBy-N）がリクエスト毎に増えて client と恒常的に食い違う。
    // vitest は node 環境（jsdom 無し）のため、既存の page.tsx テストと同様に
    // ソースアサーションで回帰を防ぐ。
    const src = fs.readFileSync(
      path.resolve(__dirname, '../components/habits/habit-list.tsx'),
      'utf-8'
    );
    expect(src).toMatch(/<DndContext\s+id="habit-list-dnd"/);
  });
});

// --- fetchHabits / fetchCompletions のクライアント注入 ---------------------

describe('fetchHabits / fetchCompletions client injection', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('client を渡すとブラウザクライアントを生成せずにそれを使う', async () => {
    vi.doMock('@/lib/supabase/client', () => ({
      createClient: () => {
        throw new Error('browser client must not be created when injected');
      },
    }));
    const { fetchHabits, fetchCompletions } = await import('@/lib/supabase/habits');
    const { client } = makeFakeSupabase({
      user: { id: 'u1' },
      habitsRows: [habitRow],
      completionRows: [completionRow],
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const habits = await fetchHabits(client as any);
    expect(habits).toHaveLength(1);
    expect(habits[0].id).toBe('h1');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const completions = await fetchCompletions(90, client as any);
    expect(completions).toHaveLength(1);
    expect(completions[0].habitId).toBe('h1');
  });
});

// --- (app)/page.tsx: async Server Component ------------------------------

describe('(app)/page.tsx server component', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('prefetch した initialData を DashboardClient に渡す', async () => {
    const sentinel = { habits: [], completions: [] };
    vi.doMock('@/lib/supabase/habits-server', () => ({
      fetchInitialHabitData: vi.fn(async () => sentinel),
    }));
    const DashboardClient = vi.fn(() => null);
    vi.doMock('@/components/dashboard/dashboard-client', () => ({
      DashboardClient,
    }));

    const pageModule = await import('@/app/(app)/page');
    const element = await pageModule.default();

    expect(element.type).toBe(DashboardClient);
    expect(element.props.initialData).toBe(sentinel);
  });

  it('page.tsx は Server Component（use client 無し）で、dashboard-client は use client', () => {
    const pageSrc = fs.readFileSync(
      path.resolve(__dirname, '../app/(app)/page.tsx'),
      'utf-8'
    );
    expect(pageSrc).not.toMatch(/^\s*['"]use client['"]/m);
    expect(pageSrc).toMatch(/fetchInitialHabitData/);

    const clientSrc = fs.readFileSync(
      path.resolve(__dirname, '../components/dashboard/dashboard-client.tsx'),
      'utf-8'
    );
    expect(clientSrc).toMatch(/^['"]use client['"]/);
    expect(clientSrc).toMatch(/useHabits\(initialData/);
  });
});

// --- useHabits initial state ----------------------------------------------

describe('useHabits initial state helper', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('initialData ありなら loading=false（スピナーを出さない）で habits/completions が入る', async () => {
    const { computeInitialHabitState } = await import('@/hooks/useHabits');
    const initial = {
      habits: [{ id: 'h1' }],
      completions: [{ habitId: 'h1', date: '2026-07-10' }],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
    const state = computeInitialHabitState(initial);
    expect(state.loading).toBe(false);
    expect(state.habits).toHaveLength(1);
    expect(state.completions).toHaveLength(1);
  });

  it('initialData なし（null / undefined）なら従来どおり loading=true で空配列', async () => {
    const { computeInitialHabitState } = await import('@/hooks/useHabits');
    for (const v of [null, undefined]) {
      const state = computeInitialHabitState(v);
      expect(state.loading).toBe(true);
      expect(state.habits).toEqual([]);
      expect(state.completions).toEqual([]);
    }
  });
});
