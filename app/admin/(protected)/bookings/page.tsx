"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { getSupabase } from "@/lib/supabase";

interface BookingRow {
  id: string;
  cal_booking_uid: string;
  name: string;
  email: string;
  title: string;
  start_time: string | null;
  timezone: string | null;
  status: string;
  synced_at: string;
}

const STATUS_PILL: Record<string, string> = {
  accepted:
    "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400",
  pending:
    "bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400",
  cancelled:
    "bg-red-500/10 text-red-500 dark:bg-red-400/10 dark:text-red-400",
};

function statusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

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
  return `${days}d ago`;
}

function formatDateTime(iso: string): { date: string; time: string } {
  const date = new Date(iso);
  return {
    date: date.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    time: date.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }),
  };
}

export default function AdminBookingsPage() {
  const [rows, setRows] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [stale, setStale] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  const fetchCache = useCallback(async () => {
    const { data, error } = await getSupabase()
      .from("bookings_cache")
      .select(
        "id, cal_booking_uid, name, email, title, start_time, timezone, status, synced_at"
      )
      .order("start_time", { ascending: true, nullsFirst: false });

    if (error) {
      console.error("[bookings] cache load failed:", error.message);
      return;
    }

    const cacheRows = (data as BookingRow[]) ?? [];
    setRows(cacheRows);

    const freshest = cacheRows.reduce<string | null>((max, row) => {
      if (!row.synced_at) return max;
      return !max || row.synced_at > max ? row.synced_at : max;
    }, null);
    setLastSynced(freshest);
  }, []);

  const runSync = useCallback(async () => {
    setSyncing(true);

    try {
      const { data: sessionData } = await getSupabase().auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        setStale(true);
        return;
      }

      const response = await fetch("/api/bookings/sync", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const json: { ok?: boolean } = await response
        .json()
        .catch(() => ({ ok: false }));

      if (response.ok && json.ok) {
        setStale(false);
        await fetchCache();
      } else {
        setStale(true);
      }
    } catch {
      setStale(true);
    } finally {
      setSyncing(false);
    }
  }, [fetchCache]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      await fetchCache();
      if (!cancelled) await runSync();
      if (!cancelled) setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [fetchCache, runSync]);

  const now = Date.now();

  const upcoming = useMemo(
    () =>
      rows
        .filter(
          (r) =>
            r.status !== "cancelled" &&
            r.start_time !== null &&
            new Date(r.start_time).getTime() >= now
        )
        .sort(
          (a, b) =>
            new Date(a.start_time!).getTime() -
            new Date(b.start_time!).getTime()
        ),
    [rows, now]
  );

  const past = useMemo(() => {
    const upcomingUids = new Set(upcoming.map((r) => r.id));
    return rows
      .filter((r) => !upcomingUids.has(r.id))
      .sort((a, b) => {
        const aTime = a.start_time ? new Date(a.start_time).getTime() : 0;
        const bTime = b.start_time ? new Date(b.start_time).getTime() : 0;
        return bTime - aTime;
      });
  }, [rows, upcoming]);

  function BookingList({ items }: { items: BookingRow[] }) {
    if (items.length === 0) {
      return (
        <p className="mt-4 text-[14px] text-ink-secondary dark:text-ink-dark-secondary">
          Nothing here yet.
        </p>
      );
    }

    return (
      <ul className="mt-5 flex flex-col">
        {items.map((row) => {
          const when = row.start_time ? formatDateTime(row.start_time) : null;

          return (
            <li
              key={row.id}
              className="flex flex-col gap-1.5 border-b border-line/50 py-4 last:border-none sm:flex-row sm:items-center sm:gap-3 dark:border-line-dark/50"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-[14px] font-semibold tracking-tight text-ink dark:text-ink-dark">
                    {row.name || "Unnamed client"}
                  </span>

                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${
                      STATUS_PILL[row.status] ?? STATUS_PILL.accepted
                    }`}
                  >
                    {statusLabel(row.status)}
                  </span>
                </div>

                <span className="block truncate text-[13px] text-ink-secondary dark:text-ink-dark-secondary">
                  {row.email || "No email"}
                </span>
              </div>

              <div className="shrink-0 sm:text-right">
                <span className="block text-[13px] font-medium text-ink dark:text-ink-dark">
                  {when
                    ? `${when.date} · ${when.time}`
                    : "Unscheduled"}
                </span>

                <span className="block text-[12px] text-ink-tertiary dark:text-ink-dark-secondary">
                  {[row.title, row.timezone].filter(Boolean).join(" · ") ||
                    "Booking"}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent dark:text-accent-dark">
            Schedule
          </span>

          <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.03em] text-ink dark:text-ink-dark">
            Bookings
          </h1>

          <p className="mt-1 text-[14px] text-ink-secondary dark:text-ink-dark-secondary">
            Synced from your Cal.com account.
            {lastSynced && (
              <>
                {" "}
                Last synced{" "}
                <time dateTime={lastSynced}>{relativeTime(lastSynced)}</time>.
              </>
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={runSync}
          disabled={syncing}
          className="inline-flex items-center justify-center gap-1.5 rounded-full border border-line px-4 py-2 text-[13px] font-medium text-ink transition-colors duration-150 hover:border-ink/15 hover:bg-ink/[0.04] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:pointer-events-none disabled:opacity-40 dark:border-line-dark dark:text-ink-dark dark:hover:border-ink-dark/25 dark:hover:bg-ink-dark/[0.06]"
        >
          {syncing ? "Syncing…" : "Sync now"}
        </button>
      </div>

      {/* Stale notice */}
      {stale && (
        <p className="rounded-apple-sm border border-amber-500/20 bg-amber-500/[0.06] px-4 py-3 text-[13px] text-amber-600 dark:text-amber-400">
          Couldn&apos;t reach Cal.com just now — showing cached booking data.
        </p>
      )}

      {/* Upcoming */}
      <section className="rounded-apple-lg border border-line/70 bg-surface-card p-6 dark:border-line-dark/70 dark:bg-surface-dark-card">
        <h2 className="text-[15px] font-semibold tracking-tight text-ink dark:text-ink-dark">
          Upcoming
        </h2>

        {loading ? (
          <div className="mt-5 flex flex-col gap-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="h-12 w-full max-w-lg animate-pulse rounded-full bg-ink/[0.06] dark:bg-ink-dark/[0.08]"
              />
            ))}
          </div>
        ) : (
          <BookingList items={upcoming} />
        )}
      </section>

      {/* Past */}
      {!loading && (
        <section className="rounded-apple-lg border border-line/70 bg-surface-card p-6 dark:border-line-dark/70 dark:bg-surface-dark-card">
          <h2 className="text-[15px] font-semibold tracking-tight text-ink dark:text-ink-dark">
            Past &amp; cancelled
          </h2>

          <BookingList items={past} />
        </section>
      )}
    </div>
  );
}
