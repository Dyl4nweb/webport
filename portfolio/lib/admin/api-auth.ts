import { NextRequest, NextResponse } from "next/server";

import { getSupabaseWithToken, type SupabaseClient } from "@/lib/supabase";

/**
 * Shared guard for admin API routes: verifies the caller's JWT and
 * the is_admin() allowlist. Returns either a verified token-scoped
 * Supabase client or a ready-to-return error response.
 */
export async function requireAdmin(
  request: NextRequest
): Promise<
  | { supabase: SupabaseClient; error?: undefined }
  | { supabase?: undefined; error: NextResponse }
> {
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) {
    return {
      error: NextResponse.json({ ok: false, error: "Unauthorized: Missing authentication token." }, { status: 401 }),
    };
  }

  const supabase = getSupabaseWithToken(token);

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    return {
      error: NextResponse.json({ ok: false, error: "Unauthorized: Invalid or expired session." }, { status: 401 }),
    };
  }

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) {
    return {
      error: NextResponse.json({ ok: false, error: "Forbidden: You do not have admin privileges." }, { status: 403 }),
    };
  }

  return { supabase };
}
