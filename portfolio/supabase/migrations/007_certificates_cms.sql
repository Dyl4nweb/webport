-- ═══════════════════════════════════════════════════════════════════
-- 007_certificates_cms.sql — Admin Certificate CRUD
--
-- ADDITIVE ONLY:
--   • New table mirroring the existing static Certificate shape
--     (data/certificates.ts): title, issuer, category, year, logo,
--     image, description, verify_url.
--   • published flag + sort_order for admin control.
--   • Public read via anon SELECT policy (same convention as
--     portfolio_projects); all writes restricted to the admin
--     allowlist through public.is_admin().
--
-- No modification of migrations 001–006 or any existing table.
-- Apply manually via Supabase SQL Editor.
-- ═══════════════════════════════════════════════════════════════════

create table if not exists public.certificates (
  id          uuid primary key default gen_random_uuid(),
  title       text        not null,
  issuer      text        not null default '',
  category    text        not null default '',
  year        text        not null default '',
  logo        text        not null default '',
  image       text        not null default '',
  description text        not null default '',
  verify_url  text,
  published   boolean     not null default true,
  sort_order  int         not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.certificates enable row level security;

create index if not exists certificates_sort_idx
  on public.certificates (sort_order);

create policy "public reads certificates"
  on public.certificates
  for select
  to anon
  using (true);

create policy "admin manages certificates"
  on public.certificates
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
