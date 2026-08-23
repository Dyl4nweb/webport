import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin/api-auth";
import { fetchInbox, getValidAccessToken } from "@/lib/admin/gmail";

export const runtime = "nodejs";

/**
 * POST /api/gmail/messages — returns sanitized inbox metadata only
 * (sender, subject, date, snippet, unread). Tokens never leave the
 * server; if refresh fails, returns a clean not-connected signal.
 */
export async function POST(request: NextRequest) {
  const { supabase, error } = await requireAdmin(request);
  if (error) return error;

  const accessToken = await getValidAccessToken(supabase);

  if (!accessToken) {
    return NextResponse.json({ ok: false, reason: "not_connected" });
  }

  const messages = await fetchInbox(accessToken);

  if (!messages) {
    return NextResponse.json({ ok: false, reason: "gmail_unavailable" });
  }

  return NextResponse.json({ ok: true, messages });
}
