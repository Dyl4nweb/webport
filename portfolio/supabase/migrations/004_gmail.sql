-- ═══════════════════════════════════════════════════════════════════
-- 004_gmail.sql — Phase 6 (Gmail integration, server-side OAuth)
--
-- SAFE BY DESIGN:
--   • Only CREATEs new objects (IF NOT EXISTS / OR REPLACE).
--   • integration_tokens has RLS enabled and ZERO policies — nobody
--     can read or write it through the normal PostgREST path.
--   • The ONLY door in is the three security-definer RPCs below,
--     each of which verifies the caller against admin_users.
--   • Tokens therefore never leave the server except through routes
--     that already require a verified admin session.
-- ═══════════════════════════════════════════════════════════════════

create table if not exists public.integration_tokens (
  provider text primary key,
  access_token text,
  refresh_token text,
  expires_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.integration_tokens enable row level security;

-- No policies on purpose — same model as admin_users.

create or replace function public.admin_get_integration_token(p_provider text)
returns public.integration_tokens
language sql
stable
security definer
set search_path = public
as $$
  select * from public.integration_tokens
  where provider = p_provider
    and exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

create or replace function public.admin_set_integration_token(
  p_provider text,
  p_access_token text,
  p_refresh_token text,
  p_expires_at timestamptz
)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.integration_tokens
    (provider, access_token, refresh_token, expires_at, updated_at)
  select p_provider, p_access_token, p_refresh_token, p_expires_at, now()
  where exists (select 1 from public.admin_users where user_id = auth.uid())
  on conflict (provider) do update
    set access_token = excluded.access_token,
        -- Google omits refresh_token on re-consent; keep the old one.
        refresh_token = coalesce(excluded.refresh_token,
                                 public.integration_tokens.refresh_token),
        expires_at = excluded.expires_at,
        updated_at = now();
$$;

create or replace function public.admin_delete_integration_token(p_provider text)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.integration_tokens
  where provider = p_provider
    and exists (select 1 from public.admin_users where user_id = auth.uid());
$$;
