"use client";

import { useEffect, useMemo, useState } from "react";

import {
  countAllViews,
  dayKeyOf,
  fetchRecentViews,
  lastNDayKeys,
  shortDayLabel,
  startOfToday,
  tally,
  type Device,
  type PageViewRow,
} from "@/lib/admin/analytics";
import { getSupabase } from "@/lib/supabase";

const DEVICE_LABEL: Record<Device, string> = {
  mobile: "Mobile",
  tablet: "Tablet",
  desktop: "Desktop",
};

const DEVICE_BAR: Record<Device, string> = {
  mobile: "bg-blue-500",
  tablet: "bg-violet-500",
  desktop: "bg-emerald-500",
};

export default function AdminAnalyticsPage() {
  const [rows, setRows] = useState<PageViewRow[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [inquiries30d, setInquiries30d] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const since = new Date();
        since.setDate(since.getDate() - 30);

        const [recentRows, allTime, inquiriesCount] = await Promise.all([
          fetchRecentViews(30),
          countAllViews(),
          getSupabase()
            .from("inquiries")
            .select("*", { count: "exact", head: true })
            .gte("created_at", since.toISOString()),
        ]);

        if (cancelled) return;

        setRows(recentRows);
        setTotalViews(allTime);
        setInquiries30d(inquiriesCount.count ?? 0);
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

    return () => {
      cancelled = true;
    };
  }, []);

  // 14-day trend keyed by local day.
  const trend = useMemo(() => {
    const keys = lastNDayKeys(14);
    const counts = new Map<string, number>();
    for (const row of rows) {
      const key = dayKeyOf(row.created_at);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return keys.map((key) => ({ key, count: counts.get(key) ?? 0 }));
  }, [rows]);

  const maxTrend = useMemo(
    () => Math.max(1, ...trend.map((t) => t.count)),
    [trend]
  );

  const devices = useMemo(() => {
    const entries = tally(rows, (r) => r.device as Device | null);
    const map = new Map(entries.map((e) => [e.key, e.count]));
    const total = Math.max(1, rows.length);
    return (["mobile", "tablet", "desktop"] as Device[]).map((device) => ({
      device,
      count: map.get(device) ?? 0,
      pct: Math.round(((map.get(device) ?? 0) / total) * 100),
    }));
  }, [rows]);

  const topPages = useMemo(() => tally(rows, (r) => r.path).slice(0, 5), [rows]);
  const topReferrers = useMemo(
    () => tally(rows, (r) => r.referrer).slice(0, 5),
    [rows]
  );

  const conversion = useMemo(() => {
    const start = startOfToday();
    start.setDate(start.getDate() - 29);
    const views30d = rows.filter(
      (r) => new Date(r.created_at).getTime() >= start.getTime()
    ).length;
    if (views30d === 0) return null;
    return {
      views: views30d,
      rate: Math.round((inquiries30d / views30d) * 100),
    };
  }, [rows, inquiries30d]);

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent dark:text-accent-dark">
          Insights
        </span>

        <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.03em] text-ink dark:text-ink-dark">
          Analytics
        </h1>

        <p className="mt-1 text-[14px] text-ink-secondary dark:text-ink-dark-secondary">
          Simple, privacy-safe trends across your portfolio.
        </p>
      </div>

      {error && (
        <p className="rounded-apple-sm border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-[14px] text-red-500">
          {error}
        </p>
      )}

      {/* 14-day trend */}
      <section className="rounded-apple-lg border border-line/70 bg-surface-card p-4 sm:p-6 dark:border-line-dark/70 dark:bg-surface-dark-card">
        <h2 className="text-[15px] font-semibold tracking-tight text-ink dark:text-ink-dark">
          Page views
          <span className="ml-2 text-[12px] font-normal text-ink-tertiary dark:text-ink-dark-secondary">
            last 14 days
          </span>
        </h2>

        {loading ? (
          <div className="mt-6 h-[160px] animate-pulse rounded-apple-sm bg-ink/[0.04] dark:bg-ink-dark/[0.06]" />
        ) : (
          <>
            <div
              className="mt-6 flex h-[160px] items-end gap-[3px]"
              role="img"
              aria-label={`Page views per day over the last 14 days, ${totalViews} total`}
            >
              {trend.map(({ key, count }) => (
                <div
                  key={key}
                  className="group relative flex h-full flex-1 items-end"
                  title={`${shortDayLabel(key)} — ${count} view${count === 1 ? "" : "s"}`}
                >
                  <div
                    className="w-full rounded-t-[3px] bg-accent/80 transition-colors group-hover:bg-accent dark:bg-accent-dark/80 dark:group-hover:bg-accent-dark"
                    style={{ height: `${Math.max(count > 0 ? 4 : 1, (count / maxTrend) * 100)}%` }}
                  />
                </div>
              ))}
            </div>

            <div className="mt-2 flex gap-[3px]">
              {trend.map(({ key }, i) => (
                <span
                  key={key}
                  className="flex-1 truncate text-center text-[10px] tabular-nums text-ink-tertiary dark:text-ink-dark-secondary"
                >
                  {i % 3 === 1 ? shortDayLabel(key) : ""}
                </span>
              ))}
            </div>
          </>
        )}
      </section>

      {!loading && (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Device breakdown */}
          <section className="rounded-apple-lg border border-line/70 bg-surface-card p-4 sm:p-6 dark:border-line-dark/70 dark:bg-surface-dark-card">
            <h2 className="text-[15px] font-semibold tracking-tight text-ink dark:text-ink-dark">
              Devices
              <span className="ml-2 text-[12px] font-normal text-ink-tertiary dark:text-ink-dark-secondary">
                last 30 days
              </span>
            </h2>

            {rows.length === 0 ? (
              <p className="mt-4 text-[14px] text-ink-secondary dark:text-ink-dark-secondary">
                No data yet.
              </p>
            ) : (
              <ul className="mt-5 flex flex-col gap-4">
                {devices.map(({ device, count, pct }) => (
                  <li key={device}>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-[13px] font-medium text-ink dark:text-ink-dark">
                        {DEVICE_LABEL[device]}
                      </span>
                      <span className="text-[13px] tabular-nums text-ink-tertiary dark:text-ink-dark-secondary">
                        {count.toLocaleString()} · {pct}%
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/[0.06] dark:bg-ink-dark/[0.08]">
                      <div
                        className={`h-full rounded-full transition-[width] duration-500 ${DEVICE_BAR[device]}`}
                        style={{ width: `${Math.max(pct, 2)}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Conversion */}
          <section className="rounded-apple-lg border border-line/70 bg-surface-card p-4 sm:p-6 dark:border-line-dark/70 dark:bg-surface-dark-card">
            <h2 className="text-[15px] font-semibold tracking-tight text-ink dark:text-ink-dark">
              Inquiry conversion
              <span className="ml-2 text-[12px] font-normal text-ink-tertiary dark:text-ink-dark-secondary">
                last 30 days
              </span>
            </h2>

            <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-[18px] min-[380px]:text-[20px] sm:text-[24px] font-semibold leading-none tabular-nums tracking-[-0.02em] text-ink dark:text-ink-dark">
                  {rows.length.toLocaleString()}
                </span>
                <span className="text-[11.5px] sm:text-[12px] text-ink-secondary dark:text-ink-dark-secondary">
                  Views
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[18px] min-[380px]:text-[20px] sm:text-[24px] font-semibold leading-none tabular-nums tracking-[-0.02em] text-ink dark:text-ink-dark">
                  {inquiries30d.toLocaleString()}
                </span>
                <span className="text-[11.5px] sm:text-[12px] text-ink-secondary dark:text-ink-dark-secondary">
                  Inquiries
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[18px] min-[380px]:text-[20px] sm:text-[24px] font-semibold leading-none tabular-nums tracking-[-0.02em] text-accent dark:text-accent-dark">
                  {conversion ? `${conversion.rate}%` : "—"}
                </span>
                <span className="text-[11.5px] sm:text-[12px] text-ink-secondary dark:text-ink-dark-secondary">
                  Rate
                </span>
              </div>
            </div>

            <p className="mt-5 text-[13px] leading-relaxed text-ink-tertiary dark:text-ink-dark-secondary">
              {conversion
                ? `${inquiries30d} contact form submission${inquiries30d === 1 ? "" : "s"} out of ${conversion.views.toLocaleString()} tracked page views.`
                : "No tracked views in the last 30 days yet."}
            </p>
          </section>
        </div>
      )}

      {/* Top pages + referrers */}
      {!loading && (
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-apple-lg border border-line/70 bg-surface-card p-4 sm:p-6 dark:border-line-dark/70 dark:bg-surface-dark-card">
            <h2 className="text-[15px] font-semibold tracking-tight text-ink dark:text-ink-dark">
              Top pages
            </h2>

            {topPages.length === 0 ? (
              <p className="mt-4 text-[14px] text-ink-secondary dark:text-ink-dark-secondary">
                No data yet.
              </p>
            ) : (
              <ol className="mt-5 flex flex-col">
                {topPages.map(({ key, count }, i) => (
                  <li
                    key={key}
                    className="flex items-baseline gap-3 border-b border-line/50 py-3 last:border-none dark:border-line-dark/50"
                  >
                    <span className="w-4 shrink-0 text-[12px] tabular-nums text-ink-tertiary dark:text-ink-dark-secondary">
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-ink dark:text-ink-dark">
                      {key}
                    </span>
                    <span className="shrink-0 text-[13px] tabular-nums text-ink-tertiary dark:text-ink-dark-secondary">
                      {count.toLocaleString()}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="rounded-apple-lg border border-line/70 bg-surface-card p-4 sm:p-6 dark:border-line-dark/70 dark:bg-surface-dark-card">
            <h2 className="text-[15px] font-semibold tracking-tight text-ink dark:text-ink-dark">
              Top referrers
            </h2>

            {topReferrers.length === 0 ? (
              <p className="mt-4 text-[14px] text-ink-secondary dark:text-ink-dark-secondary">
                No external referrers yet.
              </p>
            ) : (
              <ol className="mt-5 flex flex-col">
                {topReferrers.map(({ key, count }, i) => (
                  <li
                    key={key}
                    className="flex items-baseline gap-3 border-b border-line/50 py-3 last:border-none dark:border-line-dark/50"
                  >
                    <span className="w-4 shrink-0 text-[12px] tabular-nums text-ink-tertiary dark:text-ink-dark-secondary">
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-ink dark:text-ink-dark">
                      {key}
                    </span>
                    <span className="shrink-0 text-[13px] tabular-nums text-ink-tertiary dark:text-ink-dark-secondary">
                      {count.toLocaleString()}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
