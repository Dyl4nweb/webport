import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin/api-auth";

/**
 * Admin-only storage maintenance endpoint.
 *
 * DELETION SCOPE — hard allowlist. Anything absent from this set is
 * refused before any database call happens, which permanently blocks
 * visitors, portfolio_projects, activity_log, admin_users, and
 * integration_tokens from every code path in this file.
 */
const ELIGIBLE_TABLES = new Set([
  "page_views",
  "bookings_cache",
  "inquiries",
  "unique_visitors",
]);

const ACTIVITY_TYPES: Record<string, string> = {
  page_views: "visitor",
  bookings_cache: "booking",
  inquiries: "inquiry",
  unique_visitors: "visitor",
};

const MAX_IDS = 500;
const DAY_MS = 24 * 60 * 60 * 1000;
const ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

function fail(reason: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ ok: false, reason, ...extra }, { status });
}

interface Payload {
  action?: unknown;
  table?: unknown;
  olderThanDays?: unknown;
  ids?: unknown;
  confirmCount?: unknown;
}

export async function POST(request: NextRequest) {
  const { supabase, error } = await requireAdmin(request);
  if (error) return error;

  const body = (await request.json().catch(() => null)) as Payload | null;
  if (!body || typeof body !== "object") return fail("invalid_body");

  const action = body.action;
  if (action !== "preview" && action !== "delete") return fail("invalid_action");

  const table = body.table;
  if (typeof table !== "string" || !ELIGIBLE_TABLES.has(table)) {
    return fail("protected_or_unknown_table", 403);
  }

  const daysRaw = body.olderThanDays;
  const idsRaw = body.ids;
  const hasDays =
    typeof daysRaw === "number" &&
    Number.isInteger(daysRaw) &&
    daysRaw >= 1 &&
    daysRaw <= 36500;

  let cutoffIso: string | null = null;
  let idList: string[] | null = null;

  if (hasDays && Array.isArray(idsRaw)) return fail("ambiguous_filter");
  if (!hasDays && !Array.isArray(idsRaw)) return fail("missing_filter");

  if (hasDays) {
    cutoffIso = new Date(Date.now() - (daysRaw as number) * DAY_MS).toISOString();
  } else {
    const cleaned = [
      ...new Set(
        (idsRaw as unknown[])
          .map((v) => String(v))
          .filter((v) => ID_PATTERN.test(v))
      ),
    ];

    if (cleaned.length === 0) return fail("invalid_ids");
    if (cleaned.length > MAX_IDS) {
      return fail("too_many_ids", 400, { max_ids: MAX_IDS });
    }

    idList = cleaned;
  }

  const db = supabase;
  const targetTable = table;

  const countTotal = () =>
    db.from(targetTable).select("*", { count: "exact", head: true });

  const countMatched = () => {
    if (cutoffIso !== null) {
      return db
        .from(targetTable)
        .select("*", { count: "exact", head: true })
        .lt("created_at", cutoffIso);
    }
    return db
      .from(targetTable)
      .select("*", { count: "exact", head: true })
      .in("id", idList as string[]);
  };

  const boundRow = (direction: "asc" | "desc") => {
    const base = db
      .from(targetTable)
      .select("created_at")
      .order("created_at", { ascending: direction === "asc" })
      .limit(1);

    if (cutoffIso !== null) {
      return base.lt("created_at", cutoffIso);
    }
    return base.in("id", idList as string[]);
  };

  // ── PREVIEW: report exactly what a matching delete would remove ──
  if (action === "preview") {
    const [matchedQ, totalQ, oldestQ, newestQ] = await Promise.all([
      countMatched(),
      countTotal(),
      boundRow("asc"),
      boundRow("desc"),
    ]);

    if (matchedQ.error || totalQ.error || oldestQ.error || newestQ.error) {
      console.error("[admin-storage] preview failed:", matchedQ.error?.message);
      return fail("db_error", 500);
    }

    return NextResponse.json({
      ok: true,
      table,
      mode: cutoffIso ? "date" : "ids",
      requested: idList ? idList.length : undefined,
      matched: matchedQ.count ?? 0,
      total: totalQ.count ?? 0,
      oldest_affected:
        (oldestQ.data?.[0] as { created_at?: string } | undefined)?.created_at ?? null,
      newest_affected:
        (newestQ.data?.[0] as { created_at?: string } | undefined)?.created_at ?? null,
    });
  }

  // ── DELETE: requires confirmCount captured from a fresh preview ──
  const confirmCount = body.confirmCount;
  if (
    typeof confirmCount !== "number" ||
    !Number.isInteger(confirmCount) ||
    confirmCount < 0
  ) {
    return fail("missing_confirmation");
  }

  const beforeQ = await countMatched();
  if (beforeQ.error) {
    console.error("[admin-storage] pre-delete count failed:", beforeQ.error.message);
    return fail("db_error", 500);
  }

  const matchedBefore = beforeQ.count ?? 0;

  // Guard against drift between preview and execution (TOCTOU).
  if (matchedBefore !== confirmCount) {
    return fail("count_mismatch", 409, { current_matched: matchedBefore });
  }

  if (matchedBefore === 0) {
    return NextResponse.json({ ok: true, deleted: 0 });
  }

  // Accidental-wipe guard: date-based cleanups must always leave rows
  // behind. Emptying a table entirely requires deliberate per-id picks.
  if (cutoffIso) {
    const totalQ = await countTotal();
    if (totalQ.error) {
      console.error("[admin-storage] total count failed:", totalQ.error.message);
      return fail("db_error", 500);
    }

    if ((totalQ.count ?? 0) <= matchedBefore) {
      return fail("full_table_wipe_blocked", 403);
    }
  }

  let deleteQuery = supabase.from(table).delete();
  deleteQuery = cutoffIso
    ? deleteQuery.lt("created_at", cutoffIso)
    : deleteQuery.in("id", idList as string[]);

  const { error: deleteError } = await deleteQuery;

  if (deleteError) {
    console.error("[admin-storage] delete failed:", deleteError.message);
    return fail("db_error", 500);
  }

  const afterQ = await countMatched();
  const deleted = afterQ.error
    ? matchedBefore
    : Math.max(0, matchedBefore - (afterQ.count ?? 0));

  try {
    await supabase.from("activity_log").insert({
      type: ACTIVITY_TYPES[table],
      title: `Deleted ${deleted} ${deleted === 1 ? "row" : "rows"} from ${table}`,
      meta: {
        source: "admin-storage",
        mode: cutoffIso ? "older_than_days" : "selected_ids",
        older_than_days: cutoffIso ? (daysRaw as number) : undefined,
        selected_ids: idList ? idList.length : undefined,
      },
    });
  } catch (logErr) {
    console.error("[admin-storage] activity insert failed:", logErr);
  }

  return NextResponse.json({ ok: true, deleted });
}
