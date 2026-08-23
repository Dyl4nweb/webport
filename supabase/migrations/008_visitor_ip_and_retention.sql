-- ═══════════════════════════════════════════════════════════════════
-- 008_visitor_ip_and_retention.sql — Visitor IP monitoring + retention
--
-- ADDITIVE / SAFE BY DESIGN (no existing migrations modified):
--
--   PART A — Admin-only unique-visitor IP monitoring
--     • unique_visitors.ip_address (text, nullable). Captured ONCE at
--       first-seen only; returning visitors keep their original value.
--       Historical rows remain NULL — IPs were never stored before.
--     • track_unique_visitor() gains an optional p_ip argument
--       (default NULL) — fully backward compatible.
--     • Visibility unchanged: SELECT stays locked to public.is_admin()
--       through the existing "admins read unique visitors" policy
--       (migration 006). Anonymous/public clients have no read path.
--
--   PART B — Visitor-data retention & capacity safety
--     • visitor_data_status(): admin-only size/report RPC built on
--       pg_total_relation_size (real catalog metadata, not guesses).
--     • prune_visitor_data(): conservative oldest-first pruning.
--         - Age rule: page_views.created_at / unique_visitors.last_seen
--           older than p_retain_days (default 180) are removed,
--           oldest first, in bounded batches.
--         - Size rule: while combined visitor-table bytes exceed
--           p_capacity_bytes (default 64 MiB), the largest table is
--           trimmed oldest-first down to p_target_bytes (48 MiB),
--           giving headroom below any project-wide capacity limits.
--         - Bounded: ≤ 10 batches × p_max_batch (default 5,000) rows
--           per table per invocation for the age rule, ≤ 20 batches
--           for the size rule. Idempotent and safe to run repeatedly;
--           space is reclaimed by autovacuum over time.
--         - Callable ONLY by admin-allowlist members or service_role.
--     • Never touches: visitors counter, bookings_cache, inquiries,
--       portfolio_projects, certificates, activity_log, admin_users,
--       integration_tokens or Storage.
--
-- NOTE ON RETENTION TRADE-OFF: pruning a unique_visitors row whose
-- last_seen is older than the retention window means that identity,
-- if it ever returns, is counted as a new unique visitor. The window
-- is intentionally long (180 days) to keep this impact negligible.
--
-- APPLY VIA: Supabase Dashboard → SQL Editor (run once).
-- NOT applied automatically by this repository.
-- ═══════════════════════════════════════════════════════════════════

-- ─── PART A — IP capture ───────────────────────────────────────────

alter table public.unique_visitors
  add column if not exists ip_address text;

create or replace function public.track_unique_visitor(
  p_hash text,
  p_ip   text default null
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total bigint;
begin
  insert into public.unique_visitors (visitor_hash, ip_address)
  values (p_hash, nullif(trim(p_ip), ''))
  on conflict (visitor_hash)
  do update set
    last_seen   = now(),
    visit_count = public.unique_visitors.visit_count + 1;

  select count(*) into v_total from public.unique_visitors;
  return v_total;
end;
$$;

-- ─── PART B — Size reporting (admin-only) ─────────────────────────

create or replace function public.visitor_data_status(
  p_capacity_bytes bigint default 67108864,  -- 64 MiB combined budget
  p_retain_days    int    default 180
)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'ok', true,
    'generated_at', now(),
    'capacity_bytes', p_capacity_bytes,
    'retention_days', p_retain_days,
    'page_views_bytes',
      pg_total_relation_size('public.page_views'::regclass),
    'unique_visitors_bytes',
      pg_total_relation_size('public.unique_visitors'::regclass),
    'total_bytes',
      pg_total_relation_size('public.page_views'::regclass)
        + pg_total_relation_size('public.unique_visitors'::regclass),
    'page_views_count',      (select count(*) from public.page_views),
    'unique_visitors_count', (select count(*) from public.unique_visitors),
    'oldest_page_view',      (select min(created_at) from public.page_views),
    'oldest_unique_visitor', (select min(first_seen) from public.unique_visitors),
    'cleanup_eligible_page_views',
      (select count(*) from public.page_views
        where created_at < now() - make_interval(days => greatest(p_retain_days, 7))),
    'cleanup_eligible_unique_visitors',
      (select count(*) from public.unique_visitors
        where last_seen < now() - make_interval(days => greatest(p_retain_days, 7)))
  )
  where exists (
    select 1 from public.admin_users where user_id = auth.uid()
  );
