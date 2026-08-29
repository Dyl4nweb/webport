import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";

import { requireAdmin } from "@/lib/admin/api-auth";
import {
  buildConsentUrl,
  fetchProfileEmail,
  GMAIL_STATE_COOKIE,
  getValidAccessToken,
  isGmailConfigured,
} from "@/lib/admin/gmail";

export const runtime = "nodejs";

/** GET /api/gmail — connection status for the admin page. */
export async function GET(request: NextRequest) {
  const { supabase, error } = await requireAdmin(request);
  if (error) return error;

  if (!isGmailConfigured()) {
    return NextResponse.json({ ok: true, configured: false, connected: false });
  }

  const accessToken = await getValidAccessToken(supabase);

  if (!accessToken) {
    return NextResponse.json({ ok: true, configured: true, connected: false });
  }

  const email = await fetchProfileEmail(accessToken);

  return NextResponse.json({
    ok: true,
    configured: true,
    connected: Boolean(email),
    email: email ?? undefined,
  });
}

/** POST /api/gmail — action dispatcher: connect | disconnect. */
export async function POST(request: NextRequest) {
  const { supabase, error } = await requireAdmin(request);
  if (error) return error;

  const body: { action?: string } = await request
    .json()
    .catch(() => ({}));

  // ── Connect: return the Google consent URL + set CSRF state cookie ──
  if (body.action === "connect") {
    if (!isGmailConfigured()) {
      return NextResponse.json({ ok: false, reason: "not_configured" });
    }

    // Cryptographically random state; validated on callback.
    const state = randomBytes(32).toString("hex");

    const response = NextResponse.json({
      ok: true,
      url: buildConsentUrl(state),
    });

    response.cookies.set(GMAIL_STATE_COOKIE, state, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 600,
      path: "/api/gmail",
    });

    return response;
  }

  // ── Disconnect: remove stored credentials entirely ──
  if (body.action === "disconnect") {
    await supabase.rpc("admin_delete_integration_token", {
      p_provider: "gmail",
    });

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: false, reason: "unknown_action" }, { status: 400 });
}
