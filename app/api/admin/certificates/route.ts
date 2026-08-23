import { NextRequest, NextResponse } from "next/server";

import { getSupabaseWithToken } from "@/lib/supabase";
import { certificates as staticCertificates } from "@/data/certificates";

interface CertificatePayload {
  id?: unknown;
  title?: unknown;
  issuer?: unknown;
  category?: unknown;
  year?: unknown;
  logo?: unknown;
  image?: unknown;
  description?: unknown;
  verifyUrl?: unknown;
  published?: unknown;
  sortOrder?: unknown;
}

const ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback;
}

function toRow(payload: CertificatePayload) {
  const title = str(payload.title);
  if (!title) return null;

  const verifyUrl = str(payload.verifyUrl);

  return {
    title,
    issuer: str(payload.issuer),
    category: str(payload.category),
    year: str(payload.year),
    logo: str(payload.logo),
    image: str(payload.image),
    description: str(payload.description),
    verify_url: verifyUrl || null,
    published: payload.published !== false,
    sort_order:
      typeof payload.sortOrder === "number" &&
      Number.isFinite(payload.sortOrder)
        ? Math.trunc(payload.sortOrder)
        : 0,
  };
}

async function requireAdmin(request: NextRequest) {
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) {
    return {
      error: NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 }),
    };
  }

  const supabase = getSupabaseWithToken(token);

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    return {
      error: NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 }),
    };
  }

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) {
    return {
      error: NextResponse.json({ ok: false, reason: "forbidden" }, { status: 403 }),
    };
  }

  return { supabase };
}

export async function POST(request: NextRequest) {
  const { supabase, error } = await requireAdmin(request);
  if (error) return error;

  const body: {
    action?: string;
    certificate?: CertificatePayload;
    id?: string;
  } = await request.json().catch(() => ({}));

  // ── Seed: one-time import of the static certificates ──
  if (body.action === "seed") {
    const { count } = await supabase
      .from("certificates")
      .select("*", { count: "exact", head: true });

    if ((count ?? 0) > 0) {
      return NextResponse.json(
        { ok: false, reason: "already_seeded", detail: "Certificates already exist in the database." },
        { status: 409 }
      );
    }

    const rows = staticCertificates.map((c, index) => ({
      title: c.title,
      issuer: c.issuer ?? "",
      category: c.category ?? "",
      year: c.year ?? "",
      logo: c.logo ?? "",
      image: c.image ?? "",
      description: c.description ?? "",
      verify_url: c.verifyUrl ?? null,
      published: true,
      sort_order: index,
    }));

    const { error: seedError } = await supabase
      .from("certificates")
      .insert(rows);

    if (seedError) {
      console.error("[certificates] seed failed:", seedError.message);
      return NextResponse.json(
        { ok: false, reason: "db_error", detail: seedError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, seeded: rows.length });
  }

  // ── Delete ──
  if (body.action === "delete") {
    const id = str(body.id);
    if (!ID_PATTERN.test(id)) {
      return NextResponse.json({ ok: false, reason: "invalid_id" }, { status: 400 });
    }

    const { error: deleteError } = await supabase
      .from("certificates")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("[certificates] delete failed:", deleteError.message);
      return NextResponse.json(
        { ok: false, reason: "db_error", detail: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  }

  // ── Create / Update ──
  const row = toRow(body.certificate ?? {});
  if (!row) {
    return NextResponse.json(
      { ok: false, reason: "invalid_certificate", detail: "title is required" },
      { status: 400 }
    );
  }

  const isUpdate = body.action === "update";
  let writeError: { message: string } | null = null;

  if (isUpdate) {
    const id = str(body.id ?? body.certificate?.id);
    if (!ID_PATTERN.test(id)) {
      return NextResponse.json({ ok: false, reason: "invalid_id" }, { status: 400 });
    }

    const result = await supabase
      .from("certificates")
      .update({ ...row, updated_at: new Date().toISOString() })
      .eq("id", id);
    writeError = result.error;
  } else {
    const result = await supabase.from("certificates").insert(row);
    writeError = result.error;
  }

  if (writeError) {
    console.error("[certificates] write failed:", writeError.message);
    return NextResponse.json(
      { ok: false, reason: "db_error", detail: writeError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
