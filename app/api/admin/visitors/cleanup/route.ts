import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin/api-auth";

interface VisitorStatus {
  ok?: unknown;
  generated_at?: unknown;
  capacity_bytes?: unknown;
  retention_days?: unknown;
  page_views_bytes?: unknown;
  unique_visitors_bytes?: unknown;
  total_bytes?: unknown;
  page_views_count?: unknown;
  unique_visitors_count?: unknown;
  oldest_page_view?: unknown;
  oldest_unique_visitor?: unknown;
  cleanup_eligible_page_views?: unknown;
  cleanup_eligible_unique_visitors?: unknown;
}

interface UniqueVisitorRow {
  visitor_hash: string;
  ip_address: string | null;
  first_seen: string;
  last_seen: string;
  visit_count: number;
}

/**
 * GET /api/admin/visitors/cleanup — read-only visitor-data health.
 *
 * Returns storage metrics for the approved visitor tables (via the
 * admin-only `visitor_data_status()` RPC, migration 008) plus the ten
 * most recent unique visitors (hash, first-seen IP, counts) through
 * the caller's token-scoped admin session. RLS keeps both admin-only.
 */
export async function GET(request: NextRequest) {
  const { supabase, error } = await requireAdmin(request);
  if (error) return error;

  const { data, error: rpcError } = await supabase.rpc("visitor_data_status");

  const rawStatus = (Array.isArray(data) ? data[0] : data) as
    | VisitorStatus
    | null;

  if (rpcError || !rawStatus || typeof rawStatus.total_bytes !== "number") {
    // Migration 008 not applied yet — degrade to a clear unavailable state.
    return NextResponse.json({ ok: false, reason: "unavailable" });
  }

  const { data: recentRows, error: recentError } = await supabase
    .from("unique_visitors")
    .select(
      "visitor_hash, ip_address, first_seen, last_seen, visit_count"
    )
    .order("last_seen", { ascending: false })
    .limit(10);

  if (recentError) {
    console.error(
      "[visitors-cleanup] recent uniques failed:",
      recentError.message
    );
    return NextResponse.json({
      ok: true,
      status: rawStatus,
      recentUniqueVisitors: [],
      reason: "uniques_unavailable",
    });
  }

  return NextResponse.json({
    ok: true,
    status: rawStatus,
    recentUniqueVisitors: (recentRows ?? []) as UniqueVisitorRow[],
  });
}

function optionalInt(value: unknown, min: number, max: number): number | undefined {
  const n = typeof value === "number" ? Math.round(value) : NaN;
  if (!Number.isFinite(n)) return undefined;
  if (n < min || n > max) return undefined;
  return n;
}

/**
 * POST /api/admin/visitors/cleanup — run one bounded pruning pass.
 *
 * Passes through the admin/service-role guarded `prune_visitor_data()`
 * RPC (migration 008): oldest-first, batched, idempotent. Only the two
 * approved visitor tables are ever touched. Optional overrides arrive
 * in the JSON body and are sanitized server-side.
 */
export async function POST(request: NextRequest) {
  const { supabase, error } = await requireAdmin(request);
  if (error) return error;

  const body: unknown = await request.json().catch(() => null);

  const retainDays = optionalInt(
    (body as { retainDays?: unknown })?.retainDays,
    7,
    3650
  );
  const capacityBytes = optionalInt(
    (body as { capacityBytes?: unknown })?.capacityBytes,
    1_048_576, // ≥ 1 MiB
    Number.MAX_SAFE_INTEGER
  );
  const targetBytes = optionalInt(
    (body as { targetBytes?: unknown })?.targetBytes,
    1_048_576,
    Number.MAX_SAFE_INTEGER
  );

  const params: Record<string, number> = {};
  if (retainDays !== undefined) params.p_retain_days = retainDays;
  if (capacityBytes !== undefined) params.p_capacity_bytes = capacityBytes;
  if (targetBytes !== undefined) params.p_target_bytes = targetBytes;

  const { data, error: rpcError } = await supabase.rpc(
    "prune_visitor_data",
    params
  );

  if (rpcError) {
    console.error("[visitors-cleanup] prune failed:", rpcError.message);
    return NextResponse.json(
      { ok: false, reason: "unavailable", message: rpcError.message },
      { status: 503 }
    );
  }

  const report = (Array.isArray(data) ? data[0] : data) as
    | { ok?: boolean; reason?: string }
    | null;

  if (!report || report.ok !== true) {
    return NextResponse.json(
      { ok: false, reason: report?.reason ?? "forbidden" },
      { status: 403 }
    );
  }

  return NextResponse.json({ ok: true, report });
}
