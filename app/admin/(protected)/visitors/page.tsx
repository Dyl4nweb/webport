"use client";

import { useEffect, useMemo, useState } from "react";

import StatCard from "@/components/admin/StatCard";
import {
  countAllViews,
  fetchRecentViews,
  startOfToday,
  tally,
  type Device,
  type PageViewRow,
} from "@/lib/admin/analytics";
import { getSupabase } from "@/lib/supabase";

const DEVICE_DOT: Record<Device, string> = {
  mobile: "bg-blue-500",
  tablet: "bg-violet-500",
  desktop: "bg-emerald-500",
};

function relativeTime(iso: string): string {
  const seconds = Math.max(
    1,
    Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  );

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

function formatDate(iso: unknown): string {
  if (typeof iso !== "string") return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface VisitorStatus {
  total_bytes?: number;
  capacity_bytes?: number;
  page_views_bytes?: number;
  unique_visitors_bytes?: number;
  page_views_count?: number;
  unique_visitors_count?: number;
  oldest_page_view?: string | null;
  oldest_unique_visitor?: string | null;
  retention_days?: number;
  cleanup_eligible_page_views?: number;
  cleanup_eligible_unique_visitors?: number;
}

interface UniqueVisitorRow {
  visitor_hash: string;
  ip_address: string | null;
  first_seen: string;
  last_seen: string;
  visit_count: number;
}

export default function AdminVisitorsPage() {
  const [rows, setRows] = useState<PageViewRow[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [totalVisitors, setTotalVisitors] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [uniqueRows, setUniqueRows] = useState<UniqueVisitorRow[]>([]);
  const [visitorStatus, setVisitorStatus] = useState<VisitorStatus | null>(
    null
  );
  const [cleanupBusy, setCleanupBusy] = useState(false);
  const [cleanupNote, setCleanupNote] = useState<string | null>(null);

  async function loadAdminVisitorData() {
    const { data: sessionData } = await getSupabase().auth.getSession();
    const token = sessionData?.session?.access_token;
    if (!token) return;

    const res = await fetch("/api/admin/visitors/cleanup", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;

    const json = await res.json();
    if (!json?.ok) return;

    setUniqueRows(
      (Array.isArray(json.recentUniqueVisitors)
        ? json.recentUniqueVisitors
        : []) as UniqueVisitorRow[]
    );
    if (json.status && typeof json.status.total_bytes === "number") {
      setVisitorStatus(json.status as VisitorStatus);
    }
  }

  async function runCleanup() {
    setCleanupBusy(true);
    setCleanupNote(null);

    try {
      const { data: sessionData } = await getSupabase().auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error("Your session is not authorized — sign in again.");

      const res = await fetch("/api/admin/visitors/cleanup", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();

      if (!res.ok || !json?.ok) {
        throw new Error(
          json?.reason === "unavailable"
            ? "Cleanup is unavailable — migration 008 has not been applied yet."
            : "Cleanup could not run."
        );
      }

      const report = json.report ?? {};
      const freed = Math.max(
        0,
        (report.visitor_bytes_before ?? 0) - (report.visitor_bytes_after ?? 0)
      );
      setCleanupNote(
        `Removed ${(report.deleted_page_views ?? 0).toLocaleString()} page views and ${(report.deleted_unique_visitors ?? 0).toLocaleString()} unique-visitor records — ${formatBytes(freed)} reclaimed.`
      );

      await loadAdminVisitorData();
    } catch (err) {
      setCleanupNote(err instanceof Error ? err.message : "Cleanup failed.");
    } finally {
      setCleanupBusy(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [recentRows, allTime, visitorsRow] = await Promise.all([
          fetchRecentViews(30),
          countAllViews(),
          getSupabase().from("visitors").select("count").eq("id", 1).single(),
        ]);

        if (cancelled) return;

        setRows(recentRows);
        setTotalViews(allTime);
        setTotalVisitors(visitorsRow.data?.count ?? 0);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load analytics."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    loadAdminVisitorData().catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const todayViews = useMemo(() => {
    const start = startOfToday().getTime();
    return rows.filter((r) => new Date(r.created_at).getTime() >= start).length;
  }, [rows]);

  const weekViews = useMemo(() => {
    const start = startOfToday();
    start.setDate(start.getDate() - 6);
    return rows.filter((r) => new Date(r.created_at).getTime() >= start.getTime())
      .length;
  }, [rows]);

  const topPages = useMemo(() => tally(rows, (r) => r.path).slice(0, 8), [rows]);
  const topReferrers = useMemo(
    () => tally(rows, (r) => r.referrer).slice(0, 8),
    [rows]
  );
  const recent = rows.slice(0, 10);

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent dark:text-accent-dark">
          Traffic
        </span>

        <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.03em] text-ink dark:text-ink-dark">
          Visitors
        </h1>

        <p className="mt-1 text-[14px] text-ink-secondary dark:text-ink-dark-secondary">
          Page-view analytics stay privacy-safe. Unique-visitor IPs are
          captured once, server-side, and visible only in this admin area.
        </p>
      </div>

      {error && (
        <p className="rounded-apple-sm border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-[14px] text-red-500">
          {error}
        </p>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-[132px] animate-pulse rounded-apple-lg border border-line/70 bg-surface-card dark:border-line-dark/70 dark:bg-surface-dark-card"
            />
          ))
        ) : (
          <>
            <StatCard label="Total visitors" value={totalVisitors.toLocaleString()} />
            <StatCard label="Total page views" value={totalViews.toLocaleString()} />
            <StatCard label="Views today" value={todayViews.toLocaleString()} />
            <StatCard label="Views · last 7 days" value={weekViews.toLocaleString()} />
          </>
        )}
      </div>

      {/* Visitor-data storage health */}
      {!loading &&
        visitorStatus &&
        typeof visitorStatus.total_bytes === "number" &&
        typeof visitorStatus.capacity_bytes === "number" && (
        <section
          className={`flex flex-wrap items-center gap-x-6 gap-y-3 rounded-apple-lg border px-5 py-4 ${
            visitorStatus.total_bytes > visitorStatus.capacity_bytes * 0.8
              ? "border-amber-500/30 bg-amber-500/[0.06]"
              : "border-line/70 bg-surface-card dark:border-line-dark/70 dark:bg-surface-dark-card"
          }`}
        >
          <div className="min-w-0 flex-1 basis-64">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[14px] font-semibold tracking-tight text-ink dark:text-ink-dark">
                Visitor data storage
              </h2>
              {visitorStatus.total_bytes >
                visitorStatus.capacity_bytes * 0.8 && (
                <span className="rounded-full border border-amber-500/30 bg-amber-500/[0.08] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-amber-600 dark:text-amber-400">
                  Approaching safety budget
                </span>
              )}
            </div>

            <p className="mt-1 text-[13px] text-ink-secondary dark:text-ink-dark-secondary">
              {formatBytes(visitorStatus.total_bytes ?? 0)} of{" "}
              {formatBytes(visitorStatus.capacity_bytes ?? 0)} safety budget ·{" "}
              {(visitorStatus.page_views_count ?? 0).toLocaleString()} page views
              ({formatBytes(visitorStatus.page_views_bytes ?? 0)}) ·{" "}
              {(visitorStatus.unique_visitors_count ?? 0).toLocaleString()} unique
              visitors ({formatBytes(visitorStatus.unique_visitors_bytes ?? 0)})
            </p>

            <p className="mt-0.5 text-[12px] text-ink-tertiary dark:text-ink-dark-secondary">
              Oldest page view {formatDate(visitorStatus.oldest_page_view)} ·
              oldest unique visitor{" "}
              {formatDate(visitorStatus.oldest_unique_visitor)}
              {(visitorStatus.cleanup_eligible_page_views ?? 0) +
                (visitorStatus.cleanup_eligible_unique_visitors ?? 0) >
              0
                ? ` · ${(visitorStatus.cleanup_eligible_page_views ?? 0).toLocaleString()} + ${(visitorStatus.cleanup_eligible_unique_visitors ?? 0).toLocaleString()} records past the ${visitorStatus.retention_days ?? 180}-day retention window`
                : ""}
            </p>

            {cleanupNote && (
              <p className="mt-2 text-[13px] font-medium text-accent dark:text-accent-dark">
                {cleanupNote}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={runCleanup}
            disabled={cleanupBusy}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border border-line px-4 py-2 text-[13px] font-medium text-ink transition-colors duration-150 hover:border-ink/15 hover:bg-ink/[0.04] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:pointer-events-none disabled:opacity-40 dark:border-line-dark dark:text-ink-dark dark:hover:border-ink-dark/25 dark:hover:bg-ink-dark/[0.06]"
          >
            {cleanupBusy ? "Cleaning…" : "Run cleanup"}
          </button>
        </section>
      )}

      {/* Unique visitors */}
      {!loading && (
        <section className="rounded-apple-lg border border-line/70 bg-surface-card p-6 dark:border-line-dark/70 dark:bg-surface-dark-card">
          <h2 className="text-[15px] font-semibold tracking-tight text-ink dark:text-ink-dark">
            Unique visitors
            <span className="ml-2 text-[12px] font-normal text-ink-tertiary dark:text-ink-dark-secondary">
              latest · IP visible to admins only
            </span>
          </h2>

          {uniqueRows.length === 0 ? (
            <p className="mt-4 text-[14px] text-ink-secondary dark:text-ink-dark-secondary">
              No unique visitors recorded yet.
            </p>
          ) : (
            <ul className="mt-5 flex flex-col">
              {uniqueRows.map((row) => (
                <li
                  key={row.visitor_hash}
                  className="flex items-center gap-3 border-b border-line/50 py-3 last:border-none dark:border-line-dark/50"
                >
                  <span
                    title={row.visitor_hash}
                    className="w-[7.5rem] shrink-0 truncate font-mono text-[12px] text-ink-tertiary dark:text-ink-dark-secondary"
                  >
                    {row.visitor_hash.slice(0, 12)}…
                  </span>

                  <span
                    title={row.ip_address ?? undefined}
                    className="min-w-0 flex-1 truncate text-[14px] tabular-nums text-ink dark:text-ink-dark"
                  >
                    {row.ip_address ?? "—"}
                  </span>

                  <span className="shrink-0 text-[12px] tabular-nums text-ink-tertiary dark:text-ink-dark-secondary">
                    {row.visit_count.toLocaleString()}×
                  </span>

                  <time
                    dateTime={row.last_seen}
                    className="w-20 shrink-0 text-right text-[13px] tabular-nums text-ink-tertiary dark:text-ink-dark-secondary"
                  >
                    {relativeTime(row.last_seen)}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {!loading && (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Popular pages */}
          <section className="rounded-apple-lg border border-line/70 bg-surface-card p-6 dark:border-line-dark/70 dark:bg-surface-dark-card">
            <h2 className="text-[15px] font-semibold tracking-tight text-ink dark:text-ink-dark">
              Popular pages
              <span className="ml-2 text-[12px] font-normal text-ink-tertiary dark:text-ink-dark-secondary">
                last 30 days
              </span>
            </h2>

            {topPages.length === 0 ? (
              <p className="mt-4 text-[14px] text-ink-secondary dark:text-ink-dark-secondary">
                No page views recorded yet.
              </p>
            ) : (
              <ul className="mt-5 flex flex-col gap-4">
                {topPages.map(({ key, count }) => {
                  const max = topPages[0].count;
                  return (
                    <li key={key}>
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="truncate text-[13px] font-medium text-ink dark:text-ink-dark">
                          {key}
                        </span>
                        <span className="shrink-0 text-[13px] tabular-nums text-ink-tertiary dark:text-ink-dark-secondary">
                          {count.toLocaleString()}
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/[0.06] dark:bg-ink-dark/[0.08]">
                        <div
                          className="h-full rounded-full bg-accent transition-[width] duration-500 dark:bg-accent-dark"
                          style={{ width: `${Math.max(4, (count / max) * 100)}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Top referrers */}
          <section className="rounded-apple-lg border border-line/70 bg-surface-card p-6 dark:border-line-dark/70 dark:bg-surface-dark-card">
            <h2 className="text-[15px] font-semibold tracking-tight text-ink dark:text-ink-dark">
              Referrers
              <span className="ml-2 text-[12px] font-normal text-ink-tertiary dark:text-ink-dark-secondary">
                last 30 days
              </span>
            </h2>

            {topReferrers.length === 0 ? (
              <p className="mt-4 text-[14px] text-ink-secondary dark:text-ink-dark-secondary">
                No external referrers yet — all traffic so far is direct.
              </p>
            ) : (
              <ul className="mt-5 flex flex-col gap-4">
                {topReferrers.map(({ key, count }) => {
                  const max = topReferrers[0].count;
                  return (
                    <li key={key}>
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="truncate text-[13px] font-medium text-ink dark:text-ink-dark">
                          {key}
                        </span>
                        <span className="shrink-0 text-[13px] tabular-nums text-ink-tertiary dark:text-ink-dark-secondary">
                          {count.toLocaleString()}
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/[0.06] dark:bg-ink-dark/[0.08]">
                        <div
                          className="h-full rounded-full bg-accent transition-[width] duration-500 dark:bg-accent-dark"
                          style={{ width: `${Math.max(4, (count / max) * 100)}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      )}

      {/* Recent page views */}
      <section className="rounded-apple-lg border border-line/70 bg-surface-card p-6 dark:border-line-dark/70 dark:bg-surface-dark-card">
        <h2 className="text-[15px] font-semibold tracking-tight text-ink dark:text-ink-dark">
          Recent page views
        </h2>

        {loading ? (
          <div className="mt-5 flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-5 w-full max-w-md animate-pulse rounded-full bg-ink/[0.06] dark:bg-ink-dark/[0.08]"
              />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <p className="mt-4 text-[14px] text-ink-secondary dark:text-ink-dark-secondary">
            Nothing yet — browse your public site and refresh this page.
          </p>
        ) : (
          <ul className="mt-5 flex flex-col">
            {recent.map((row) => (
              <li
                key={row.id}
                className="flex items-center gap-3 border-b border-line/50 py-3 last:border-none dark:border-line-dark/50"
              >
                <span
                  aria-hidden="true"
                  title={row.device}
                  className={`h-2 w-2 shrink-0 rounded-full ${DEVICE_DOT[row.device]}`}
                />

                <span className="min-w-0 flex-1 truncate text-[14px] text-ink dark:text-ink-dark">
                  {row.path}
                </span>

                <time
                  dateTime={row.created_at}
                  className="shrink-0 text-[13px] tabular-nums text-ink-tertiary dark:text-ink-dark-secondary"
                >
                  {relativeTime(row.created_at)}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
