-- waitlist: Founding Member ティザー (/founding) のメール登録を保存する。
-- change-C (founding-teaser-waitlist) の一部。change-D の design D4 に対応。
--
-- ============================================================================
-- なぜ anon INSERT を許可するのか（コードベース初の前例）
-- ============================================================================
-- これまで全テーブルの RLS は per-user（auth.uid() = user_id）だった。
-- waitlist は「未ログインの訪問者がメールアドレスを残す」公開フォームのため、
-- ログインを要求できない。よって anon ロールに INSERT のみを許可する。
-- これは公開フォームの標準パターンであり、change-C design D4 で確定済み。
--
-- ============================================================================
-- なぜ SELECT を service_role のみに制限するのか
-- ============================================================================
-- 収集したメールアドレスは個人情報であり、anon に読み出しを許すと
-- 全員のメールが流出する。よって SELECT/UPDATE/DELETE ポリシーは一切作らない。
-- ポリシーが無いロール（anon / authenticated）は RLS により読めない。
-- 読み出しは RLS を bypass する service_role（管理スクリプト / ダッシュボード）のみ。
--
-- ============================================================================
-- 濫用対策（anon INSERT を開けることへの防御）
-- ============================================================================
-- 1. unique(email): 同じメールの重複行を DB レベルで禁止。アプリは upsert で無害化。
-- 2. email 形式 CHECK 制約: 明らかに不正な値を DB レベルで弾く最終防衛線。
--    （厳密な形式バリデーションは Server Action 側で実施。CHECK は緩い形式チェック）
-- 3. upsert 無害化: アプリは onConflict='email', ignoreDuplicates で書き込むため、
--    重複登録はエラーにならず行も増えない（登録済みかどうかの情報も漏れない）。
-- CAPTCHA / IP rate limit 等の本格 bot 対策は Non-Goals（濫用観測時に後続対応）。

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  locale text not null default 'en',
  source text not null default 'founding-teaser',
  created_at timestamptz not null default now(),
  -- 緩い形式チェック（最終防衛線）。厳密なバリデーションは Server Action 側。
  constraint waitlist_email_format check (email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$')
);

alter table public.waitlist enable row level security;

-- INSERT のみ anon / authenticated に許可（公開フォーム）。
-- with check (true): email/locale/source の値の妥当性は CHECK 制約と Server Action が担保する。
create policy "Anyone can join the waitlist"
  on public.waitlist for insert
  to anon, authenticated
  with check (true);

-- SELECT / UPDATE / DELETE ポリシーは意図的に作らない。
-- 読み出しは service_role（RLS bypass）のみ。anon / authenticated は読めない。
