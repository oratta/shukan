import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// user_profiles マイグレーション SQL の内容検証。
// RLS / CHECK の実 DB 検証はユニットでは不可（認証セッションが要る）ため、
// マイグレーション SQL の定義の存在で代替する（tasks.md / 指示どおり）。
// B-S2: gender の CHECK 制約 / B-S7: RLS 本人限定（select/insert/update のみ、delete なし）

const sql = readFileSync(
  join(__dirname, '../../supabase/migrations/20260612010000_user_profiles.sql'),
  'utf-8'
).toLowerCase();

describe('user_profiles migration: テーブル定義', () => {
  it('user_id を PK かつ auth.users を on delete cascade で参照する', () => {
    expect(sql).toMatch(/user_id\s+uuid\s+primary key\s+references\s+auth\.users\(id\)\s+on delete cascade/);
  });
  it('tracked_kpis は text\\[\\] not null default \'{}\'', () => {
    expect(sql).toMatch(/tracked_kpis\s+text\[\]\s+not null\s+default\s+'\{\}'/);
  });
  it('country は not null default \'jp\'', () => {
    expect(sql).toMatch(/country\s+text\s+not null\s+default\s+'jp'/);
  });
  it('currency は not null default \'jpy\'', () => {
    expect(sql).toMatch(/currency\s+text\s+not null\s+default\s+'jpy'/);
  });
  it('annual_income / birth_year は nullable（not null を付けない）', () => {
    expect(sql).toMatch(/annual_income\s+bigint(?!\s+not null)/);
    expect(sql).toMatch(/birth_year\s+integer(?!\s+not null)/);
  });
  it('派生値カラム（age / daily_wage / remaining_*）を持たない（D1）', () => {
    expect(sql).not.toMatch(/\bage\b\s+(integer|int|numeric)/);
    expect(sql).not.toContain('daily_wage');
    expect(sql).not.toContain('remaining_life_expectancy');
    expect(sql).not.toContain('remaining_working_years');
  });
});

describe('B-S2: gender CHECK 制約', () => {
  it("gender に check (gender in ('male','female','other','unspecified')) がある", () => {
    expect(sql).toMatch(
      /gender\s+text\s+not null\s+default\s+'unspecified'\s+check\s*\(\s*gender\s+in\s*\(\s*'male'\s*,\s*'female'\s*,\s*'other'\s*,\s*'unspecified'\s*\)\s*\)/
    );
  });
});

describe('B-S7: RLS は user_settings 同型（select/insert/update のみ、delete なし）', () => {
  it('row level security を有効化する', () => {
    expect(sql).toContain('enable row level security');
  });
  it('select / insert / update の 3 ポリシーを定義する', () => {
    expect(sql).toMatch(/create policy[^;]+for select/);
    expect(sql).toMatch(/create policy[^;]+for insert/);
    expect(sql).toMatch(/create policy[^;]+for update/);
  });
  it('delete ポリシーを定義しない', () => {
    expect(sql).not.toMatch(/for delete/);
  });
  it('全ポリシーが auth.uid() = user_id で本人限定', () => {
    const policyCount = (sql.match(/create policy/g) ?? []).length;
    const guardCount = (sql.match(/auth\.uid\(\)\s*=\s*user_id/g) ?? []).length;
    expect(policyCount).toBe(3);
    // select(using) + insert(with check) + update(using + with check) = 4 箇所
    expect(guardCount).toBe(4);
  });
});
