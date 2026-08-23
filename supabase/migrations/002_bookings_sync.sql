-- ═══════════════════════════════════════════════════════════════════
-- 002_bookings_sync.sql — Phase 4 (Cal.com bookings sync)
--
-- ADDITIVE ONLY:
--   • Two new nullable/defaulted columns on the existing bookings_cache.
--   • No DROP / ALTER of existing columns, no new tables, no policy
--     changes — the Phase 1 RLS policies keep working as-is.
--
--   timezone   → attendee timezone from Cal.com (display requirement)
--   synced_at  → per-row freshness marker; MAX(synced_at) across rows
--                powers the "last synced" staleness indicator.
-- ═══════════════════════════════════════════════════════════════════

alter table public.bookings_cache
  add column if not exists timezone text;

alter table public.bookings_cache
  add column if not exists synced_at timestamptz not null default now();
