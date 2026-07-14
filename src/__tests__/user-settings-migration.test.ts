import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// user_settings（#24 でアプリから参照を開始したテーブル）のマイグレーション SQL 検証。
// RLS / CHECK の実 DB 検証はユニットでは不可（認証セッションが要る）ため、
// マイグレーション SQL の定義の存在で代替する（user-profiles-migration.test.ts と同じ方針）。
// 新規マイグレーションは追加していない（既存 init_schema の定義をアプリ側が使うだけ）ので、
// 検証対象は init_schema.sql。

const sql = readFileSync(
  join(__dirname, '../../supabase/migrations/20260212000000_init_schema.sql'),
  'utf-8'
).toLowerCase();

// user_settings の create table ... ) ブロックだけを切り出す（他テーブルの定義を誤検出しないため）
const tableBlock = (() => {
  const start = sql.indexOf('create table public.user_settings');
  expect(start).toBeGreaterThan(-1);
  const end = sql.indexOf(');', start);
  return sql.slice(start, end);
})();

describe('user_settings migration: テーブル定義（#24 が読み書きするカラム）', () => {
  it('user_id を PK かつ auth.users を on delete cascade で参照する', () => {
    expect(tableBlock).toMatch(
      /user_id\s+uuid\s+primary key\s+references\s+auth\.users\(id\)\s+on delete cascade/
    );
  });

  it("theme は not null default 'system' で light|dark|system の CHECK 制約を持つ", () => {
    expect(tableBlock).toMatch(
      /theme\s+text\s+not null\s+default\s+'system'\s+check\s*\(\s*theme\s+in\s*\(\s*'light'\s*,\s*'dark'\s*,\s*'system'\s*\)\s*\)/
    );
  });

  it('locale は not null で en|ja の CHECK 制約を持つ', () => {
    expect(tableBlock).toMatch(
      /locale\s+text\s+not null\s+default\s+'(en|ja)'\s+check\s*\(\s*locale\s+in\s*\(\s*'en'\s*,\s*'ja'\s*\)\s*\)/
    );
  });

  it('updated_at は timestamptz not null（アプリ側が upsert 時に明示更新する）', () => {
    expect(tableBlock).toMatch(/updated_at\s+timestamptz\s+not null/);
  });

  it('アプリ型（SettingsTheme / SettingsLocale）に無い値を CHECK で許していない', () => {
    // theme / locale の許容値は settings-shared.ts のユニオン型と 1 対 1 で一致していること
    const themeValues = /check\s*\(\s*theme\s+in\s*\(([^)]*)\)/.exec(tableBlock)?.[1] ?? '';
    const localeValues = /check\s*\(\s*locale\s+in\s*\(([^)]*)\)/.exec(tableBlock)?.[1] ?? '';
    expect(themeValues.split(',').map((s) => s.trim().replace(/'/g, '')).sort()).toEqual(
      ['dark', 'light', 'system']
    );
    expect(localeValues.split(',').map((s) => s.trim().replace(/'/g, '')).sort()).toEqual(
      ['en', 'ja']
    );
  });
});

describe('user_settings: RLS は本人限定（select/insert/update のみ、delete なし）', () => {
  // user_settings に関わる create policy 文だけを（文単位で）切り出す。
  // 他テーブルのポリシー文を巻き込まないよう、';' 区切りの statement 単位で絞る。
  const policies = sql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.startsWith('create policy') && s.includes('on public.user_settings'));
  const policyBlock = policies.join('\n');

  it('row level security を有効化する', () => {
    expect(sql).toContain('alter table public.user_settings enable row level security');
  });

  it('select / insert / update の 3 ポリシーを定義する', () => {
    expect(policyBlock).toMatch(/for select/);
    expect(policyBlock).toMatch(/for insert/);
    expect(policyBlock).toMatch(/for update/);
    expect(policies.length).toBe(3);
  });

  it('delete ポリシーを定義しない（行の削除は delete-user Edge Function の service role 経由のみ）', () => {
    expect(policyBlock).not.toMatch(/for delete/);
  });

  it('全ポリシーが auth.uid() = user_id で本人限定（他人の設定を読み書きできない）', () => {
    // select(using) + insert(with check) + update(using + with check) = 4 箇所
    expect((policyBlock.match(/auth\.uid\(\)\s*=\s*user_id/g) ?? []).length).toBe(4);
  });
});
