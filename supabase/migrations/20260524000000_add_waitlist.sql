-- LP waitlist signup table
--
-- Captures early-access requests from the new Smitch LP (www.s-mitch.com).
-- See _longruns/2026-05-24_lp-image-code-workflow/plan.md (Data Model section)
-- and openspec/changes/lp-foundation/specs/lp-foundation/spec.md.
--
-- RLS is enabled. Only INSERT is allowed for anon/authenticated roles via the
-- "anyone can insert" policy. SELECT / UPDATE / DELETE require service_role
-- (Supabase Studio access) since no policy grants them to anon.

create table if not exists waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,

  -- 使いたい環境 (multi-select). At least one must be true (see check below).
  wants_web_pc boolean not null default false,
  wants_web_mobile boolean not null default false,
  wants_ios_mobile boolean not null default false,
  wants_android_mobile boolean not null default false,
  constraint at_least_one_env check (
    wants_web_pc
    or wants_web_mobile
    or wants_ios_mobile
    or wants_android_mobile
  ),

  -- 任意項目
  current_apps text,
  pain_points text,
  willingness_to_pay_jpy int check (
    willingness_to_pay_jpy is null
    or willingness_to_pay_jpy in (0, 300, 500, 1000, 2000, 3000)
  ),
  ideal_self text,
  source text,

  created_at timestamptz not null default now()
);

-- RLS
alter table waitlist enable row level security;

-- Public INSERT (the LP form posts via Server Action which uses anon key + RLS).
-- SELECT / UPDATE / DELETE intentionally have NO policy, so they are denied for
-- anon / authenticated and only service_role can read the data (Supabase Studio).
create policy "anyone can insert" on waitlist
  for insert
  with check (true);
