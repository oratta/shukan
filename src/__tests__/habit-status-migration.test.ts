import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// habits テーブルへの status / established_since 列追加マイグレーションの SQL 内容検証。
// 実 DB の RLS / CHECK 検証はユニットでは不可（認証セッションが要る）ため、
// マイグレーション SQL 定義の存在で代替する（既存 user_profiles-migration.test.ts と同方針）。
// change-A: AC#5（後方互換・既定 'active'）/ AC#6（established_since nullable）

const sql = readFileSync(
  join(__dirname, '../../supabase/migrations/20260627000000_habit_status.sql'),
  'utf-8'
).toLowerCase();

describe('habit status migration: 列追加', () => {
  it('habits テーブルを alter table で変更する（既存テーブルを drop/recreate しない）', () => {
    expect(sql).toMatch(/alter table\s+(public\.)?habits/);
    expect(sql).not.toMatch(/drop table/);
    expect(sql).not.toMatch(/create table\s+(public\.)?habits/);
  });

  it('status を add column し、後方互換のため not null default \'active\' で追加する（AC#5）', () => {
    expect(sql).toMatch(
      /add column\s+(if not exists\s+)?status\s+text\s+not null\s+default\s+'active'/
    );
  });

  it('status に check (status in (\'active\',\'established\')) 制約を付ける', () => {
    expect(sql).toMatch(
      /check\s*\(\s*status\s+in\s*\(\s*'active'\s*,\s*'established'\s*\)\s*\)/
    );
  });

  it('established_since を nullable date で追加する（not null を付けない）（AC#6）', () => {
    expect(sql).toMatch(/add column\s+(if not exists\s+)?established_since\s+date(?!\s+not null)/);
  });
});

describe('habit status migration: 後方互換 / 非破壊', () => {
  it('既存 RLS ポリシーを破壊しない（drop policy を含まない）', () => {
    expect(sql).not.toMatch(/drop policy/);
  });
  it('既存行を壊す既定なし変更を行わない（status は default を持つ）', () => {
    // status が default を持たない not null 追加は既存行を壊すので禁止
    expect(sql).not.toMatch(/add column\s+(if not exists\s+)?status\s+text\s+not null\s*(;|check)/);
  });
});
