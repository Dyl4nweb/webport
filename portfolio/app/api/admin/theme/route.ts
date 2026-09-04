import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { promises as fs } from "fs";
import path from "path";
import { getSupabase, getSupabaseWithToken } from "@/lib/supabase";
import { isValidTheme, type SiteTheme } from "@/lib/theme";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SETTINGS_FILE = path.join(process.cwd(), "data", "site_settings.json");

async function readLocalSettings(): Promise<SiteTheme> {
  try {
    const raw = await fs.readFile(SETTINGS_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (isValidTheme(parsed.active_theme)) return parsed.active_theme;
  } catch {}
  return "modern";
}

async function writeLocalSettings(theme: SiteTheme) {
  try {
    await fs.writeFile(
      SETTINGS_FILE,
      JSON.stringify({ active_theme: theme, updated_at: new Date().toISOString() }, null, 2),
      "utf-8"
    );
  } catch (err) {
    console.error("Failed to write local settings:", err);
  }
}

async function requireAdmin(request: NextRequest) {
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) {
    return {
      error: NextResponse.json(
        { ok: false, reason: "unauthorized", message: "Missing Authorization token. Please log in again." },
        { status: 401 }
      ),
    };
  }

  const supabase = getSupabaseWithToken(token);
  const { data: isAdmin, error: rpcErr } = await supabase.rpc("is_admin");
  if (isAdmin !== true) {
    console.error("requireAdmin rpc failed:", rpcErr, isAdmin);
    return {
      error: NextResponse.json(
        { ok: false, reason: "forbidden", message: rpcErr?.message || "User account does not have admin permissions." },
        { status: 403 }
      ),
    };
  }

  return { supabase, user: { id: "admin" } as any };
}

// GET: Authoritative fetch of the active global site theme
export async function GET() {
  // 1. Read authoritative setting from local settings file
  let theme: SiteTheme = await readLocalSettings();

  // 2. Try to read from Supabase if table exists
  try {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("site_settings")
      .select("active_theme, updated_at")
      .eq("id", "global")
      .maybeSingle();

    if (data && isValidTheme(data.active_theme)) {
      theme = data.active_theme;
    }
  } catch {}

  const response = NextResponse.json({
    ok: true,
    theme,
  });

  // Always sync client cookie
  response.cookies.set("site_active_theme", theme, {
    path: "/",
    maxAge: 31536000,
    sameSite: "lax",
  });

  return response;
}

// POST: Admin update of the active site theme
export async function POST(request: NextRequest) {
  const { supabase, error } = await requireAdmin(request);
  if (error) return error;

  try {
    const body = await request.json().catch(() => ({}));
    const nextTheme = body.theme;

    if (!isValidTheme(nextTheme)) {
      return NextResponse.json(
        { ok: false, reason: "invalid_theme", message: "Theme must be modern, cafe, or cyber" },
        { status: 400 }
      );
    }

    // 1. Write to local settings file (instant persistent store for dev/local)
    await writeLocalSettings(nextTheme);

    // 2. Upsert to Supabase if table exists
    let dbSynced = true;
    let dbErrorMsg = "";
    try {
      const { error: upsertErr } = await supabase
        .from("site_settings")
        .upsert(
          {
            id: "global",
            active_theme: nextTheme,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );

      if (upsertErr) {
        dbSynced = false;
        dbErrorMsg = upsertErr.message;
        console.warn("Supabase site_settings upsert error:", upsertErr);
      } else {
        try {
          await supabase.from("activity_log").insert({
            type: "theme",
            title: `Changed global theme to ${nextTheme.toUpperCase()}`,
            meta: { theme: nextTheme },
          });
        } catch {}
      }
    } catch (dbErr: any) {
      dbSynced = false;
      dbErrorMsg = dbErr?.message || "Database sync error";
    }

    try {
      revalidatePath("/", "layout");
    } catch {}

    const response = NextResponse.json({
      ok: true,
      theme: nextTheme,
      db_synced: dbSynced,
      db_error: dbErrorMsg || undefined,
    });

    // Set cookie so RootLayout and all pages get the theme immediately
    response.cookies.set("site_active_theme", nextTheme, {
      path: "/",
      maxAge: 31536000,
      sameSite: "lax",
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, reason: "internal_error", message: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
