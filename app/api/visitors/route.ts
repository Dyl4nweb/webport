import { NextResponse, after } from "next/server";
import { createHash } from "node:crypto";

import { getSupabase, getSupabaseService } from "@/lib/supabase";

// Visitor-data retention pruning runs at most once per day per server
// process, after the response has been sent. Idempotent and bounded —
// see prune_visitor_data() in migration 008.
const PRUNE_INTERVAL_MS = 24 * 60 * 60 * 1000;
let lastVisitorPruneAt = 0;

function scheduleVisitorPrune() {
  const now = Date.now();
  if (now - lastVisitorPruneAt < PRUNE_INTERVAL_MS) return;
  lastVisitorPruneAt = now;

  after(async () => {
    try {
      const service = getSupabaseService();
      if (!service) return; // key not configured — cleanup stays admin-triggerable
      await service.rpc("prune_visitor_data");
    } catch (err) {
      console.error("[visitors] background prune failed:", err);
    }
  });
}

export async function POST(request: Request) {
  try {
    const supabase = getSupabase();

    scheduleVisitorPrune();

    // ── Lifetime unique-visitor tracking (separate dataset) ──
    // Identity = one-way sha256(ip | user-agent), computed server-side.
    // The raw IP is additionally stored once (first-seen only) for
    // admin-only monitoring via migration 008 — never returned by this
    // public endpoint, readable only through the admin RLS policy.
    // No secret/salt required. Failure degrades gracefully to the
    // existing counter.
    let uniqueCount: number | null = null;

    try {
      const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        request.headers.get("x-real-ip") ||
        "unknown";
      const userAgent = request.headers.get("user-agent") ?? "";
      const visitorHash = createHash("sha256")
        .update(`${ip}|${userAgent}`)
        .digest("hex");

      const { data: tracked, error: trackError } = await supabase.rpc(
        "track_unique_visitor",
        { p_hash: visitorHash, p_ip: ip === "unknown" ? null : ip }
      );

      if (trackError) {
        console.error(
          "[visitors] unique tracking failed:",
          trackError.message
        );
      } else {
        const n = typeof tracked === "number" ? tracked : Number(tracked);
        if (Number.isFinite(n) && n > 0) uniqueCount = n;
      }
    } catch (trackErr) {
      console.error("[visitors] unique tracking error:", trackErr);
    }

    // Atomic increment via database function, then read the real value back.
    const { data, error: rpcError } = await supabase.rpc("increment_visitors");

    if (rpcError) {
      console.error("[visitors] RPC failed:", rpcError.message);

      // Fallback: read-modify-write with optimistic lock
      const { data: row, error: readErr } = await supabase
        .from("visitors")
        .select("count")
        .eq("id", 1)
        .single();

      if (readErr) {
        console.error("[visitors] Read failed:", readErr.message);
        return NextResponse.json({ count: 0, error: readErr.message });
      }

      const current = row?.count ?? 0;
      const { data: updated, error: writeErr } = await supabase
        .from("visitors")
        .update({ count: current + 1 })
        .eq("id", 1)
        .eq("count", current)
        .select("count")
        .single();

      if (writeErr) {
        console.error("[visitors] Write failed:", writeErr.message);
      }

      // Always read the actual DB value to return
      const { data: final } = await supabase
        .from("visitors")
        .select("count")
        .eq("id", 1)
        .single();

      return NextResponse.json({ count: uniqueCount ?? final?.count ?? current });
    }

    // RPC succeeded — read the actual value back from the table
    const { data: final, error: readErr } = await supabase
      .from("visitors")
      .select("count")
      .eq("id", 1)
      .single();

    if (readErr) {
      console.error("[visitors] Read-after-increment failed:", readErr.message);
      return NextResponse.json({
        count: uniqueCount ?? (typeof data === "number" ? data : 0),
      });
    }

    return NextResponse.json({ count: uniqueCount ?? final?.count ?? 0 });
  } catch (err) {
    console.error("[visitors] Unhandled error:", err);
    return NextResponse.json({ count: 0, error: "Server error" });
  }
}
