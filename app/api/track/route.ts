import { NextRequest, NextResponse } from "next/server";

import { getSupabase } from "@/lib/supabase";

const MAX_PATH_LENGTH = 512;

type Device = "mobile" | "tablet" | "desktop";

/**
 * Coarse device classification from the User-Agent header.
 * The UA string is read transiently here and NEVER stored.
 */
function classifyDevice(userAgent: string): Device {
  if (/iPad|Tablet|PlayBook|Silk/i.test(userAgent)) return "tablet";
  if (/Mobi|Android|iPhone|iPod|Windows Phone/i.test(userAgent)) {
    return "mobile";
  }
  return "desktop";
}

/**
 * Reduce a referrer URL to its bare hostname (www. stripped).
 * Anything unparseable becomes null — no query strings, no paths,
 * nothing that could carry personal information.
 */
function normalizeReferrer(raw: unknown): string | null {
  if (typeof raw !== "string" || raw.length === 0 || raw.length > 2048) {
    return null;
  }

  try {
    return new URL(raw).hostname.replace(/^www\./, "") || null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json().catch(() => null);

    const path =
      typeof (body as { path?: unknown })?.path === "string"
        ? ((body as { path: string }).path)
        : "";

    const isValidPath =
      path.startsWith("/") &&
      !path.startsWith("//") &&
      path.length <= MAX_PATH_LENGTH;

    if (!isValidPath || path.startsWith("/admin")) {
      return new NextResponse(null, { status: 204 });
    }

    let referrer = normalizeReferrer((body as { referrer?: unknown })?.referrer);

    // Own-domain referrers are internal navigation — the path already
    // tells that story, so drop them.
    if (
      referrer &&
      request.headers.get("host")?.replace(/^www\./, "") === referrer
    ) {
      referrer = null;
    }

    const device = classifyDevice(request.headers.get("user-agent") ?? "");

    // Best-effort insert — a failed write must never surface to visitors.
    await getSupabase().from("page_views").insert({ path, referrer, device });
  } catch {
    // Analytics is best-effort by design.
  }

  return new NextResponse(null, { status: 204 });
}
