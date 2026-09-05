import { NextRequest, NextResponse } from "next/server";

import { getSupabaseWithToken } from "@/lib/supabase";

const CAL_API_BASE = "https://api.cal.com/v2/bookings";
const CAL_TIMEOUT_MS = 8000;

interface CalAttendee {
  name?: string;
  email?: string;
  timeZone?: string;
}

interface CalBooking {
  uid?: string;
  title?: string;
  startTime?: string; // v1
  start?: string;     // v2
  status?: string;
  attendees?: CalAttendee[];
  eventType?: { title?: string; slug?: string } | null;
}

interface CacheRow {
  cal_booking_uid: string;
  name: string;
  email: string;
  title: string;
  start_time: string | null;
  timezone: string | null;
  status: string;
}

function mapStatus(calStatus?: string): string {
  switch ((calStatus ?? "").toUpperCase()) {
    case "PENDING":
      return "pending";
    case "CANCELLED":
      return "cancelled";
    default:
      return "accepted";
  }
}

/**
 * Map a Cal.com v1 booking to a bookings_cache row.
 * The first attendee is the client who made the booking.
 */
function toCacheRow(booking: CalBooking): CacheRow | null {
  if (!booking.uid) return null;

  const attendee = booking.attendees?.[0];

  return {
    cal_booking_uid: booking.uid,
    name: attendee?.name ?? "",
    email: attendee?.email ?? "",
    title: booking.eventType?.title ?? booking.title ?? "",
    start_time: booking.start ?? booking.startTime ?? null,
    timezone: attendee?.timeZone ?? null,
    status: mapStatus(booking.status),
  };
}

export async function POST(request: NextRequest) {
  // ── Auth: caller's JWT must be valid AND on the admin allowlist ──
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : "";

  if (!token) {
    return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseWithToken(token);

  const { data: userData } = await supabase.auth.getUser(token);
  if (!userData?.user) {
    return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });
  }

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) {
    return NextResponse.json({ ok: false, reason: "forbidden" }, { status: 403 });
  }

  // ── Config check: key stays server-side, never logged ──
  const apiKey = process.env.CAL_COM_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, reason: "not_configured" });
  }

  // ── Fetch from Cal.com ──
  let bookings: CalBooking[];

  try {
    const response = await fetch(`${CAL_API_BASE}`, {
      headers: { 
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`,
        "cal-api-version": "2024-08-13"
      },
      signal: AbortSignal.timeout(CAL_TIMEOUT_MS),
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(`[bookings-sync] Cal.com responded ${response.status}`);
      return NextResponse.json({ ok: false, reason: "cal_unavailable" });
    }

    const json: any = await response.json();
    bookings = Array.isArray(json?.data) 
      ? json.data 
      : Array.isArray(json?.bookings) 
        ? json.bookings 
        : [];
  } catch {
    console.error("[bookings-sync] Cal.com request failed");
    return NextResponse.json({ ok: false, reason: "cal_unavailable" });
  }

  const rows = bookings
    .map(toCacheRow)
    .filter((row): row is CacheRow => row !== null);

  if (rows.length === 0) {
    return NextResponse.json({ ok: true, total: 0, added: 0 });
  }

  // ── Diff against the cache to find genuinely new bookings ──
  const uids = rows.map((r) => r.cal_booking_uid);
  const { data: existing, error: selectError } = await supabase
    .from("bookings_cache")
    .select("cal_booking_uid")
    .in("cal_booking_uid", uids);

  if (selectError) {
    console.error("[bookings-sync] cache read failed:", selectError.message);
    return NextResponse.json({ ok: false, reason: "cache_error" });
  }

  const knownUids = new Set(
    (existing as Array<{ cal_booking_uid: string }>).map((r) => r.cal_booking_uid)
  );
  const newRows = rows.filter((r) => !knownUids.has(r.cal_booking_uid));

  // ── Upsert (idempotent — refreshes never duplicate anything) ──
  const { error: upsertError } = await supabase
    .from("bookings_cache")
    .upsert(rows, { onConflict: "cal_booking_uid" });

  if (upsertError) {
    console.error("[bookings-sync] upsert failed:", upsertError.message);
    return NextResponse.json({ ok: false, reason: "cache_error" });
  }

  // ── One activity entry per genuinely new booking only ──
  if (newRows.length > 0) {
    const { error: activityError } = await supabase.from("activity_log").insert(
      newRows.map((row) => ({
        type: "booking",
        title: `New booking: ${row.name || row.email || "client"}${
          row.title ? ` — ${row.title}` : ""
        }`,
        meta: { uid: row.cal_booking_uid, start_time: row.start_time },
      }))
    );

    if (activityError) {
      // Non-fatal: the cache is already synced.
      console.error("[bookings-sync] activity insert failed:", activityError.message);
    }
  }

  return NextResponse.json({ ok: true, total: rows.length, added: newRows.length });
}
