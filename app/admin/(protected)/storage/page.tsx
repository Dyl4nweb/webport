"use client";

import { useCallback, useEffect, useState } from "react";

import StatCard from "@/components/admin/StatCard";
import { getSupabase } from "@/lib/supabase";

interface TableStat {
  count: number | null;
  oldest: string | null;
}

type TableStats = Record<string, TableStat>;

interface GmailStatus {
  configured: boolean;
  connected: boolean;
}

interface DbHealth {
  databaseSize: number;
  largestTables: Array<{ table: string; totalBytes: number }>;
  generatedAt: string | null;
}

const AUDITED_ON = "Aug 23, 2026";

interface AssetDirRow {
  dir: string;
  files: number;
  kb: number;
}

const LOCAL_ASSET_TOTALS = { files: 53, mb: 13.47 };

const LOCAL_ASSET_DIRS: AssetDirRow[] = [
  { dir: "certificates/", files: 15, kb: 5604 },
  { dir: "certificates/logos/", files: 8, kb: 903 },
  { dir: "icons/", files: 1, kb: 62 },
  { dir: "images/og/", files: 1, kb: 213 },
  { dir: "images/profile/", files: 2, kb: 1886 },
  { dir: "images/projects/", files: 20, kb: 3150 },
  { dir: "images/pubmats/", files: 4, kb: 1426 },
  { dir: "resume/", files: 2, kb: 550 },
];

interface UnusedCandidate {
  path: string;
  size: string;
}

const UNUSED_CANDIDATES: UnusedCandidate[] = [
  { path: "public/images/profile/profile1.png", size: "1.39 MB" },
  { path: "public/resume/1resume.pdf", size: "275 KB" },
  { path: "public/certificates/C2.png", size: "296 KB" },
  { path: "public/certificates/hr.png", size: "1.14 MB" },
  { path: "public/images/projects/varex-ai-4.png", size: "12 KB" },
];

const MISSING_REFERENCES = [
  "public/images/projects/eims-1.png",
  "public/images/projects/eims-2.png",
  "public/images/projects/eims-3.png",
];

type EligibleTable =
  | "page_views"
  | "bookings_cache"
  | "inquiries"
  | "unique_visitors";

const CLEANUP_TABLES: EligibleTable[] = [
  "page_views",
  "bookings_cache",
  "inquiries",
  "unique_visitors",
];

const CLEANUP_PURPOSE: Record<EligibleTable, string> = {
  page_views: "Analytics events. Only path, device, and dates are shown.",
  bookings_cache: "Booking cache entries. Attendee details are never shown here.",
  inquiries: "Contact submissions. Names, emails, and messages are never shown here.",
  unique_visitors:
    "Lifetime visitor identities. Only a truncated one-way hash and dates are shown — never IP addresses.",
};

interface SampleRow {
  id: string;
  primary: string;
  secondary: string;
}

interface PreviewInfo {
  requested?: number;
  matched: number;
  total: number;
  oldestAffected: string | null;
  newestAffected: string | null;
}

interface ConfirmState {
  table: EligibleTable;
  mode: "date" | "ids";
  days?: number;
  idsCount?: number;
  preview: PreviewInfo;
}

function formatKB(kb: number): string {
  return kb >= 1024 ? `${(kb / 1024).toFixed(2)} MB` : `${kb} KB`;
}

