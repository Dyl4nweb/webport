"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { getSupabase } from "@/lib/supabase";

interface CertificateRow {
  id: string;
  title: string;
  issuer: string;
  category: string;
  year: string;
  logo: string;
  image: string;
  description: string;
  verify_url: string | null;
  published: boolean;
  sort_order: number;
}

interface FormState {
  title: string;
  issuer: string;
  category: string;
  year: string;
  logo: string;
  image: string;
  description: string;
  verifyUrl: string;
  published: boolean;
  sortOrder: number;
}

const EMPTY_FORM: FormState = {
  title: "",
  issuer: "",
  category: "",
  year: "",
  logo: "",
  image: "",
  description: "",
  verifyUrl: "",
  published: true,
  sortOrder: 0,
};

function rowToForm(row: CertificateRow): FormState {
  return {
    title: row.title ?? "",
    issuer: row.issuer ?? "",
    category: row.category ?? "",
    year: row.year ?? "",
    logo: row.logo ?? "",
    image: row.image ?? "",
    description: row.description ?? "",
    verifyUrl: row.verify_url ?? "",
    published: Boolean(row.published),
    sortOrder: row.sort_order ?? 0,
  };
}

const inputClass =
  "w-full rounded-apple-sm border border-line bg-surface px-3 py-2 text-[13px] text-ink outline-none transition-colors placeholder:text-ink-tertiary focus:border-accent dark:border-line-dark dark:bg-surface-dark dark:text-ink-dark dark:placeholder:text-ink-dark-secondary dark:focus:border-accent-dark";

const labelClass =
  "block text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-tertiary dark:text-ink-dark-secondary";

