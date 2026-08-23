import { NextRequest, NextResponse } from "next/server";

import { GMAIL_STATE_COOKIE } from "@/lib/admin/gmail";

export const runtime = "nodejs";

/**
 * Google redirects here after consent. This route NEVER touches
 * tokens: it only validates the CSRF state against the httpOnly
 * cookie set during /connect, then hands the single-use code to the
 * admin page, which completes the exchange through an authenticated
 * server route. The code is worthless without our client secret.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  const expectedState = request.cookies.get(GMAIL_STATE_COOKIE)?.value;

  const failed =
    Boolean(oauthError) || !code || !state || !expectedState || state !== expectedState;

  const target = failed
    ? "/admin/gmail?gmail_error=1"
    : `/admin/gmail?code=${encodeURIComponent(code)}`;

  const response = NextResponse.redirect(new URL(target, url.origin));

  // One-time use — clear it either way.
  response.cookies.delete({ name: GMAIL_STATE_COOKIE, path: "/api/gmail" });

  return response;
}
