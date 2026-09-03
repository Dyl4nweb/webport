"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useConfirm } from "@/lib/admin/confirm-context";
import { getSupabase } from "@/lib/supabase";
import type { Project } from "@/types";

interface ProjectRow {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  role: string;
  year: string;
  category: string;
  image: string;
  screenshots: { src: string; title: string; description: string }[];
  tech_stack: string[];
  live_url: string | null;
  repo_url: string | null;
  featured: boolean;
  overview: string;
  features: string[];
  sort_order: number;
}

interface FormState {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  role: string;
  year: string;
  category: string;
  image: string;
  screenshots: { src: string; title: string; description: string }[];
  techStack: string;
  liveUrl: string;
  repoUrl: string;
  featured: boolean;
  overview: string;
  features: string;
  sortOrder: number;
}

const EMPTY_FORM: FormState = {
  slug: "",
  name: "",
  tagline: "",
  description: "",
  role: "",
  year: "",
  category: "Web App",
  image: "",
  screenshots: [],
  techStack: "",
  liveUrl: "",
  repoUrl: "",
  featured: false,
  overview: "",
  features: "",
  sortOrder: 0,
};

function rowToForm(row: ProjectRow): FormState {
  return {
    slug: row.slug,
    name: row.name,
    tagline: row.tagline ?? "",
    description: row.description ?? "",
    role: row.role ?? "",
    year: row.year ?? "",
    category: row.category ?? "Web App",
    image: row.image ?? "",
    screenshots: Array.isArray(row.screenshots) ? row.screenshots : [],
    techStack: (row.tech_stack ?? []).join(", "),
    liveUrl: row.live_url ?? "",
    repoUrl: row.repo_url ?? "",
    featured: Boolean(row.featured),
    overview: row.overview ?? "",
    features: (row.features ?? []).join("\n"),
    sortOrder: row.sort_order ?? 0,
  };
}

const inputClass =
  "w-full rounded-apple-sm border border-line bg-surface px-3 py-2 text-[13px] text-ink outline-none transition-colors placeholder:text-ink-tertiary focus:border-accent dark:border-line-dark dark:bg-surface-dark dark:text-ink-dark dark:placeholder:text-ink-dark-secondary dark:focus:border-accent-dark";

const labelClass =
  "block text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-tertiary dark:text-ink-dark-secondary";

