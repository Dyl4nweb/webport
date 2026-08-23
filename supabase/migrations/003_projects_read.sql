-- ═══════════════════════════════════════════════════════════════════
-- 003_projects_read.sql — Phase 5 (Projects CMS)
--
-- ADDITIVE ONLY:
--   • One read-only policy so the public site can render projects
--     from the database. Writes stay restricted to the admin
--     allowlist (existing "admin manages portfolio projects" policy).
--   • Two new defaulted columns for Phase 8 content truth-up,
--     added now so the CMS can store them from day one.
--
-- No DROP / ALTER of existing columns, no data changes.
-- ═══════════════════════════════════════════════════════════════════

create policy "public reads projects"
  on public.portfolio_projects
  for select
  to anon
  using (true);

alter table public.portfolio_projects
  add column if not exists overview text not null default '';

alter table public.portfolio_projects
  add column if not exists features jsonb not null default '[]'::jsonb;
