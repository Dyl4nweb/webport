import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin/api-auth";
import { exchangeCodeForTokens, isGmailConfigured } from "@/lib/admin/gmail";

export const runtime = "nodejs";

/**
 * POST /api/gmail/exchange — completes the OAuth flow.
 * Requires a verified admin session; the code was already validated
 * against the CSRF state cookie by the callback route.
 */
export async function POST(request: NextRequest) {
  const { supabase, error } = await requireAdmin(request);
  if (error) return error;

  if (!isGmailConfigured()) {
    return NextResponse.json({ ok: false, reason: "not_configured" });
  }

  const body: { code?: string } = await request.json().catch(() => ({}));
  const code = typeof body.code === "string" ? body.code : "";

  if (!code) {
    return NextResponse.json({ ok: false, reason: "missing_code" }, { status: 400 });
  }

  const tokens = await exchangeCodeForTokens(code);

  if (!tokens) {
    // Never surface Google's error details — just a generic failure.
    return NextResponse.json({ ok: false, reason: "exchange_failed" });
  }

  await supabase.rpc("admin_set_integration_token", {
    p_provider: "gmail",
    p_access_token: tokens.accessToken,
    p_refresh_token: tokens.refreshToken,
    p_expires_at: tokens.expiresAt,
  });

  return NextResponse.json({ ok: true });
}
