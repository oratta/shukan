import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * #101 レビューで検出した「行まるごと upsert が他デバイスの変更を巻き戻す」欠陥の回帰テスト。
 *
 * 欠陥の本質: 書き込みが行単位だと、変更していないカラムをこの端末の（他デバイスの変更を知らない）
 * ローカル値で埋めてしまう。よって書き込みが**カラム単位**であることをここで固定する。
 *
 * vitest は environment: 'node' のため、supabase ブラウザクライアントをモックして
 * 「DB へ実際に送られたペイロード」を直接検査する（手本: __tests__/subscriptions-mapping.test.ts）。
 */

interface Row {
  user_id: string;
  theme: string;
  locale: string;
  updated_at: string;
}

// --- フェイク DB（1 行だけ持つ user_settings） ---
let row: Row | null = null;
/** insert が走る直前に別デバイスが行を作るシナリオを注入するためのフック */
let beforeInsert: (() => void) | null = null;
/** DB に送られたペイロードの記録 */
let calls: { op: 'update' | 'insert'; payload: Record<string, unknown>; opts?: unknown }[] =
  [];

function applyUpdate(payload: Record<string, unknown>) {
  calls.push({ op: 'update', payload });
  if (!row) return { data: null, error: null }; // 0 行更新（行がまだ無い）
  row = { ...row, ...payload } as Row;
  return { data: row, error: null };
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: () => ({
      update: (payload: Record<string, unknown>) => ({
        eq: () => ({
          select: () => ({
            maybeSingle: async () => applyUpdate(payload),
            single: async () => {
              const r = applyUpdate(payload);
              return r.data
                ? r
                : { data: null, error: { message: 'no rows returned' } };
            },
          }),
        }),
      }),
      // supabase-js の upsert(..., { ignoreDuplicates: true }) = insert ... on conflict do nothing
      upsert: (payload: Record<string, unknown>, opts: unknown) => ({
        select: () => ({
          maybeSingle: async () => {
            beforeInsert?.();
            calls.push({ op: 'insert', payload, opts });
            if (row) return { data: null, error: null }; // 衝突 → 何もしない（既存行を保つ）
            row = { ...(payload as unknown as Row) };
            return { data: row, error: null };
          },
        }),
      }),
      select: () => ({
        maybeSingle: async () => ({ data: row, error: null }),
      }),
    }),
  }),
}));

import {
  fetchUserSettings,
  seedUserSettings,
  updateUserSettings,
} from './settings';

const UID = 'user-1';

beforeEach(() => {
  row = null;
  beforeInsert = null;
  calls = [];
});

