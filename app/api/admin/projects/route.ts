import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getSupabaseWithToken } from "@/lib/supabase";
import { projects as staticProjects } from "@/data/projects";
import type { Project } from "@/types";

interface ProjectPayload {
  slug?: unknown;
  name?: unknown;
  tagline?: unknown;
  description?: unknown;
  role?: unknown;
  year?: unknown;
  category?: unknown;
  image?: unknown;
  screenshots?: unknown;
  techStack?: unknown;
  liveUrl?: unknown;
  repoUrl?: unknown;
  featured?: unknown;
  overview?: unknown;
  features?: unknown;
  sortOrder?: unknown;
}

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback;
}

function strArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((v) => (typeof v === "string" ? v.trim() : ""))
    .filter((v) => v.length > 0);
}

/**
 * Convert the admin form payload into a portfolio_projects row.
 * Returns null when required fields are missing/invalid.
 */
function toRow(payload: ProjectPayload) {
  const slug = str(payload.slug);
  const name = str(payload.name);

  if (!slug || !name) return null;

  const screenshots = Array.isArray(payload.screenshots)
    ? payload.screenshots
        .map((s) => ({
          src: str((s as { src?: unknown })?.src),
          title: str((s as { title?: unknown })?.title),
          description: str((s as { description?: unknown })?.description),
        }))
        .filter((s) => s.src.length > 0)
    : [];

  const liveUrl = str(payload.liveUrl);
  const repoUrl = str(payload.repoUrl);

  return {
    slug,
    name,
    tagline: str(payload.tagline),
    description: str(payload.description),
    role: str(payload.role),
    year: str(payload.year),
    category: str(payload.category, "Web App") || "Web App",
    image: str(payload.image),
    screenshots,
    tech_stack: strArray(payload.techStack),
    live_url: liveUrl || null,
    repo_url: repoUrl || null,
    featured: payload.featured === true,
    overview: str(payload.overview),
    features: strArray(payload.features),
    sort_order:
      typeof payload.sortOrder === "number" && Number.isFinite(payload.sortOrder)
        ? Math.trunc(payload.sortOrder)
        : 0,
  };
}

async function requireAdmin(request: NextRequest) {
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) {
    return { error: NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 }) };
  }

  const supabase = getSupabaseWithToken(token);

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    return { error: NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 }) };
  }

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) {
    return { error: NextResponse.json({ ok: false, reason: "forbidden" }, { status: 403 }) };
  }

  return { supabase };
}

function refreshPublicPages() {
  revalidatePath("/");
  revalidatePath("/projects");
}

export async function POST(request: NextRequest) {
  const { supabase, error } = await requireAdmin(request);
  if (error) return error;

  const body: {
    action?: string;
    project?: ProjectPayload;
    slug?: string;
  } = await request.json().catch(() => ({}));

  // ── Seed: one-time import of the static projects ──
  // ignoreDuplicates means re-running never overwrites admin edits
  // and never creates duplicate slugs.
  if (body.action === "seed") {
    const rows = staticProjects.map((p, index) => ({
      slug: p.slug,
      name: p.name,
      tagline: p.tagline ?? "",
      description: p.description ?? "",
      role: p.role ?? "",
      year: p.year ?? "",
      category: p.category ?? "Web App",
      image: p.image ?? "",
      screenshots: p.screenshots ?? [],
      tech_stack: p.techStack ?? [],
      live_url: p.liveUrl ?? null,
      repo_url: p.repoUrl ?? null,
      featured: Boolean(p.featured),
      overview: p.overview ?? "",
      features: p.features ?? [],
      sort_order: index,
    }));

    const { error: seedError } = await supabase
      .from("portfolio_projects")
      .upsert(rows, {
        onConflict: "slug",
        ignoreDuplicates: true,
      });

    if (seedError) {
      console.error("[projects] seed failed:", seedError.message);
      return NextResponse.json({ ok: false, reason: "db_error" }, { status: 500 });
    }

    refreshPublicPages();
    return NextResponse.json({ ok: true, seeded: rows.length });
  }

  // ── Delete ──
  if (body.action === "delete") {
    const slug = str(body.slug);
    if (!slug) {
      return NextResponse.json({ ok: false, reason: "invalid_slug" }, { status: 400 });
    }

    const { error: deleteError } = await supabase
      .from("portfolio_projects")
      .delete()
      .eq("slug", slug);

    if (deleteError) {
      console.error("[projects] delete failed:", deleteError.message);
      return NextResponse.json({ ok: false, reason: "db_error" }, { status: 500 });
    }

    await supabase.from("activity_log").insert({
      type: "project",
      title: `Removed project: ${slug}`,
      meta: { slug },
    });

    refreshPublicPages();
    return NextResponse.json({ ok: true });
  }

  // ── Create / Update ──
  const row = toRow(body.project ?? {});
  if (!row) {
    return NextResponse.json(
      { ok: false, reason: "invalid_project", detail: "slug and name are required" },
      { status: 400 }
    );
  }

  const isUpdate = body.action === "update";

  const { error: writeError } = await supabase
    .from("portfolio_projects")
    .upsert(row, { onConflict: "slug" });

  if (writeError) {
    console.error("[projects] write failed:", writeError.message);
    return NextResponse.json({ ok: false, reason: "db_error" }, { status: 500 });
  }

  if (!isUpdate) {
    await supabase.from("activity_log").insert({
      type: "project",
      title: `Published project: ${row.name}`,
      meta: { slug: row.slug },
    });
  }

  refreshPublicPages();
  return NextResponse.json({ ok: true });
}
