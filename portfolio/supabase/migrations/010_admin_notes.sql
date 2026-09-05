-- ═══════════════════════════════════════════════════════════════════
-- 010_admin_notes.sql — Admin Notes Feature
-- ═══════════════════════════════════════════════════════════════════

create table if not exists public.admin_notes (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admin_notes enable row level security;

create index if not exists admin_notes_created_idx
  on public.admin_notes (created_at desc);

-- Admin allowlist: full CRUD, but ONLY for users in admin_users.
create policy "admin manages notes"
  on public.admin_notes for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());
