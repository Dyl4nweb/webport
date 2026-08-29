-- ═══════════════════════════════════════════════════════════════════
-- 006_unique_visitors.sql — Lifetime unique-visitor tracking
--
-- ADDITIVE ONLY:
--   • unique_visitors: one row per distinct visitor identity.
--     Identity = server-side sha256(ip|user-agent). Raw IP addresses
--     and user-agent strings are NEVER stored.
--   • Writes happen ONLY through track_unique_visitor() (security
--     definer). Anon clients cannot INSERT or SELECT rows directly,
--     so hashes cannot be enumerated from the browser.
--   • Admins get read access for monitoring; deletion flows through
--     the existing requireAdmin() cleanup endpoint.
--
-- The lifetime counter (visitors table / increment_visitors()) is
-- untouched by this migration.
-- ═══════════════════════════════════════════════════════════════════

create table if not exists public.unique_visitors (
  id           bigint generated always as identity primary key,
  visitor_hash text        not null unique,
  first_seen   timestamptz not null default now(),
  last_seen    timestamptz not null default now(),
  visit_count  bigint      not null default 1,
  created_at   timestamptz not null default now()
);

alter table public.unique_visitors enable row level security;

create index if not exists unique_visitors_last_seen_idx
  on public.unique_visitors (last_seen desc);

create policy "admins read unique visitors"
  on public.unique_visitors
  for select
  to authenticated
  using (public.is_admin());

create or replace function public.track_unique_visitor(p_hash text)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total bigint;
begin
  insert into public.unique_visitors (visitor_hash)
  values (p_hash)
  on conflict (visitor_hash)
  do update set
    last_seen   = now(),
    visit_count = public.unique_visitors.visit_count + 1;

  select count(*) into v_total from public.unique_visitors;
  return v_total;
end;
$$;