$$;

-- ─── PART B — Conservative pruning (admin or service_role only) ──

create or replace function public.prune_visitor_data(
  p_retain_days    int    default 180,
  p_capacity_bytes bigint default 67108864,  -- trigger threshold
  p_target_bytes   bigint default 50331648,  -- trim down to this
  p_max_batch      int    default 5000
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cutoff        timestamptz;
  v_batch         bigint;
  v_del_views     bigint := 0;
  v_del_uniques   bigint := 0;
  v_bytes_before  bigint;
  v_bytes_after   bigint;
  v_views_bytes   bigint;
  v_uniques_bytes bigint;
  v_rounds        int;
begin
  if not (
    coalesce(public.is_admin(), false)
    or coalesce(nullif(auth.role(), ''), '') = 'service_role'
  ) then
    return jsonb_build_object('ok', false, 'reason', 'forbidden');
  end if;

  -- Sanitize arguments: retention never shorter than 7 days; batches
  -- stay small so no invocation can delete unbounded history.
  p_retain_days := greatest(coalesce(p_retain_days, 180), 7);
  p_max_batch   := least(greatest(coalesce(p_max_batch, 5000), 100), 20000);
  v_cutoff      := now() - make_interval(days => p_retain_days);

  v_bytes_before :=
      pg_total_relation_size('public.page_views'::regclass)
    + pg_total_relation_size('public.unique_visitors'::regclass);

  -- ── Rule 1: age-based retention (oldest rows first) ──────────────

  v_rounds := 0;
  loop
    exit when v_rounds >= 10;

    delete from public.page_views pv
    using (
      select id
      from public.page_views
      where created_at < v_cutoff
      order by created_at asc
      limit p_max_batch
    ) old_rows
    where pv.id = old_rows.id;

    get diagnostics v_batch = row_count;
    exit when v_batch = 0;

    v_del_views := v_del_views + v_batch;
    v_rounds    := v_rounds + 1;
  end loop;

  v_rounds := 0;
  loop
    exit when v_rounds >= 10;

    delete from public.unique_visitors uv
    using (
      select id
      from public.unique_visitors
      where last_seen < v_cutoff
      order by last_seen asc
      limit p_max_batch
    ) old_rows
    where uv.id = old_rows.id;

    get diagnostics v_batch = row_count;
    exit when v_batch = 0;

    v_del_uniques := v_del_uniques + v_batch;
    v_rounds      := v_rounds + 1;
  end loop;

  -- ── Rule 2: capacity safety (only when above the budget) ─────────
  -- Enters only past p_capacity_bytes; restores headroom down to
  -- p_target_bytes. Hard-capped at 20 batches per invocation.

  v_views_bytes   := pg_total_relation_size('public.page_views'::regclass);
  v_uniques_bytes := pg_total_relation_size('public.unique_visitors'::regclass);

  if v_views_bytes + v_uniques_bytes > p_capacity_bytes then
    v_rounds := 0;
    loop
      exit when v_rounds >= 20;

      exit when v_views_bytes + v_uniques_bytes <= p_target_bytes;

      if v_views_bytes >= v_uniques_bytes then
        delete from public.page_views pv
        using (
          select id
          from public.page_views
          order by created_at asc
          limit p_max_batch
        ) oldest
        where pv.id = oldest.id;

        get diagnostics v_batch = row_count;
      else
        delete from public.unique_visitors uv
        using (
          select id
          from public.unique_visitors
          order by last_seen asc
          limit p_max_batch
        ) oldest
        where uv.id = oldest.id;

        get diagnostics v_batch = row_count;
      end if;

      exit when v_batch = 0;  -- nothing left to trim; stop safely

      v_views_bytes   := pg_total_relation_size('public.page_views'::regclass);
      v_uniques_bytes := pg_total_relation_size('public.unique_visitors'::regclass);
      v_rounds        := v_rounds + 1;
    end loop;
  end if;

  v_bytes_after :=
      pg_total_relation_size('public.page_views'::regclass)
    + pg_total_relation_size('public.unique_visitors'::regclass);

  return jsonb_build_object(
    'ok',                     true,
    'ran_at',                 now(),
    'retain_days',            p_retain_days,
    'deleted_page_views',     v_del_views,
    'deleted_unique_visitors',v_del_uniques,
    'visitor_bytes_before',   v_bytes_before,
    'visitor_bytes_after',    v_bytes_after
  );
end;
$$;
