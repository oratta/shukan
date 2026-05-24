/**
 * lp-foundation: Supabase migration for the waitlist table must mirror the
 * SQL Draft in plan.md (email unique, 4 env booleans, at_least_one_env check,
 * willingness_to_pay value-set check, RLS enabled, anon insert policy).
 */
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

const ROOT = path.resolve(__dirname, '../..');
const MIGRATION = path.join(
  ROOT,
  'supabase/migrations/20260524000000_add_waitlist.sql'
);

describe('lp-foundation / waitlist migration', () => {
  it('migration file exists', () => {
    expect(existsSync(MIGRATION)).toBe(true);
  });

  it('declares the waitlist table with required columns', () => {
    const sql = readFileSync(MIGRATION, 'utf8').toLowerCase();
    expect(sql).toMatch(/create\s+table\s+(?:if\s+not\s+exists\s+)?waitlist/);
    expect(sql).toMatch(/email\s+text\s+not\s+null\s+unique/);
    expect(sql).toContain('wants_web_pc boolean');
    expect(sql).toContain('wants_web_mobile boolean');
    expect(sql).toContain('wants_ios_mobile boolean');
    expect(sql).toContain('wants_android_mobile boolean');
  });

  it('enforces at_least_one_env check across the 4 env booleans', () => {
    const sql = readFileSync(MIGRATION, 'utf8').toLowerCase();
    expect(sql).toMatch(/constraint\s+at_least_one_env\s+check/);
    expect(sql).toContain('wants_web_pc');
    expect(sql).toContain('wants_android_mobile');
  });

  it('constrains willingness_to_pay_jpy to allowed values', () => {
    const sql = readFileSync(MIGRATION, 'utf8').toLowerCase();
    expect(sql).toMatch(/willingness_to_pay_jpy/);
    // The check must include the discrete value set 0, 300, 500, 1000, 2000, 3000
    for (const v of [0, 300, 500, 1000, 2000, 3000]) {
      expect(sql, `value ${v} missing from check`).toMatch(
        new RegExp(`\\b${v}\\b`)
      );
    }
  });

  it('enables RLS and adds an anon INSERT policy', () => {
    const sql = readFileSync(MIGRATION, 'utf8').toLowerCase();
    expect(sql).toMatch(/enable\s+row\s+level\s+security/);
    expect(sql).toMatch(/for\s+insert\s+with\s+check\s*\(\s*true\s*\)/);
  });

  it('has default created_at timestamp and uuid primary key', () => {
    const sql = readFileSync(MIGRATION, 'utf8').toLowerCase();
    expect(sql).toMatch(/id\s+uuid\s+primary\s+key/);
    // Accept `created_at timestamptz default now()` with optional `not null`
    expect(sql).toMatch(/created_at\s+timestamptz\s+(?:not\s+null\s+)?default\s+now\(\)/);
  });
});