describe('#101 updateUserSettings: 変更したカラムだけを送る（巻き戻り防止）', () => {
  it('テーマだけ変更したとき、ペイロードに locale を含めない', async () => {
    row = { user_id: UID, theme: 'dark', locale: 'ja', updated_at: 't0' };

    // 端末 B の開きっぱなしのタブ: ローカルの locale は stale な 'en'（DB は既に 'ja'）
    await updateUserSettings(UID, { theme: 'light' }, { theme: 'light', locale: 'en' });

    const update = calls.find((c) => c.op === 'update');
    expect(update).toBeDefined();
    expect(update!.payload).not.toHaveProperty('locale'); // ← ここが欠陥の再発検知点
    expect(update!.payload).toMatchObject({ theme: 'light' });
    expect(calls.some((c) => c.op === 'insert')).toBe(false);
  });

  it('ロケールだけ変更したとき、ペイロードに theme を含めない', async () => {
    row = { user_id: UID, theme: 'dark', locale: 'en', updated_at: 't0' };

    // 端末 B の stale なローカルテーマ 'light'（DB は既に 'dark'）
    await updateUserSettings(UID, { locale: 'ja' }, { theme: 'light', locale: 'ja' });

    const update = calls.find((c) => c.op === 'update');
    expect(update!.payload).not.toHaveProperty('theme');
    expect(update!.payload).toMatchObject({ locale: 'ja' });
  });

  it('レビューの再現シナリオ: 端末 A の locale 変更が、端末 B のテーマ変更で巻き戻らない', async () => {
    // DB 初期 {dark, en}。端末 B は同期済みタブ（ローカル: theme=dark / locale=en）を開いたまま
    row = { user_id: UID, theme: 'dark', locale: 'en', updated_at: 't0' };

    // 端末 A で「言語だけ」ja に変更
    await updateUserSettings(UID, { locale: 'ja' }, { theme: 'dark', locale: 'ja' });
    expect(row).toMatchObject({ theme: 'dark', locale: 'ja' });

    // 端末 B の開きっぱなしのタブ（locale は stale な 'en'）で「テーマだけ」light に変更
    await updateUserSettings(UID, { theme: 'light' }, { theme: 'light', locale: 'en' });

    // locale は端末 A の ja のまま。巻き戻らない（欠陥時はここが 'en' になった）
    expect(row).toMatchObject({ theme: 'light', locale: 'ja' });
    const applied = await fetchUserSettings();
    expect(applied).toMatchObject({ theme: 'light', locale: 'ja' });
  });

  it('行が無いときだけ両カラムを insert する（column default `ja` に到達させない）', async () => {
    row = null;

    await updateUserSettings(UID, { theme: 'dark' }, { theme: 'dark', locale: 'en' });

    const insert = calls.find((c) => c.op === 'insert');
    expect(insert).toBeDefined();
    expect(insert!.payload).toMatchObject({
      user_id: UID,
      theme: 'dark',
      locale: 'en', // 明示送信（省略すると DB の default 'ja' が発火する）
    });
    expect(insert!.opts).toMatchObject({ ignoreDuplicates: true });
    expect(row).toMatchObject({ theme: 'dark', locale: 'en' });
  });

  it('並行 insert（両端末が同時に「行が無い」と判断）でも、先に作られた行のカラムを壊さない', async () => {
    row = null;
    // 自分の update が 0 行 → insert する直前に、別デバイスが {system, ja} で行を作った
    beforeInsert = () => {
      row = { user_id: UID, theme: 'system', locale: 'ja', updated_at: 't0' };
      beforeInsert = null;
    };

    // こちらは「テーマだけ」dark に変更（ローカル locale は 'en'）
    const result = await updateUserSettings(
      UID,
      { theme: 'dark' },
      { theme: 'dark', locale: 'en' }
    );

    // on conflict do nothing で相手の行が残り、その後 theme カラムだけが update される
    expect(row).toMatchObject({ theme: 'dark', locale: 'ja' }); // locale は相手の ja のまま
    expect(result).toMatchObject({ theme: 'dark', locale: 'ja' });
    const updates = calls.filter((c) => c.op === 'update');
    expect(updates).toHaveLength(2);
    expect(updates[1].payload).not.toHaveProperty('locale');
  });
});

describe('#101 seedUserSettings: 既存行を上書きしない', () => {
  it('行が既にあれば null を返し、行を書き換えない', async () => {
    row = { user_id: UID, theme: 'dark', locale: 'ja', updated_at: 't0' };

    const seeded = await seedUserSettings(UID, { theme: 'system', locale: 'en' });

    expect(seeded).toBeNull();
    expect(row).toMatchObject({ theme: 'dark', locale: 'ja' }); // 他デバイスの設定が保たれる
  });

  it('行が無ければ両カラムで作る', async () => {
    row = null;

    const seeded = await seedUserSettings(UID, { theme: 'light', locale: 'ja' });

    expect(seeded).toMatchObject({ theme: 'light', locale: 'ja' });
    expect(calls[0].payload).toMatchObject({ theme: 'light', locale: 'ja' });
  });
});

describe('#101 書き込み経路の配線（ソースアサーション）', () => {
  const read = (p: string) => readFileSync(join(__dirname, '../..', p), 'utf-8');

  it('useSettings は行まるごとの upsert（upsertUserSettings）を使わない', () => {
    const src = read('hooks/useSettings.ts');
    expect(src).not.toContain('upsertUserSettings');
  });

  it('saveTheme は theme だけ、saveLocale は locale だけを patch として送る', () => {
    const src = read('hooks/useSettings.ts');
    expect(src).toMatch(/updateUserSettings\(\s*userId,\s*\{ theme: next \},/);
    expect(src).toMatch(/updateUserSettings\(\s*userId,\s*\{ locale: next \},/);
  });

  it('seed 経路は on conflict do nothing（ignoreDuplicates）で既存行を保護する', () => {
    const src = read('lib/supabase/settings.ts');
    expect(src).toContain('ignoreDuplicates: true');
  });
});