export default function AdminProjectsPage() {
  const { confirm } = useConfirm();
  const [rows, setRows] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const fetchRows = useCallback(async () => {
    const { data, error } = await getSupabase()
      .from("portfolio_projects")
      .select(
        "slug, name, tagline, description, role, year, category, image, screenshots, tech_stack, live_url, repo_url, featured, overview, features, sort_order"
      )
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("[projects-admin] load failed:", error.message);
      return;
    }

    setRows((data as ProjectRow[]) ?? []);
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

  useEffect(() => {
    if (!formOpen) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFormOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [formOpen]);

  const sorted = useMemo(
    () =>
      [...rows].sort((a, b) => {
        const byOrder = (a.sort_order ?? 0) - (b.sort_order ?? 0);
        return byOrder !== 0 ? byOrder : a.name.localeCompare(b.name);
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

      const response = await fetch("/api/admin/projects", {
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
    setEditingSlug(null);
    setForm({ ...EMPTY_FORM, sortOrder: rows.length });
    setFormOpen(true);
  }

  function openEdit(row: ProjectRow) {
    setEditingSlug(row.slug);
    setForm(rowToForm(row));
    setFormOpen(true);
  }

  async function saveForm() {
    const payload = {
      action: editingSlug ? "update" : "create",
      project: {
        ...form,
        techStack: form.techStack
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        features: form.features
          .split("\n")
          .map((f) => f.trim())
          .filter(Boolean),
      },
    };

    const ok = await callApi(payload);
    if (ok) setFormOpen(false);
  }

  async function removeProject(row: ProjectRow) {
    const ok = await confirm({
      title: "Delete Project",
      message: `Delete "${row.name}"? The public site updates immediately.`,
      confirmLabel: "Delete Project",
      tone: "danger",
    });
    if (!ok) return;
    await callApi({ action: "delete", slug: row.slug });
  }

  async function importStatic() {
    const ok = await confirm({
      title: "Import Static Projects",
      message:
        "Import the 7 original static projects into the CMS? Existing entries with the same slug are left untouched.",
      confirmLabel: "Import Projects",
      tone: "default",
    });
    if (!ok) return;
    await callApi({ action: "seed" });
  }

  function updateScreenshot(index: number, patch: Partial<FormState["screenshots"][0]>) {
    setForm((f) => ({
      ...f,
      screenshots: f.screenshots.map((s, i) =>
        i === index ? { ...s, ...patch } : s
      ),
    }));
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
            Projects
          </h1>

          <p className="mt-1 text-[14px] text-ink-secondary dark:text-ink-dark-secondary">
            Edits publish to the public site within seconds.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {rows.length === 0 && !loading && (
            <button
              type="button"
              onClick={importStatic}
              disabled={busy}
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 sm:px-4 sm:py-2 text-[12.5px] sm:text-[13px] font-medium text-ink transition-colors duration-150 hover:border-ink/15 hover:bg-ink/[0.04] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:pointer-events-none disabled:opacity-40 dark:border-line-dark dark:text-ink-dark dark:hover:border-ink-dark/25 dark:hover:bg-ink-dark/[0.06]"
            >
              Import static projects
            </button>
          )}

          <button
            type="button"
            onClick={openCreate}
            disabled={busy}
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-ink px-3.5 py-1.5 sm:px-4 sm:py-2 text-[12.5px] sm:text-[13px] font-medium text-white shadow-sm transition-all duration-150 hover:bg-black hover:opacity-95 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 disabled:pointer-events-none disabled:opacity-40 dark:bg-white dark:text-black dark:font-semibold dark:hover:bg-white/90 dark:focus-visible:ring-white/50"
          >
            New project
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
              className="h-20 animate-pulse rounded-apple-lg border border-line/70 bg-surface-card dark:border-line-dark/70 dark:bg-surface-dark-card"
            />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="rounded-apple-lg border border-dashed border-line/80 p-12 text-center dark:border-line-dark/80">
          <p className="text-[15px] font-medium text-ink dark:text-ink-dark">
            No projects in the CMS yet
          </p>
          <p className="mx-auto mt-2 max-w-md text-[14px] leading-relaxed text-ink-secondary dark:text-ink-dark-secondary">
            The public site is currently showing your built-in static
            projects. Use “Import static projects” to start managing them
            here, or create a new one.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {sorted.map((row) => (
            <li
              key={row.slug}
              className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 rounded-apple-lg border border-line/70 bg-surface-card p-4 dark:border-line-dark/70 dark:bg-surface-dark-card"
            >
              <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                {/* Thumb */}
                <span className="h-12 w-16 sm:h-14 sm:w-20 shrink-0 overflow-hidden rounded-apple-sm bg-ink/[0.04] dark:bg-ink-dark/[0.06]">
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
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="text-[14.5px] sm:text-[15px] font-semibold tracking-tight text-ink dark:text-ink-dark">
                      {row.name}
                    </span>

                    {row.featured && (
                      <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-amber-600 dark:bg-amber-400/10 dark:text-amber-400">
                        Featured
                      </span>
                    )}
                  </div>

                  <span className="block truncate text-[12.5px] sm:text-[13px] text-ink-secondary dark:text-ink-dark-secondary">
                    {[row.category, row.year, `/${row.slug}`]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t border-line/40 dark:border-line-dark/40 sm:border-none">
                <span className="text-[11.5px] sm:text-[12px] tabular-nums text-ink-tertiary dark:text-ink-dark-secondary">
                  #{row.sort_order}
                </span>

                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(row)}
                    className="inline-flex items-center rounded-full px-3 py-1.5 text-[12.5px] sm:text-[13px] font-medium text-ink-secondary transition-colors duration-150 hover:bg-ink/[0.05] hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 dark:text-ink-dark-secondary dark:hover:bg-ink-dark/[0.08] dark:hover:text-ink-dark"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => removeProject(row)}
                    className="inline-flex items-center rounded-full px-3 py-1.5 text-[12.5px] sm:text-[13px] font-medium text-red-500 transition-colors duration-150 hover:bg-red-500/[0.08] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Editor modal */}
      {formOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setFormOpen(false);
          }}
        >
          <div
            className="flex max-h-[88vh] w-full max-w-2xl min-h-0 flex-col rounded-apple-lg border border-line/80 bg-surface shadow-2xl dark:border-line-dark/80 dark:bg-surface-dark overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-line/60 bg-surface/95 px-4 py-3 backdrop-blur-md dark:border-line-dark/60 dark:bg-surface-dark/95 sm:px-8 sm:py-4">
              <div>
                <h2
                  id="project-modal-title"
                  className="text-[17px] sm:text-[18px] font-semibold tracking-tight text-ink dark:text-ink-dark"
                >
                  {editingSlug ? `Edit ${editingSlug}` : "New project"}
                </h2>
                <p className="mt-0.5 text-[12px] text-ink-secondary dark:text-ink-dark-secondary">
                  {editingSlug
                    ? "Update project details and assets below."
                    : "Fill out the fields to publish a new project."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setFormOpen(false)}
                aria-label="Close editor"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-secondary transition-colors hover:bg-ink/[0.08] hover:text-ink dark:text-ink-dark-secondary dark:hover:bg-ink-dark/[0.1] dark:hover:text-ink-dark"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Scrollable Form Content */}
            <div
              data-lenis-prevent
              className="admin-scrollbar flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 py-6 sm:px-8"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5">
                  <span className={labelClass}>Name *</span>
                  <input
                    className={inputClass}
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className={labelClass}>Slug * (unique)</span>
                  <input
                    className={inputClass}
                    value={form.slug}
                    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  />
                </label>

                <label className="flex flex-col gap-1.5 sm:col-span-2">
                  <span className={labelClass}>Tagline</span>
                  <input
                    className={inputClass}
                    value={form.tagline}
                    onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))}
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

                <label className="flex flex-col gap-1.5">
                  <span className={labelClass}>Role</span>
                  <input
                    className={inputClass}
                    value={form.role}
                    onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className={labelClass}>Year</span>
                  <input
                    className={inputClass}
                    value={form.year}
                    onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className={labelClass}>Category</span>
                  <input
                    className={inputClass}
                    list="project-categories"
                    value={form.category}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, category: e.target.value }))
                    }
                  />
                  <datalist id="project-categories">
                    <option value="Web App" />
                    <option value="Graphic Design" />
                  </datalist>
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className={labelClass}>Image path</span>
                  <input
                    className={inputClass}
                    placeholder="/images/projects/my-project.png"
                    value={form.image}
                    onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className={labelClass}>Live URL</span>
                  <input
                    className={inputClass}
                    value={form.liveUrl}
                    onChange={(e) => setForm((f) => ({ ...f, liveUrl: e.target.value }))}
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className={labelClass}>Repo URL</span>
                  <input
                    className={inputClass}
                    value={form.repoUrl}
                    onChange={(e) => setForm((f) => ({ ...f, repoUrl: e.target.value }))}
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className={labelClass}>Tech stack (comma-separated)</span>
                  <input
                    className={inputClass}
                    placeholder="Next.js, TypeScript, Tailwind CSS"
                    value={form.techStack}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, techStack: e.target.value }))
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

                <label className="flex flex-col gap-1.5 sm:col-span-2">
                  <span className={labelClass}>Overview</span>
                  <textarea
                    rows={3}
                    className={inputClass}
                    value={form.overview}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, overview: e.target.value }))
                    }
                  />
                </label>

                <label className="flex flex-col gap-1.5 sm:col-span-2">
                  <span className={labelClass}>Features (one per line)</span>
                  <textarea
                    rows={4}
                    className={inputClass}
                    value={form.features}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, features: e.target.value }))
                    }
                  />
                </label>

                <label className="flex items-center gap-2 sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, featured: e.target.checked }))
                    }
                    className="h-4 w-4 accent-[var(--accent)]"
                  />
                  <span className="text-[13px] font-medium text-ink dark:text-ink-dark">
                    Featured on the homepage
                  </span>
                </label>
              </div>

              {/* Screenshots */}
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <span className={labelClass}>Screenshots</span>

                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        screenshots: [
                          ...f.screenshots,
                          { src: "", title: "", description: "" },
                        ],
                      }))
                    }
                    className="inline-flex items-center rounded-full px-3 py-1 text-[12px] font-medium text-accent transition-colors duration-150 hover:bg-accent/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 dark:text-accent-dark"
                  >
                    + Add screenshot
                  </button>
                </div>

                {form.screenshots.length === 0 ? (
                  <p className="mt-2 text-[13px] text-ink-tertiary dark:text-ink-dark-secondary">
                    None — the modal will use the main image only.
                  </p>
                ) : (
                  <div className="mt-3 flex flex-col gap-3">
                    {form.screenshots.map((shot, index) => (
                      <div
                        key={index}
                        className="grid gap-2 rounded-apple-sm border border-line/60 p-3 dark:border-line-dark/60"
                      >
                        <input
                          className={inputClass}
                          placeholder="/images/projects/screenshot-1.png"
                          value={shot.src}
                          onChange={(e) =>
                            updateScreenshot(index, { src: e.target.value })
                          }
                        />

                        <input
                          className={inputClass}
                          placeholder="Title"
                          value={shot.title}
                          onChange={(e) =>
                            updateScreenshot(index, { title: e.target.value })
                          }
                        />

                        <input
                          className={inputClass}
                          placeholder="Description"
                          value={shot.description}
                          onChange={(e) =>
                            updateScreenshot(index, { description: e.target.value })
                          }
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setForm((f) => ({
                              ...f,
                              screenshots: f.screenshots.filter((_, i) => i !== index),
                            }))
                          }
                          className="self-start inline-flex items-center rounded-full px-3 py-1 text-[12px] font-medium text-red-500 transition-colors duration-150 hover:bg-red-500/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="sticky bottom-0 z-10 flex shrink-0 items-center justify-end gap-2.5 sm:gap-3 border-t border-line/60 bg-surface/95 px-4 py-3 backdrop-blur-md dark:border-line-dark/60 dark:bg-surface-dark/95 sm:px-8 sm:py-4">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="inline-flex items-center justify-center rounded-full border border-line/70 px-3.5 py-1.5 sm:px-4 sm:py-2 text-[12.5px] sm:text-[13px] font-medium text-ink-secondary transition-colors duration-150 hover:bg-ink/[0.05] hover:text-ink dark:border-line-dark/70 dark:text-ink-dark-secondary dark:hover:bg-ink-dark/[0.08] dark:hover:text-ink-dark"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={saveForm}
                disabled={busy || !form.name.trim() || !form.slug.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-4 py-1.5 sm:px-5 sm:py-2 text-[12.5px] sm:text-[13px] font-medium text-white shadow-sm transition-all duration-150 hover:bg-black hover:opacity-95 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 disabled:pointer-events-none disabled:opacity-40 dark:bg-white dark:text-black dark:font-semibold dark:hover:bg-white/90 dark:focus-visible:ring-white/50"
              >
                {busy && (
                  <svg
                    className="h-3.5 w-3.5 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                )}
                <span>
                  {busy
                    ? "Saving…"
                    : editingSlug
                    ? "Save changes"
                    : "Publish project"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
