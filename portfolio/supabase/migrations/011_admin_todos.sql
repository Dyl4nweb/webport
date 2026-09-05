-- ═══════════════════════════════════════════════════════════════════
-- 011_admin_todos.sql — Admin Todo List Feature
-- ═══════════════════════════════════════════════════════════════════

create table if not exists public.admin_todos (
  id uuid primary key default gen_random_uuid(),
  task text not null,
  is_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admin_todos enable row level security;

create index if not exists admin_todos_created_idx
  on public.admin_todos (created_at desc);

-- Admin allowlist: full CRUD, but ONLY for users in admin_users.
create policy "admin manages todos"
  on public.admin_todos for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());
