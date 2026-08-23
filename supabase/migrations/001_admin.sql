-- ═══════════════════════════════════════════════════════════════════
-- 001_admin.sql — Admin Dashboard foundation
--
-- SAFE BY DESIGN:
--   • Only CREATEs new objects (IF NOT EXISTS / OR REPLACE).
--   • Never touches the existing `visitors` table or `increment_visitors`
--     RPC, their data, or their policies.
--   • No DROP / ALTER of any existing object.
--
-- SECURITY MODEL (single-admin):
--   • `admin_users` is an allowlist. A policy applies ONLY when the
--     calling user's auth.uid() is present in that table.
--   • Ordinary authenticated users (if one is ever created) can do
--     NOTHING to these tables — every admin policy checks is_admin().
--   • Anonymous visitors may only INSERT inquiries and page_views.
--
-- SETUP AFTER RUNNING (Supabase dashboard):
--   1. Authentication → Users → Add user  (your admin email + password)
--   2. Copy the new user's UUID, then run:
--        insert into public.admin_users (user_id)
--        values ('PASTE-USER-UUID-HERE');
--      (Runs as service role from the SQL editor — bypasses RLS.)
-- ═══════════════════════════════════════════════════════════════════

-- ─── Admin allowlist ──────────────────────────────────────────────

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

-- No policies on purpose: manageable only via the SQL editor /
-- service role. The helper below reads it with elevated rights.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users where user_id = auth.uid()
  );
$$;

-- ─── Inquiries (contact form submissions) ─────────────────────────

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  status text not null default 'new'
    check (status in ('new', 'contacted', 'in_progress', 'completed')),
  created_at timestamptz not null default now()
);

alter table public.inquiries enable row level security;

create index if not exists inquiries_created_idx
  on public.inquiries (created_at desc);

-- ─── Page views (privacy-safe analytics) ──────────────────────────
-- No IP addresses, no user agents, no cookies — path + coarse device only.

create table if not exists public.page_views (
  id bigint generated always as identity primary key,
  path text not null,
  referrer text,
  device text not null default 'desktop'
    check (device in ('mobile', 'tablet', 'desktop')),
  created_at timestamptz not null default now()
);

alter table public.page_views enable row level security;

create index if not exists page_views_created_idx
  on public.page_views (created_at desc);

create index if not exists page_views_path_idx
  on public.page_views (path);

-- ─── Portfolio projects (CMS mirror of the Project type) ──────────

create table if not exists public.portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  tagline text not null default '',
  description text not null default '',
  role text not null default '',
  year text not null default '',
  category text not null default 'Web App',
  image text not null default '',
  screenshots jsonb not null default '[]'::jsonb,
  tech_stack text[] not null default '{}',
  live_url text,
  repo_url text,
  featured boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.portfolio_projects enable row level security;

create index if not exists portfolio_projects_sort_idx
  on public.portfolio_projects (sort_order);

-- ─── Bookings cache (Cal.com sync target — used in Phase 4) ───────

create table if not exists public.bookings_cache (
  id uuid primary key default gen_random_uuid(),
  cal_booking_uid text not null unique,
  name text not null default '',
  email text not null default '',
  title text not null default '',
  start_time timestamptz,
  status text not null default 'accepted',
  created_at timestamptz not null default now()
);

alter table public.bookings_cache enable row level security;

create index if not exists bookings_start_idx
  on public.bookings_cache (start_time);

-- ─── Activity log (unified event feed) ────────────────────────────

create table if not exists public.activity_log (
  id bigint generated always as identity primary key,
  type text not null
    check (type in ('inquiry', 'booking', 'email', 'project', 'visitor')),
  title text not null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.activity_log enable row level security;

create index if not exists activity_created_idx
  on public.activity_log (created_at desc);

-- ═══════════════════════════════════════════════════════════════════
--  ROW LEVEL SECURITY POLICIES
-- ═══════════════════════════════════════════════════════════════════

-- Anonymous visitors: INSERT-only on the two public intake tables.

create policy "anon inserts inquiries"
  on public.inquiries for insert to anon
  with check (true);

create policy "anon inserts page views"
  on public.page_views for insert to anon
  with check (true);

-- Admin allowlist: full CRUD, but ONLY for users in admin_users.

create policy "admin manages inquiries"
  on public.inquiries for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "admin manages page views"
  on public.page_views for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "admin manages portfolio projects"
  on public.portfolio_projects for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "admin manages bookings cache"
  on public.bookings_cache for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "admin manages activity log"
  on public.activity_log for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());