function formatCount(value: number | null | undefined): string {
  return typeof value === "number" ? value.toLocaleString() : "—";
}

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let unit = 0;

  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }

  return `${value >= 100 ? value.toFixed(0) : value.toFixed(value >= 10 ? 1 : 2)} ${units[unit]}`;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function Badge({
  tone,
  children,
}: {
  tone: "neutral" | "amber" | "emerald";
  children: React.ReactNode;
}) {
  const tones = {
    neutral:
      "bg-ink/[0.05] text-ink-secondary dark:bg-ink-dark/[0.08] dark:text-ink-dark-secondary",
    amber:
      "bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
    emerald:
      "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
  } as const;

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

interface TableRowProps {
  name: string;
  purpose: React.ReactNode;
  badges?: React.ReactNode;
  note?: React.ReactNode;
  stat?: TableStat;
  showOldest?: boolean;
  last?: boolean;
}

function TableRow({
  name,
  purpose,
  badges,
  note,
  stat,
  showOldest = true,
  last = false,
}: TableRowProps) {
  return (
    <li
      className={`flex flex-col gap-3 border-b border-line/50 py-4 sm:flex-row sm:items-center dark:border-line-dark/50 ${
        last ? "border-b-0" : ""
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <code className="font-mono text-[13px] font-semibold text-ink dark:text-ink-dark">
            {name}
          </code>
          {badges}
        </div>
        <p className="mt-1 text-[13px] text-ink-secondary dark:text-ink-dark-secondary">
          {purpose}
        </p>
        {note}
      </div>
      <div className="flex items-center justify-between gap-6 sm:flex-col sm:items-end sm:justify-center">
        <span className="text-[20px] font-semibold leading-none tabular-nums text-ink dark:text-ink-dark">
          {formatCount(stat?.count)}
        </span>
        <span className="text-[12px] tabular-nums text-ink-tertiary dark:text-ink-dark-secondary">
          {showOldest ? `oldest: ${formatDate(stat?.oldest)}` : "rows"}
        </span>
      </div>
    </li>
  );
}

function reasonMessage(reason: unknown): string {
  switch (reason) {
    case "unauthorized":
    case "forbidden":
      return "Your session is not authorized for this action. Sign in again.";
    case "count_mismatch":
      return "The row counts changed since your preview. Review again before deleting.";
    case "full_table_wipe_blocked":
      return "Blocked: a date-based cleanup must always leave rows behind.";
    default:
      return "The operation could not be completed. Try again in a moment.";
  }
}

export default function AdminStoragePage() {
  const [stats, setStats] = useState<TableStats>({});
  const [totalRecords, setTotalRecords] = useState<number | null>(null);
  const [uvStats, setUvStats] = useState<{
    total: number | null;
    active24h: number | null;
    newestFirst: string | null;
    latest: string | null;
  }>({ total: null, active24h: null, newestFirst: null, latest: null });
  const [sessionVerified, setSessionVerified] = useState<boolean | null>(null);
  const [gmail, setGmail] = useState<GmailStatus | null>(null);
  const [dbHealth, setDbHealth] = useState<DbHealth | null>(null);
  const [dbHealthState, setDbHealthState] = useState<
    "loading" | "ok" | "unavailable"
  >("loading");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [samples, setSamples] = useState<Record<string, SampleRow[]>>({});
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [days, setDays] = useState<Record<string, string>>({});
  const [modal, setModal] = useState<ConfirmState | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [modalBusy, setModalBusy] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: "ok" | "err"; text: string } | null>(
    null
  );

  const load = useCallback(async function load() {
    const supabase = getSupabase();

    const oldest = (table: string) =>
      supabase
        .from(table)
        .select("created_at")
        .order("created_at", { ascending: true })
        .limit(1);

    async function loadSamples(): Promise<Record<string, SampleRow[]>> {
      interface ViewSampleRow {
        id: number;
        path: string;
        device: string;
        created_at: string;
      }
      interface BookingSampleRow {
        id: string;
        title: string;
        status: string;
        start_time: string | null;
      }
      interface InquirySampleRow {
        id: string;
        status: string;
        created_at: string;
      }
      interface UniqueVisitorSampleRow {
        id: number;
        visitor_hash: string;
        first_seen: string;
        last_seen: string;
        visit_count: number;
      }

      const [viewsQ, bookingsQ, inquiriesQ, uvQ] = await Promise.all([
        supabase
          .from("page_views")
          .select("id, path, device, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("bookings_cache")
          .select("id, title, status, start_time")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("inquiries")
          .select("id, status, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("unique_visitors")
          .select("id, visitor_hash, first_seen, last_seen, visit_count")
          .order("last_seen", { ascending: false })
          .limit(5),
      ]);

      return {
        page_views: ((viewsQ.data ?? []) as ViewSampleRow[]).map((r) => ({
          id: String(r.id),
          primary: r.path || "(no path)",
          secondary: `${r.device} · ${formatDate(r.created_at)}`,
        })),
        bookings_cache: ((bookingsQ.data ?? []) as BookingSampleRow[]).map((r) => ({
          id: r.id,
          primary: r.title || "Booking",
          secondary: `${r.status} · ${formatDate(r.start_time)}`,
        })),
        inquiries: ((inquiriesQ.data ?? []) as InquirySampleRow[]).map((r) => ({
          id: r.id,
          primary: r.status,
          secondary: formatDate(r.created_at),
        })),
        unique_visitors: ((uvQ.data ?? []) as UniqueVisitorSampleRow[]).map(
          (r) => ({
            id: String(r.id),
            primary: `${r.visitor_hash.slice(0, 10)}…`,
            secondary: `first ${formatDate(r.first_seen)} · last ${formatDate(r.last_seen)} · ${r.visit_count} ${r.visit_count === 1 ? "visit" : "visits"}`,
          })
        ),
      };
    }

    async function loadGmail(): Promise<GmailStatus | null> {
      try {
        const { data: sessionData } = await getSupabase().auth.getSession();
        const token = sessionData?.session?.access_token;
        if (!token) return null;

        const response = await fetch("/api/gmail", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const json = (await response.json().catch(() => null)) as
          | ({ ok?: boolean; configured?: boolean; connected?: boolean })
          | null;

        if (!json?.ok || typeof json.configured !== "boolean") return null;
        return {
          configured: json.configured,
          connected: Boolean(json.connected),
        };
      } catch {
        return null;
      }
    }

    async function loadDbHealth(): Promise<DbHealth | null> {
      try {
        const { data: sessionData } = await getSupabase().auth.getSession();
        const token = sessionData?.session?.access_token;
        if (!token) return null;

        const response = await fetch("/api/admin/admin-db-health", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const json = (await response.json().catch(() => null)) as
          | ({
              ok?: boolean;
              databaseSize?: unknown;
              generatedAt?: unknown;
              largestTables?: unknown;
            })
          | null;

        if (
          !json?.ok ||
          typeof json.databaseSize !== "number" ||
          !Number.isFinite(json.databaseSize)
        ) {
          return null;
        }

        const rawTables = Array.isArray(json.largestTables)
          ? json.largestTables
          : [];

        const largestTables = rawTables
          .map((entry) => {
            const row = entry as { table?: unknown; totalBytes?: unknown };
            return {
              table: typeof row.table === "string" ? row.table : "",
              totalBytes:
                typeof row.totalBytes === "number" ? row.totalBytes : 0,
            };
          })
          .filter((row) => row.table !== "");

        return {
          databaseSize: json.databaseSize,
          largestTables,
          generatedAt:
            typeof json.generatedAt === "string" ? json.generatedAt : null,
        };
      } catch {
        return null;
      }
    }

    const [
      visitorsRow,
      viewsCount,
      viewsOldest,
      inquiriesCount,
      inquiriesOldest,
      bookingsCount,
      bookingsOldest,
      projectsCount,
      projectsOldest,
      activityCount,
      activityOldest,
      adminCheck,
      gmailStatus,
      uvTotal,
      uvActive24h,
      uvNewestFirst,
      uvLatestActivity,
      nextSamples,
      dbHealthResult,
    ] = await Promise.all([
      supabase.from("visitors").select("count").eq("id", 1).single(),
      supabase.from("page_views").select("*", { count: "exact", head: true }),
      oldest("page_views"),
      supabase.from("inquiries").select("*", { count: "exact", head: true }),
      oldest("inquiries"),
      supabase
        .from("bookings_cache")
        .select("*", { count: "exact", head: true }),
      oldest("bookings_cache"),
      supabase
        .from("portfolio_projects")
        .select("*", { count: "exact", head: true }),
      oldest("portfolio_projects"),
      supabase.from("activity_log").select("*", { count: "exact", head: true }),
      oldest("activity_log"),
      supabase.rpc("is_admin"),
      loadGmail(),
      supabase
        .from("unique_visitors")
        .select("*", { count: "exact", head: true }),
      supabase
        .from("unique_visitors")
        .select("*", { count: "exact", head: true })
        .gte(
          "last_seen",
          new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        ),
      supabase
        .from("unique_visitors")
        .select("first_seen")
        .order("first_seen", { ascending: false })
        .limit(1),
      supabase
        .from("unique_visitors")
        .select("last_seen")
        .order("last_seen", { ascending: false })
        .limit(1),
      loadSamples(),
      loadDbHealth(),
    ]);

    const next: TableStats = {
      visitors: {
        count: visitorsRow.error ? null : (visitorsRow.data?.count ?? null),
        oldest: null,
      },
      page_views: {
        count: viewsCount.count ?? null,
        oldest: viewsOldest.data?.[0]?.created_at ?? null,
      },
      inquiries: {
        count: inquiriesCount.count ?? null,
        oldest: inquiriesOldest.data?.[0]?.created_at ?? null,
      },
      bookings_cache: {
        count: bookingsCount.count ?? null,
        oldest: bookingsOldest.data?.[0]?.created_at ?? null,
      },
      portfolio_projects: {
        count: projectsCount.count ?? null,
        oldest: projectsOldest.data?.[0]?.created_at ?? null,
      },
      activity_log: {
        count: activityCount.count ?? null,
        oldest: activityOldest.data?.[0]?.created_at ?? null,
      },
    };

    setStats(next);

    const counted = Object.values(next)
      .map((s) => s.count)
      .filter((n): n is number => typeof n === "number");
    setTotalRecords(counted.reduce((sum, n) => sum + n, 0));

    setUvStats({
      total: uvTotal.count ?? null,
      active24h: uvActive24h.count ?? null,
      newestFirst:
        (uvNewestFirst.data?.[0] as { first_seen?: string } | undefined)
          ?.first_seen ?? null,
      latest:
        (uvLatestActivity.data?.[0] as { last_seen?: string } | undefined)
          ?.last_seen ?? null,
    });

    setSessionVerified(adminCheck.data === true);

    if (
      visitorsRow.error ||
      viewsCount.error ||
      inquiriesCount.error ||
      bookingsCount.error ||
      projectsCount.error ||
      activityCount.error
    ) {
      setError(
        "Some database metrics could not be loaded with the current session. Values shown as — were blocked or unavailable."
      );
    }

    setGmail(gmailStatus);
    setSamples(nextSamples);

    if (dbHealthResult) {
      setDbHealth(dbHealthResult);
      setDbHealthState("ok");
    } else {
      setDbHealth(null);
      setDbHealthState("unavailable");
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function callStorageApi(
    body: Record<string, unknown>
  ): Promise<({ ok: boolean; reason?: string } & Record<string, unknown>) | null> {
    const { data: sessionData } = await getSupabase().auth.getSession();
    const token = sessionData?.session?.access_token;

    if (!token) {
      throw new Error("Session expired — please sign in again.");
    }

    const response = await fetch("/api/admin/storage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    return (await response.json().catch(() => null)) as
      | ({ ok: boolean; reason?: string } & Record<string, unknown>)
      | null;
  }

  function toggleSample(table: EligibleTable, id: string) {
    setSelected((prev) => {
      const current = prev[table] ?? [];
      const next = current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id];
      return { ...prev, [table]: next };
    });
  }

  async function previewDays(table: EligibleTable) {
    setNotice(null);
    setModalError(null);

    const parsed = Number.parseInt(days[table] ?? "", 10);

    if (!Number.isInteger(parsed) || parsed < 1) {
      setNotice({
        tone: "err",
        text: "Enter a whole number of days (1 or more) to preview a date-based cleanup.",
      });
      return;
    }

    try {
      const json = await callStorageApi({
        action: "preview",
        table,
        olderThanDays: parsed,
      });

      if (!json?.ok) {
        setNotice({ tone: "err", text: reasonMessage(json?.reason) });
        return;
      }

      setConfirmText("");
      setModal({
        table,
        mode: "date",
        days: parsed,
        preview: {
          matched: Number(json.matched ?? 0),
          total: Number(json.total ?? 0),
          requested: undefined,
          oldestAffected: (json.oldest_affected as string | null) ?? null,
          newestAffected: (json.newest_affected as string | null) ?? null,
        },
      });
    } catch (err) {
      setNotice({
        tone: "err",
        text: err instanceof Error ? err.message : "Preview failed.",
      });
    }
  }

  async function previewSelected(table: EligibleTable) {
    setNotice(null);
    setModalError(null);

    const ids = selected[table] ?? [];

    if (ids.length === 0) return;

    try {
      const json = await callStorageApi({ action: "preview", table, ids });

      if (!json?.ok) {
        setNotice({ tone: "err", text: reasonMessage(json?.reason) });
        return;
      }

      setConfirmText("");
      setModal({
        table,
        mode: "ids",
        idsCount: ids.length,
        preview: {
          requested: Number(json.requested ?? ids.length),
          matched: Number(json.matched ?? 0),
          total: Number(json.total ?? 0),
          oldestAffected: (json.oldest_affected as string | null) ?? null,
          newestAffected: (json.newest_affected as string | null) ?? null,
        },
      });
    } catch (err) {
      setNotice({
        tone: "err",
        text: err instanceof Error ? err.message : "Preview failed.",
      });
    }
  }

  async function executeConfirmed() {
    if (!modal || modalBusy) return;

    if (confirmText !== modal.table) return;

    setModalBusy(true);
    setModalError(null);

    try {
      const body: Record<string, unknown> =
        modal.mode === "date"
          ? {
              action: "delete",
              table: modal.table,
              olderThanDays: modal.days,
              confirmCount: modal.preview.matched,
            }
          : {
              action: "delete",
              table: modal.table,
              ids: selected[modal.table] ?? [],
              confirmCount: modal.preview.matched,
            };

      const json = await callStorageApi(body);

      if (!json?.ok) {
        setModalError(reasonMessage(json?.reason));
        return;
      }

      const deleted = Number(json.deleted ?? 0);

      setModal(null);
      setNotice({
        tone: "ok",
        text: `Deleted ${deleted.toLocaleString()} ${
          deleted === 1 ? "row" : "rows"
        } from ${modal.table}. The run was recorded in the activity log.`,
      });

      setSelected((prev) => ({ ...prev, [modal.table]: [] }));
      await load();
    } catch (err) {
      setModalError(
        err instanceof Error ? err.message : "Deletion could not be completed."
      );
    } finally {
      setModalBusy(false);
    }
  }

  const confirmReady = Boolean(modal) && confirmText === modal?.table && !modalBusy;

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent dark:text-accent-dark">
          System
        </span>

        <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.03em] text-ink dark:text-ink-dark">
          Storage &amp; Database
        </h1>

        <p className="mt-1 text-[14px] text-ink-secondary dark:text-ink-dark-secondary">
          What your data and assets consume — with guarded, confirmation-gated
          cleanup tools.
        </p>
      </div>

      {error && (
        <div className="rounded-apple-lg border border-amber-500/30 bg-amber-500/[0.06] px-4 py-3 text-[13px] text-amber-700 dark:border-amber-500/25 dark:bg-amber-500/[0.08] dark:text-amber-400">
          {error}
        </div>
      )}

      {notice && (
        <div
          className={`rounded-apple-lg border px-4 py-3 text-[13px] ${
            notice.tone === "ok"
              ? "border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/[0.08] dark:text-emerald-400"
              : "border-amber-500/30 bg-amber-500/[0.06] text-amber-700 dark:border-amber-500/25 dark:bg-amber-500/[0.08] dark:text-amber-400"
          }`}
        >
          {notice.text}
        </div>
      )}

      {/* Top stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-[132px] animate-pulse rounded-apple-lg border border-line/70 bg-surface-card dark:border-line-dark/70 dark:bg-surface-dark-card"
            />
          ))
        ) : (
          <>
            <StatCard
              label="Total database records"
              value={totalRecords === null ? "—" : totalRecords.toLocaleString()}
              hint="Across the six tracked tables"
            />
            <StatCard
              label="Largest table"
              value={formatCount(stats.page_views?.count)}
              hint="page_views — analytics events"
            />
            <StatCard
              label="Local repo assets"
              value={`${LOCAL_ASSET_TOTALS.mb.toFixed(2)} MB`}
              hint={`~${LOCAL_ASSET_TOTALS.files} files under public/ (not database records)`}
            />
          </>
        )}
      </div>

      {/* Database tables */}
      <section className="rounded-apple-lg border border-line/70 bg-surface-card p-6 dark:border-line-dark/70 dark:bg-surface-dark-card">
        <h2 className="text-[15px] font-semibold tracking-tight text-ink dark:text-ink-dark">
          Database tables
        </h2>

        <p className="mt-1 text-[13px] text-ink-secondary dark:text-ink-dark-secondary">
          Every read runs through Row Level Security with your admin session.
          These metrics are read-only — cleanup tools live further down.
        </p>

        {loading ? (
          <div className="mt-5 flex flex-col gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-16 w-full animate-pulse rounded-apple-sm bg-ink/[0.06] dark:bg-ink-dark/[0.08]"
              />
            ))}
          </div>
        ) : (
          <ul className="mt-5 flex flex-col">
            <TableRow
              name="visitors"
              badges={<Badge tone="neutral">Permanent counter</Badge>}
              purpose={
                <>Global lifetime visitor counter — single row, no timestamps.</>
              }
              stat={stats.visitors}
              showOldest={false}
            />

            <TableRow
              name="page_views"
              badges={<Badge tone="amber">Unbounded growth</Badge>}
              purpose={
                <>Privacy-safe analytics events — one row per page view, forever.</>
              }
              note={
                <p className="mt-1.5 text-[12px] font-medium text-amber-600 dark:text-amber-400">
                  Cleanup is possible only through the manual, confirmed tools
                  below — never automatically.
                </p>
              }
              stat={stats.page_views}
            />

            <TableRow
              name="inquiries"
              badges={<Badge tone="neutral">Contains PII</Badge>}
              purpose={
                <>
                  Contact-form submissions. Contents are never shown on this page.
                </>
              }
              stat={stats.inquiries}
            />

            <TableRow
              name="bookings_cache"
              badges={<Badge tone="neutral">Reconstructable cache</Badge>}
              purpose={
                <>Cal.com booking sync target — rebuildable from the Cal.com API.</>
              }
              stat={stats.bookings_cache}
            />

            <TableRow
              name="portfolio_projects"
              badges={
                stats.portfolio_projects?.count === 0 ? (
                  <Badge tone="emerald">Static fallback currently active</Badge>
                ) : undefined
              }
              purpose={
                <>
                  Projects CMS. When empty, the public site renders{" "}
                  <code className="font-mono text-[12px]">data/projects.ts</code>{" "}
                  instead.
                </>
              }
              stat={stats.portfolio_projects}
            />

            <TableRow
              name="activity_log"
              badges={<Badge tone="neutral">Audit trail</Badge>}
              purpose={
                <>Append-only event feed for bookings and project changes.</>
              }
              stat={stats.activity_log}
              last
            />
          </ul>
        )}
      </section>

      {/* Database health */}
      <section className="rounded-apple-lg border border-line/70 bg-surface-card p-6 dark:border-line-dark/70 dark:bg-surface-dark-card">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-[15px] font-semibold tracking-tight text-ink dark:text-ink-dark">
            Database Health
          </h2>
          <span className="text-[12px] text-ink-tertiary dark:text-ink-dark-secondary">
            Live PostgreSQL metrics — read-only
          </span>
        </div>

        {dbHealthState === "loading" ? (
          <div className="mt-5 flex flex-col gap-3">
            <div className="h-8 w-full max-w-xs animate-pulse rounded-full bg-ink/[0.06] dark:bg-ink-dark/[0.08]" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-6 w-full max-w-md animate-pulse rounded-full bg-ink/[0.06] dark:bg-ink-dark/[0.08]"
              />
            ))}
          </div>
        ) : dbHealthState === "ok" && dbHealth ? (
          <>
            <p className="mt-4 text-[14px] text-ink-secondary dark:text-ink-dark-secondary">
              Database size:{" "}
              <span className="font-semibold tabular-nums text-ink dark:text-ink-dark">
                {formatBytes(dbHealth.databaseSize)}
              </span>{" "}
              ({dbHealth.databaseSize.toLocaleString()} bytes)
            </p>

            <p className="mt-1.5 text-[12.5px] text-ink-tertiary dark:text-ink-dark-secondary">
              Measured directly by PostgreSQL via{" "}
              <code className="font-mono text-[12px]">pg_database_size()</code>.
              No capacity or percentage is shown — Supabase plan quotas are not
              exposed to the database.
            </p>

            {dbHealth.largestTables.length > 0 && (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[420px] text-left text-[13px]">
                  <thead>
                    <tr className="border-b border-line/60 text-[11px] uppercase tracking-[0.12em] text-ink-tertiary dark:border-line-dark/60 dark:text-ink-dark-secondary">
                      <th className="pb-2 pr-4 font-semibold">Table</th>
                      <th className="pb-2 pr-4 text-right font-semibold">
                        Total size (data + indexes)
                      </th>
                      <th className="pb-2 text-right font-semibold">Rows</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dbHealth.largestTables.map((row) => (
                      <tr
                        key={row.table}
                        className="border-b border-line/40 last:border-none dark:border-line-dark/40"
                      >
                        <td className="py-2.5 pr-4 font-mono text-[12.5px] text-ink dark:text-ink-dark">
                          public.{row.table}
                        </td>
                        <td className="py-2.5 pr-4 text-right tabular-nums text-ink-secondary dark:text-ink-dark-secondary">
                          {formatBytes(row.totalBytes)}
                        </td>
                        <td className="py-2.5 text-right tabular-nums text-ink-secondary dark:text-ink-dark-secondary">
                          {formatCount(stats[row.table]?.count)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {dbHealth.generatedAt && (
              <p className="mt-3 text-[12px] text-ink-tertiary dark:text-ink-dark-secondary">
                Snapshot taken {formatDate(dbHealth.generatedAt)} — refresh the
                page for a new reading.
              </p>
            )}
          </>
        ) : (
          <>
            <p className="mt-4 text-[14px] text-ink-secondary dark:text-ink-dark-secondary">
              Database storage metrics unavailable.
            </p>

            <p className="mt-2 text-[13px] text-ink-secondary dark:text-ink-dark-secondary">
              Accurate PostgreSQL storage usage requires the admin-only database
              function from migration{" "}
              <code className="font-mono text-[12px]">005_admin_db_health.sql</code>{" "}
              to be applied in the Supabase SQL Editor. No estimates are shown —
              row counts are not a measure of storage.
            </p>
          </>
        )}
      </section>

      {/* Protected system tables */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-apple-lg border border-line/70 bg-surface-card p-6 dark:border-line-dark/70 dark:bg-surface-dark-card">
          <div className="flex flex-wrap items-center gap-2">
            <code className="font-mono text-[13px] font-semibold text-ink dark:text-ink-dark">
              admin_users
            </code>
            <Badge tone="emerald">
              {sessionVerified ? "Session verified as admin" : "Protected"}
            </Badge>
          </div>
          <p className="mt-2 text-[13px] text-ink-secondary dark:text-ink-dark-secondary">
            Allowlist active. Row contents are intentionally unreadable, even to
            admins — membership is proven only through the{" "}
            <code className="font-mono text-[12px]">is_admin()</code> check.
          </p>
        </div>

        <div className="rounded-apple-lg border border-line/70 bg-surface-card p-6 dark:border-line-dark/70 dark:bg-surface-dark-card">
          <div className="flex flex-wrap items-center gap-2">
            <code className="font-mono text-[13px] font-semibold text-ink dark:text-ink-dark">
              integration_tokens
            </code>
            <Badge tone="neutral">Protected system data</Badge>
          </div>
          <p className="mt-2 text-[13px] text-ink-secondary dark:text-ink-dark-secondary">
            OAuth credentials. Token contents are never displayed. Gmail
            integration status:{" "}
            {gmail === null
              ? "unknown"
              : `${gmail.configured ? "configured" : "not configured"}, ${
                  gmail.connected ? "connected" : "not connected"
                }`}
            .
          </p>
        </div>
      </div>

      {/* Supabase Storage */}
      <section className="rounded-apple-lg border border-line/70 bg-surface-card p-6 dark:border-line-dark/70 dark:bg-surface-dark-card">
        <h2 className="text-[15px] font-semibold tracking-tight text-ink dark:text-ink-dark">
          Supabase Storage
        </h2>

        <p className="mt-3 text-[14px] text-ink-secondary dark:text-ink-dark-secondary">
          No Supabase Storage usage detected.
        </p>

        <p className="mt-2 text-[13px] text-ink-secondary dark:text-ink-dark-secondary">
          This project stores no objects in Supabase buckets — all media ships as
          repository files under{" "}
          <code className="font-mono text-[12px]">public/</code>. There is nothing
          to inspect or manage here.
        </p>
      </section>

      {/* Unique visitors */}
      <section className="rounded-apple-lg border border-line/70 bg-surface-card p-6 dark:border-line-dark/70 dark:bg-surface-dark-card">
        <h2 className="text-[15px] font-semibold tracking-tight text-ink dark:text-ink-dark">
          Unique Visitors
        </h2>

        <p className="mt-1 text-[13px] text-ink-secondary dark:text-ink-dark-secondary">
          Lifetime distinct visitor identities. Only a truncated one-way hash is
          ever shown — IP addresses and user agents are never stored. Deletion
          tools for this dataset are in Manual Cleanup below.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total unique visitors"
            value={formatCount(uvStats.total)}
            hint="Distinct identities since tracking began"
          />
          <StatCard
            label="Active last 24h"
            value={formatCount(uvStats.active24h)}
            hint="Identities seen within the last day"
          />
          <StatCard
            label="Newest first seen"
            value={formatDate(uvStats.newestFirst)}
            hint="Most recent new identity"
          />
          <StatCard
            label="Latest activity"
            value={formatDate(uvStats.latest)}
            hint="Most recent returning visit"
          />
        </div>

        {(samples.unique_visitors ?? []).length > 0 && (
          <ul className="mt-5 flex flex-col divide-y divide-line/50 dark:divide-line-dark/50">
            {samples.unique_visitors.map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-[13px]"
              >
                <code className="font-mono font-medium text-ink dark:text-ink-dark">
                  {row.primary}
                </code>
                <span className="text-ink-tertiary dark:text-ink-dark-secondary">
                  {row.secondary}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Local assets */}
      <section className="rounded-apple-lg border border-line/70 bg-surface-card p-6 dark:border-line-dark/70 dark:bg-surface-dark-card">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-[15px] font-semibold tracking-tight text-ink dark:text-ink-dark">
            Local Assets
          </h2>
          <span className="text-[12px] text-ink-tertiary dark:text-ink-dark-secondary">
            Repository audit snapshot — {AUDITED_ON}
          </span>
        </div>

        <p className="mt-2 text-[13px] text-ink-secondary dark:text-ink-dark-secondary">
          Repository and deployment assets under{" "}
          <code className="font-mono text-[12px]">public/</code>, served directly by
          the website. These are not database records and not Supabase Storage
          objects — they live in the Git repository and deploy with the app.
        </p>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-line/60 text-[11px] uppercase tracking-[0.12em] text-ink-tertiary dark:border-line-dark/60 dark:text-ink-dark-secondary">
                <th className="pb-2 pr-4 font-semibold">Directory</th>
                <th className="pb-2 pr-4 text-right font-semibold">Files</th>
                <th className="pb-2 text-right font-semibold">Size</th>
              </tr>
            </thead>
            <tbody>
              {LOCAL_ASSET_DIRS.map((row) => (
                <tr
                  key={row.dir}
                  className="border-b border-line/40 last:border-none dark:border-line-dark/40"
                >
                  <td className="py-2.5 pr-4 font-mono text-[12.5px] text-ink dark:text-ink-dark">
                    public/{row.dir}
                  </td>
                  <td className="py-2.5 pr-4 text-right tabular-nums text-ink-secondary dark:text-ink-dark-secondary">
                    {row.files}
                  </td>
                  <td className="py-2.5 text-right tabular-nums text-ink-secondary dark:text-ink-dark-secondary">
                    {formatKB(row.kb)}
                  </td>
                </tr>
              ))}
              <tr>
                <td className="pt-3 pr-4 font-semibold text-ink dark:text-ink-dark">
                  Total
                </td>
                <td className="pt-3 pr-4 text-right font-semibold tabular-nums text-ink dark:text-ink-dark">
                  ~{LOCAL_ASSET_TOTALS.files}
                </td>
                <td className="pt-3 text-right font-semibold tabular-nums text-ink dark:text-ink-dark">
                  ~{LOCAL_ASSET_TOTALS.mb.toFixed(2)} MB
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Potentially unused local assets */}
      <section className="rounded-apple-lg border border-amber-500/30 bg-surface-card p-6 dark:border-amber-500/25 dark:bg-surface-dark-card">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-[15px] font-semibold tracking-tight text-ink dark:text-ink-dark">
            Potentially Unused Local Assets
          </h2>
          <Badge tone="amber">Potentially unused — manual review required</Badge>
        </div>

        <ul className="mt-4 flex flex-col">
          {UNUSED_CANDIDATES.map((candidate) => (
            <li
              key={candidate.path}
              className="flex items-center justify-between gap-4 border-b border-line/40 py-2.5 last:border-none dark:border-line-dark/40"
            >
              <code className="min-w-0 truncate font-mono text-[12.5px] text-ink dark:text-ink-dark">
                {candidate.path}
              </code>
              <span className="shrink-0 tabular-nums text-[12.5px] text-ink-secondary dark:text-ink-dark-secondary">
                {candidate.size}
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-4 text-[12.5px] text-ink-secondary dark:text-ink-dark-secondary">
          Informational only. Nothing is deleted automatically and these files
          have no deletion controls anywhere in this app. Confirm references
          before removing anything manually.
        </p>
      </section>

      {/* Referenced but missing */}
      <section className="rounded-apple-lg border border-line/70 bg-surface-card p-6 dark:border-line-dark/70 dark:bg-surface-dark-card">
        <h2 className="text-[15px] font-semibold tracking-tight text-ink dark:text-ink-dark">
          Referenced but Missing
        </h2>

        <p className="mt-2 text-[13px] text-ink-secondary dark:text-ink-dark-secondary">
          These paths are referenced by{" "}
          <code className="font-mono text-[12px]">data/projects.ts</code> but absent
          from{" "}
          <code className="font-mono text-[12px]">public/images/projects/</code>.
          They are broken references, not unused files — never deletion candidates.
        </p>

        <ul className="mt-4 flex flex-col">
          {MISSING_REFERENCES.map((path) => (
            <li
              key={path}
              className="border-b border-line/40 py-2.5 last:border-none dark:border-line-dark/40"
            >
              <code className="font-mono text-[12.5px] text-ink dark:text-ink-dark">
                {path}
              </code>
            </li>
          ))}
        </ul>
      </section>

      {/* Manual cleanup */}
      <section className="rounded-apple-lg border border-red-500/25 bg-surface-card p-6 dark:border-red-500/20 dark:bg-surface-dark-card">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-[15px] font-semibold tracking-tight text-ink dark:text-ink-dark">
            Manual Cleanup
          </h2>
          <Badge tone="amber">Destructive — typed confirmation required</Badge>
        </div>

        <p className="mt-2 text-[13px] text-ink-secondary dark:text-ink-dark-secondary">
          Deletion runs server-side behind admin verification, always shows an
          exact preview first, and requires typing the table name to confirm.
          Every run is recorded in{" "}
          <code className="font-mono text-[12px]">activity_log</code>. Nothing is
          ever deleted automatically — there are no schedules, jobs, or retention
          rules. Permanently blocked tables:{" "}
          <code className="font-mono text-[12px]">
            visitors, portfolio_projects, activity_log, admin_users,
            integration_tokens
          </code>
          .
        </p>

        <div className="mt-5 flex flex-col gap-6">
          {!loading &&
            CLEANUP_TABLES.map((table) => {
              const rows = samples[table] ?? [];
              const selectedIds = selected[table] ?? [];

              return (
                <div
                  key={table}
                  className="rounded-apple-md border border-line/60 p-4 dark:border-line-dark/60"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <code className="font-mono text-[13px] font-semibold text-ink dark:text-ink-dark">
                        {table}
                      </code>
                      <span className="text-[12px] tabular-nums text-ink-tertiary dark:text-ink-dark-secondary">
                        {formatCount(stats[table]?.count)} rows currently
                      </span>
                    </div>
                  </div>

                  <p className="mt-1 text-[12.5px] text-ink-secondary dark:text-ink-dark-secondary">
                    {CLEANUP_PURPOSE[table]}
                  </p>

                  {rows.length > 0 && (
                    <ul className="mt-3 flex flex-col">
                      {rows.map((row) => (
                        <li
                          key={row.id}
                          className="flex items-center gap-3 border-b border-line/40 py-2 last:border-none dark:border-line-dark/40"
                        >
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(row.id)}
                            onChange={() => toggleSample(table, row.id)}
                            aria-label={`Select row ${row.primary}`}
                            className="h-4 w-4 shrink-0 accent-red-500"
                          />
                          <span className="min-w-0 flex-1 truncate text-[12.5px] text-ink dark:text-ink-dark">
                            {row.primary}
                          </span>
                          <span className="shrink-0 text-[11.5px] tabular-nums text-ink-tertiary dark:text-ink-dark-secondary">
                            {row.secondary}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-2 text-[12.5px] text-ink-secondary dark:text-ink-dark-secondary">
                      Delete rows older than
                      <input
                        type="number"
                        min={1}
                        inputMode="numeric"
                        value={days[table] ?? ""}
                        onChange={(e) =>
                          setDays((prev) => ({
                            ...prev,
                            [table]: e.target.value,
                          }))
                        }
                        className="w-20 rounded-apple-sm border border-line/70 bg-transparent px-2 py-1.5 text-[13px] tabular-nums text-ink focus:border-accent focus:outline-none dark:border-line-dark/70 dark:text-ink-dark"
                      />
                      days
                    </label>

                    <button
                      type="button"
                      onClick={() => previewDays(table)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-full border border-line/80 px-4 py-2 text-[13px] font-medium text-ink-secondary transition-colors duration-150 hover:border-ink/15 hover:bg-ink/[0.04] hover:text-ink active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:pointer-events-none disabled:opacity-40 dark:border-line-dark/80 dark:text-ink-dark-secondary dark:hover:border-ink-dark/25 dark:hover:bg-ink-dark/[0.06] dark:hover:text-ink-dark"
                    >
                      Preview date-based cleanup
                    </button>

                    {selectedIds.length > 0 && (
                      <button
                        type="button"
                        onClick={() => previewSelected(table)}
                        className="inline-flex items-center justify-center gap-1.5 rounded-full bg-red-500 px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition-all duration-150 hover:bg-red-600 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50"
                      >
                        Review {selectedIds.length} selected{" "}
                        {selectedIds.length === 1 ? "row" : "rows"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </section>

      <p className="pb-2 text-[12.5px] text-ink-tertiary dark:text-ink-dark-secondary">
        Inventory sections above are read-only. The only writes possible from
        this page are the manual deletions in Manual Cleanup, each requiring a
        fresh server-side preview and a typed confirmation, each recorded in the
        activity log. Nothing runs on a schedule.
      </p>

      {/* Confirmation modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-apple-lg border border-line/70 bg-surface-card p-6 shadow-xl dark:border-line-dark/70 dark:bg-surface-dark-card">
            <h3 className="text-[16px] font-semibold tracking-tight text-ink dark:text-ink-dark">
              Confirm deletion
            </h3>

            <dl className="mt-4 flex flex-col gap-2 text-[13px]">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-ink-secondary dark:text-ink-dark-secondary">
                  Table
                </dt>
                <dd>
                  <code className="font-mono text-[12.5px] font-semibold text-ink dark:text-ink-dark">
                    {modal.table}
                  </code>
                </dd>
              </div>

              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-ink-secondary dark:text-ink-dark-secondary">
                  Operation
                </dt>
                <dd className="text-right text-ink dark:text-ink-dark">
                  {modal.mode === "date"
                    ? `Delete rows older than ${modal.days} day${
                        (modal.days ?? 0) === 1 ? "" : "s"
                      }`
                    : `Delete selected rows (${modal.preview.matched} of ${
                        modal.preview.requested ?? modal.idsCount ?? 0
                      } found)`}
                </dd>
              </div>

              <div className="mt-1 flex items-center justify-between gap-4 rounded-apple-sm bg-red-500/[0.06] px-3 py-2.5 dark:bg-red-500/[0.08]">
                <dt className="font-medium text-ink dark:text-ink-dark">
                  Rows to be deleted
                </dt>
                <dd className="text-[18px] font-semibold tabular-nums text-red-600 dark:text-red-400">
                  {modal.preview.matched.toLocaleString()}
                </dd>
              </div>

              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-ink-secondary dark:text-ink-dark-secondary">
                  Oldest affected
                </dt>
                <dd className="tabular-nums text-ink dark:text-ink-dark">
                  {formatDate(modal.preview.oldestAffected)}
                </dd>
              </div>

              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-ink-secondary dark:text-ink-dark-secondary">
                  Newest affected
                </dt>
                <dd className="tabular-nums text-ink dark:text-ink-dark">
                  {formatDate(modal.preview.newestAffected)}
                </dd>
              </div>

              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-ink-secondary dark:text-ink-dark-secondary">
                  Rows remaining after
                </dt>
                <dd className="tabular-nums text-ink dark:text-ink-dark">
                  {(modal.preview.total - modal.preview.matched).toLocaleString()}
                </dd>
              </div>
            </dl>

            <p className="mt-4 text-[12.5px] leading-relaxed text-amber-600 dark:text-amber-400">
              This permanently removes the rows listed above and cannot be
              undone. The deletion is verified server-side against this exact
              count before it runs.
            </p>

            <label className="mt-4 block text-[12.5px] font-medium text-ink-secondary dark:text-ink-dark-secondary">
              Type{" "}
              <code className="font-mono text-[12px] text-ink dark:text-ink-dark">
                {modal.table}
              </code>{" "}
              to enable deletion
            </label>

            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              spellCheck={false}
              autoComplete="off"
              className="mt-1.5 w-full rounded-apple-sm border border-line/70 bg-transparent px-3 py-2 font-mono text-[13px] text-ink focus:border-red-400 focus:outline-none dark:border-line-dark/70 dark:text-ink-dark"
            />

            {modalError && (
              <p className="mt-3 text-[12.5px] text-red-600 dark:text-red-400">
                {modalError}
              </p>
            )}

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setModal(null)}
                disabled={modalBusy}
                className="inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium text-ink-secondary transition-colors duration-150 hover:bg-ink/[0.04] hover:text-ink active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:pointer-events-none disabled:opacity-40 dark:text-ink-dark-secondary dark:hover:bg-ink-dark/[0.06] dark:hover:text-ink-dark"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={executeConfirmed}
                disabled={!confirmReady}
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-red-500 px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition-all duration-150 hover:bg-red-600 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50 disabled:pointer-events-none disabled:opacity-40"
              >
                {modalBusy
                  ? "Deleting…"
                  : `Delete ${modal.preview.matched.toLocaleString()} ${
                      modal.preview.matched === 1 ? "row" : "rows"
                    }`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
