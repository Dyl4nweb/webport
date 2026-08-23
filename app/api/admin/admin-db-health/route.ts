import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin/api-auth";

interface HealthPayload {
  database_size?: unknown;
  generated_at?: unknown;
  largest_tables?: unknown;
}

/**
 * GET /api/admin/db-health — read-only PostgreSQL storage metrics.
 *
 * Passes through the admin-only `admin_db_health()` RPC (migration 005).
 * Returns ok:false when the function is not applied yet or the caller
 * is not on the admin allowlist — the UI renders its unavailable state.
 */
export async function GET(request: NextRequest) {
  const { supabase, error } = await requireAdmin(request);
  if (error) return error;

  const { data, error: rpcError } = await supabase.rpc("admin_db_health");

  if (rpcError) {
    console.error("[admin-db-health] rpc failed:", rpcError.message);
    return NextResponse.json({ ok: false, reason: "unavailable" });
  }

  const payload = (Array.isArray(data) ? data[0] : data) as HealthPayload | null;

  if (!payload || typeof payload.database_size !== "number") {
    return NextResponse.json({ ok: false, reason: "unavailable" });
  }

  const rawTables = Array.isArray(payload.largest_tables)
    ? payload.largest_tables
    : [];

  const largestTables = rawTables
    .map((entry) => {
      const row = entry as { table?: unknown; total_bytes?: unknown };
      return {
        table: typeof row.table === "string" ? row.table : "",
        totalBytes: typeof row.total_bytes === "number" ? row.total_bytes : 0,
      };
    })
    .filter((row) => row.table !== "");

  return NextResponse.json({
    ok: true,
    databaseSize: payload.database_size,
    largestTables,
    generatedAt:
      typeof payload.generated_at === "string" ? payload.generated_at : null,
  });
}
