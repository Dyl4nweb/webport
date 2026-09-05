-- ═══════════════════════════════════════════════════════════════════
-- 012_admin_todos_reminders.sql — Add reminder fields to admin_todos
-- ═══════════════════════════════════════════════════════════════════

alter table public.admin_todos 
  add column if not exists remind_at timestamptz,
  add column if not exists notified boolean not null default false;

create index if not exists admin_todos_remind_at_idx
  on public.admin_todos (remind_at) where remind_at is not null and notified = false;