export default function AdminCertificatesPage() {
  const [rows, setRows] = useState<CertificateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const fetchRows = useCallback(async () => {
    const { data, error } = await getSupabase()
      .from("certificates")
      .select(
        "id, title, issuer, category, year, logo, image, description, verify_url, published, sort_order"
      )
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("[certificates-admin] load failed:", error.message);
      setActionError(`Load failed: ${error.message}`);
      return;
    }

    setRows((data as CertificateRow[]) ?? []);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      await fetchRows();
      if (!cancelled) setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [fetchRows]);

  const sorted = useMemo(
    () =>
      [...rows].sort((a, b) => {
        const byOrder = (a.sort_order ?? 0) - (b.sort_order ?? 0);
        return byOrder !== 0 ? byOrder : a.title.localeCompare(b.title);
      }),
    [rows]
  );

  async function callApi(payload: Record<string, unknown>): Promise<boolean> {
    setActionError(null);
    setBusy(true);

    try {
      const { data: sessionData } = await getSupabase().auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        setActionError("Session expired — please sign in again.");
        return false;
      }

      const response = await fetch("/api/admin/certificates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json: { ok?: boolean; detail?: string } = await response
        .json()
        .catch(() => ({ ok: false }));

      if (!response.ok || !json.ok) {
        setActionError(
          json.detail
            ? `Save failed: ${json.detail}`
            : "The change could not be saved. Please try again."
        );
        return false;
      }

      await fetchRows();
      return true;
    } catch {
      setActionError("Network error — the change could not be saved.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  function openCreate() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, sortOrder: rows.length });
    setFormOpen(true);
  }

  function openEdit(row: CertificateRow) {
    setEditingId(row.id);
    setForm(rowToForm(row));
    setFormOpen(true);
  }

  async function saveForm() {
    const payload: Record<string, unknown> = editingId
      ? { action: "update", id: editingId, certificate: form }
      : { action: "create", certificate: form };

    const ok = await callApi(payload);
    if (ok) setFormOpen(false);
  }

  async function removeCertificate(row: CertificateRow) {
    if (
      !window.confirm(
        `Delete "${row.title}"? The public site updates immediately.`
      )
    ) {
      return;
    }
    await callApi({ action: "delete", id: row.id });
  }

  async function importStatic() {
    if (
      !window.confirm(
        "Import the existing static certificates into the CMS? This only runs while the database table is empty."
      )
    ) {
      return;
    }
    await callApi({ action: "seed" });
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent dark:text-accent-dark">
            Content
          </span>

          <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.03em] text-ink dark:text-ink-dark">
            Certificates
          </h1>

          <p className="mt-1 text-[14px] text-ink-secondary dark:text-ink-dark-secondary">
            Edits publish to the public certifications page within seconds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {rows.length === 0 && !loading && (
            <button
              type="button"
              onClick={importStatic}
              disabled={busy}
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-line px-4 py-2 text-[13px] font-medium text-ink transition-colors duration-150 hover:border-ink/15 hover:bg-ink/[0.04] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:pointer-events-none disabled:opacity-40 dark:border-line-dark dark:text-ink-dark dark:hover:border-ink-dark/25 dark:hover:bg-ink-dark/[0.06]"
            >
              Import static certificates
            </button>
          )}

          <button
            type="button"
            onClick={openCreate}
            disabled={busy}
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-accent px-4 py-2 text-[13px] font-medium text-white shadow-sm transition-all duration-150 hover:opacity-90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:pointer-events-none disabled:opacity-40 dark:bg-accent-dark dark:text-accent dark:focus-visible:ring-accent-dark/50"
          >
            New certificate
          </button>
        </div>
      </div>

      {/* Action error */}
      {actionError && (
        <p className="rounded-apple-sm border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-[14px] text-red-500">
          {actionError}
        </p>
      )}

      {/* List */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-[88px] animate-pulse rounded-apple-lg border border-line/70 bg-surface-card dark:border-line-dark/70 dark:bg-surface-dark-card"
            />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-apple-lg border border-dashed border-line/70 p-10 text-center dark:border-line-dark/70">
          <p className="text-[15px] font-medium text-ink dark:text-ink-dark">
            No certificates in the CMS yet
          </p>
          <p className="mx-auto mt-2 max-w-md text-[14px] leading-relaxed text-ink-secondary dark:text-ink-dark-secondary">
            The public page is currently showing your built-in static
            certificates. Use “Import static certificates” to start managing
            them here, or create a new one.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {sorted.map((row) => (
            <li
              key={row.id}
              className="flex items-center gap-4 rounded-apple-lg border border-line/70 bg-surface-card p-4 dark:border-line-dark/70 dark:bg-surface-dark-card"
            >
              {/* Thumb */}
              <span className="h-14 w-20 shrink-0 overflow-hidden rounded-apple-sm bg-ink/[0.04] dark:bg-ink-dark/[0.06]">
                {row.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={row.image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                )}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-[15px] font-semibold tracking-tight text-ink dark:text-ink-dark">
                    {row.title}
                  </span>

                  {!row.published && (
                    <span className="rounded-full bg-ink/[0.05] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-tertiary dark:bg-ink-dark/[0.08] dark:text-ink-dark-secondary">
                      Unpublished
                    </span>
                  )}
                </div>

                <span className="block truncate text-[13px] text-ink-secondary dark:text-ink-dark-secondary">
                  {[row.issuer, row.category, row.year].filter(Boolean).join(" · ")}
                </span>
              </div>

              <span className="shrink-0 text-[12px] tabular-nums text-ink-tertiary dark:text-ink-dark-secondary">
                #{row.sort_order}
              </span>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(row)}
                  className="inline-flex items-center rounded-full px-3 py-2 text-[13px] font-medium text-ink-secondary transition-colors duration-150 hover:bg-ink/[0.05] hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 dark:text-ink-dark-secondary dark:hover:bg-ink-dark/[0.08] dark:hover:text-ink-dark"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => removeCertificate(row)}
                  className="inline-flex items-center rounded-full px-3 py-2 text-[13px] font-medium text-red-500 transition-colors duration-150 hover:bg-red-500/[0.08] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Editor modal */}
      {formOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm sm:p-8"
          onClick={(e) => {
            if (e.target === e.currentTarget) setFormOpen(false);
          }}
        >
          <div className="my-8 w-full max-w-2xl rounded-apple-lg border border-line/70 bg-surface p-6 shadow-xl dark:border-line-dark/70 dark:bg-surface-dark sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-[18px] font-semibold tracking-tight text-ink dark:text-ink-dark">
                {editingId ? "Edit certificate" : "New certificate"}
              </h2>

              <button
                type="button"
                onClick={() => setFormOpen(false)}
                aria-label="Close editor"
                className="rounded-full px-3 py-1.5 text-[13px] text-ink-secondary transition-colors hover:bg-ink/[0.05] dark:text-ink-dark-secondary dark:hover:bg-ink-dark/[0.08]"
              >
                Cancel
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 sm:col-span-2">
                <span className={labelClass}>Title *</span>
                <input
                  className={inputClass}
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className={labelClass}>Issuer</span>
                <input
                  className={inputClass}
                  value={form.issuer}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, issuer: e.target.value }))
                  }
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className={labelClass}>Category</span>
                <input
                  className={inputClass}
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value }))
                  }
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className={labelClass}>Year</span>
                <input
                  className={inputClass}
                  value={form.year}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, year: e.target.value }))
                  }
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className={labelClass}>Sort order</span>
                <input
                  type="number"
                  className={inputClass}
                  value={form.sortOrder}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      sortOrder: Number(e.target.value) || 0,
                    }))
                  }
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className={labelClass}>Logo path</span>
                <input
                  className={inputClass}
                  placeholder="/certificates/logos/CC.png"
                  value={form.logo}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, logo: e.target.value }))
                  }
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className={labelClass}>Image path</span>
                <input
                  className={inputClass}
                  placeholder="/certificates/CTM.png"
                  value={form.image}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, image: e.target.value }))
                  }
                />
              </label>

              <label className="flex flex-col gap-1.5 sm:col-span-2">
                <span className={labelClass}>Description</span>
                <textarea
                  rows={3}
                  className={inputClass}
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                />
              </label>

              <label className="flex flex-col gap-1.5 sm:col-span-2">
                <span className={labelClass}>Verification URL</span>
                <input
                  className={inputClass}
                  placeholder="https://www.credly.com/badges/…"
                  value={form.verifyUrl}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, verifyUrl: e.target.value }))
                  }
                />
              </label>

              <label className="flex items-center gap-2 sm:col-span-2">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, published: e.target.checked }))
                  }
                  className="h-4 w-4 accent-[var(--accent)]"
                />
                <span className="text-[13px] font-medium text-ink dark:text-ink-dark">
                  Published on the certifications page
                </span>
              </label>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="rounded-full px-4 py-2 text-[13px] font-medium text-ink-secondary transition-colors hover:bg-ink/[0.05] dark:text-ink-dark-secondary dark:hover:bg-ink-dark/[0.08]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={saveForm}
                disabled={busy || !form.title.trim()}
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-accent px-5 py-2 text-[13px] font-medium text-white shadow-sm transition-all duration-150 hover:opacity-90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:pointer-events-none disabled:opacity-40 dark:bg-accent-dark"
              >
                {busy ? "Saving…" : editingId ? "Save changes" : "Publish certificate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
