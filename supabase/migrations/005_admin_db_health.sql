-- ═══════════════════════════════════════════════════════════════════
-- 005_admin_db_health.sql — Database Health Monitoring (read-only)
--
-- SAFE BY DESIGN:
--   • Only CREATEs one new function (OR REPLACE). No ALTER / DROP,
--     no policy changes, no grants, no data touched.
--   • Pure catalog reads: pg_database_size() + pg_total_relation_size().
--   • SECURITY DEFINER with an in-function admin_users allowlist check,
--     identical trust model to the integration-token RPCs (004):
--     anon / ordinary authenticated callers receive NULL.
--   • Exposes ONLY byte sizes and timestamps — never credentials,
--     tokens, or row contents.
--
-- APPLY VIA: Supabase Dashboard → SQL Editor (run once).
-- ═══════════════════════════════════════════════════════════════════

create or replace function public.admin_db_health()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'database_size', pg_database_size(current_database()),
    'generated_at', now(),
    'largest_tables', (
      select coalesce(
        jsonb_agg(
          jsonb_build_object(
            'table',       c.relname,
            'total_bytes', pg_total_relation_size(c.oid)
          )
          order by pg_total_relation_size(c.oid) desc
        ),
        '[]'::jsonb
      )
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relkind = 'r'
    )
  )
  where exists (
    select 1 from public.admin_users where user_id = auth.uid()
  );
$$;
