-- Fix: claim_founding_slot was still executable by anon/authenticated.
--
-- 20260612000200 tried to lock the RPC down with:
--   revoke execute on function public.claim_founding_slot(...) from anon, authenticated;
-- but Postgres grants EXECUTE to PUBLIC by default on function creation, and
-- revoking from anon/authenticated does NOT remove the PUBLIC grant. The role
-- membership (anon/authenticated ⊆ PUBLIC) meant both roles could still call it.
--
-- Impact: claim_founding_slot is SECURITY DEFINER (bypasses RLS) and accepts the
-- user id and cap values as caller-supplied arguments. Left callable by anon, any
-- client could mint a founder_50 (50% lifetime discount) membership for an arbitrary
-- user without paying, and pass inflated caps to bypass the founding-slot scarcity
-- limit entirely. It must only be reachable by the service role from the webhook.
--
-- Correct fix: revoke from PUBLIC. service_role keeps its explicit grant.

revoke execute on function public.claim_founding_slot(uuid, int, int, text)
  from public;

-- Belt-and-suspenders: ensure the intended caller still has execute.
grant execute on function public.claim_founding_slot(uuid, int, int, text)
  to service_role;
