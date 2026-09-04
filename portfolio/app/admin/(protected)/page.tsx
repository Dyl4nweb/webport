"use client";

import { useEffect, useMemo, useState } from "react";

import StatCard from "@/components/admin/StatCard";
import { fetchActivityFeed } from "@/lib/admin/activity";
import { getSupabase } from "@/lib/supabase";
import {
  countAllViews,
  dayKeyOf,
  fetchRecentViews,
  lastNDayKeys,
  shortDayLabel,
  tally,
  type Device,
  type PageViewRow,
} from "@/lib/admin/analytics";

interface ActivityRow {
  id: string;
  type: string;
  title: string;
  created_at: string;
}

function relativeTime(iso: string): string {
  const seconds = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));

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

const ACTIVITY_DOT: Record<string, string> = {
  inquiry: "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]",
  booking: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]",
  email: "bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]",
  project: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]",
  visitor: "bg-zinc-400 dark:bg-zinc-500",
};

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

function ActivityDot({ type }: { type: string }) {
  return (
    <span
      aria-hidden="true"
      className={`mt-[7px] h-2 w-2 shrink-0 rounded-full ${
        ACTIVITY_DOT[type] ?? "bg-zinc-400 dark:bg-zinc-600"
      }`}
    />
  );
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState({
    visitors: 0,
    pageViews: 0,
    inquiries: 0,
    newInquiries: 0,
    upcomingBookings: 0,
    projects: 0,
  });
  const [activity, setActivity] = useState<ActivityRow[]>([]);
  const [analyticsRows, setAnalyticsRows] = useState<PageViewRow[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [animateCharts, setAnimateCharts] = useState(false);
  const [justLoggedIn, setJustLoggedIn] = useState(false);
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    setMounted(true);
    setDateStr(
      new Date().toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    );

    if (typeof window !== "undefined") {
      const lastSplashStr = sessionStorage.getItem("admin_splash_timestamp");
      if (lastSplashStr) {
        const elapsed = Date.now() - parseInt(lastSplashStr, 10);
        if (elapsed < 4000) {
          setJustLoggedIn(true);
        }
      }
    }

    let cancelled = false;

    async function load() {
      const supabase = getSupabase();

      try {
        const [visitorsRow, pageViews, inquiriesAll, inquiriesNew, upcoming, projects, recentRows, allTime] =
          await Promise.all([
          supabase.from("visitors").select("count").eq("id", 1).single(),
          supabase
            .from("page_views")
            .select("*", { count: "exact", head: true }),
          supabase
            .from("inquiries")
            .select("*", { count: "exact", head: true }),
          supabase
            .from("inquiries")
            .select("*", { count: "exact", head: true })
            .eq("status", "new"),
          supabase
            .from("bookings_cache")
            .select("*", { count: "exact", head: true })
            .gt("start_time", new Date().toISOString()),
          supabase
            .from("portfolio_projects")
            .select("*", { count: "exact", head: true }),
          fetchRecentViews(14),
          countAllViews(),
        ]);

        if (cancelled) return;

        setStats({
          visitors: visitorsRow.data?.count ?? 0,
          pageViews: pageViews.count ?? 0,
          inquiries: inquiriesAll.count ?? 0,
          newInquiries: inquiriesNew.count ?? 0,
          upcomingBookings: upcoming.count ?? 0,
          projects: projects.count ?? 0,
        });

        setAnalyticsRows(recentRows);
        setTotalViews(allTime);
        setActivity(await fetchActivityFeed(6));
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        if (!cancelled) {
          setLoading(false);
          // Calculate if the splash screen is currently active and wait for it
          let delay = 150;
          if (typeof window !== "undefined") {
            const lastSplashStr = sessionStorage.getItem("admin_splash_timestamp");
            if (lastSplashStr) {
              const elapsed = Date.now() - parseInt(lastSplashStr, 10);
              // Splash takes ~3150ms total. If it's still running, delay by the remaining time
              if (elapsed < 3150) {
                delay = Math.max(150, 3150 - elapsed);
              }
            }
          }
          // Small delay to allow SVG and DOM to mount before triggering CSS transitions
          setTimeout(() => setAnimateCharts(true), delay);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  // Analytics computed states
  const trend = useMemo(() => {
    const keys = lastNDayKeys(14);
    const counts = new Map<string, number>();
    for (const row of analyticsRows) {
      const key = dayKeyOf(row.created_at);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return keys.map((key) => ({ key, count: counts.get(key) ?? 0 }));
  }, [analyticsRows]);

  const maxTrend = useMemo(
    () => Math.max(1, ...trend.map((t) => t.count)),
    [trend]
  );

  const devices = useMemo(() => {
    const entries = tally(analyticsRows, (r) => r.device as Device | null);
    const map = new Map(entries.map((e) => [e.key, e.count]));
    const total = Math.max(1, analyticsRows.length);
    return (["mobile", "tablet", "desktop"] as Device[]).map((device) => ({
      device,
      count: map.get(device) ?? 0,
      pct: Math.round(((map.get(device) ?? 0) / total) * 100),
    }));
  }, [analyticsRows]);

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      {/* Welcome Header / Banner */}
      <div
        className={`relative overflow-hidden rounded-[24px] border border-line/50 bg-surface-card/60 backdrop-blur-2xl p-6 sm:p-8 md:p-10 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.05)] dark:border-line-dark/50 dark:bg-surface-dark-card/60 dark:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.4)] transition-all duration-700 ease-out ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        }`}
      >
        {/* Subtle atmospheric glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/15 blur-[80px] dark:bg-accent-dark/25"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-blue-500/10 blur-[80px] dark:bg-blue-500/15"
        />

        <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3">
            {/* Status & Category Eyebrow */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent dark:text-accent-dark">
                Admin Dashboard
              </span>
              <span className="text-line-dark/30 dark:text-line/20">•</span>
              <span className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-ink-secondary dark:text-ink-dark-secondary">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                Live Session
              </span>
              {justLoggedIn && (
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10.5px] font-medium text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 border border-emerald-500/20">
                  Signed in
                </span>
              )}
            </div>

            {/* Smooth Greeting Title */}
            <h1 className="text-[28px] min-[380px]:text-[32px] sm:text-[38px] md:text-[42px] font-semibold tracking-[-0.03em] text-ink dark:text-ink-dark leading-tight">
              Welcome back, <br className="hidden sm:block lg:hidden" />
              <span className="bg-gradient-to-r from-ink to-ink/60 bg-clip-text text-transparent dark:from-ink-dark dark:to-ink-dark/60">Dylan Ramos</span>
            </h1>

            {/* Subtitle */}
            <p className="text-[14px] sm:text-[15px] leading-relaxed text-ink-secondary dark:text-ink-dark-secondary max-w-xl">
              {justLoggedIn
                ? "You have successfully signed in. Here is your portfolio activity and live metrics today."
                : "Portfolio activity, client inquiries, and performance metrics at a glance."}
            </p>
          </div>

          {/* Date pill */}
          {dateStr && (
            <div className="self-start sm:self-auto shrink-0 inline-flex items-center gap-2.5 rounded-full border border-line/40 bg-surface/40 px-4 py-2 text-[12.5px] font-medium text-ink-secondary backdrop-blur-xl dark:border-line-dark/40 dark:bg-surface-dark/40 dark:text-ink-dark-secondary shadow-lg shadow-black/5">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-60"
                aria-hidden="true"
              >
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                <line x1="16" x2="16" y1="2" y2="6" />
                <line x1="8" x2="8" y1="2" y2="6" />
                <line x1="3" x2="21" y1="10" y2="10" />
              </svg>
              <span>{dateStr}</span>
            </div>
          )}
        </div>
      </div>

      {/* Bento Box Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Primary Stats Column */}
        <div
          className={`col-span-1 md:col-span-3 lg:col-span-4 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4 transition-all duration-700 delay-100 ease-out ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          }`}
        >
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-[132px] animate-pulse rounded-apple-lg border border-line/50 bg-surface-card/60 backdrop-blur-xl dark:border-line-dark/50 dark:bg-surface-dark-card/60"
              />
            ))
          ) : (
            <>
              <StatCard label="Total visitors" value={stats.visitors.toLocaleString()} />
              <StatCard
                label="Inquiries"
                value={stats.inquiries.toLocaleString()}
                hint={`${stats.newInquiries} new`}
              />
              <StatCard
                label="Upcoming bookings"
                value={stats.upcomingBookings.toLocaleString()}
              />
              <StatCard label="Projects" value={stats.projects.toLocaleString()} />
            </>
          )}
        </div>

        {/* Analytics 14-day Trend */}
        <section
          className={`col-span-1 md:col-span-2 lg:col-span-2 flex flex-col rounded-apple-lg border border-line/50 bg-surface-card/60 backdrop-blur-xl p-5 sm:p-7 dark:border-line-dark/50 dark:bg-surface-dark-card/60 transition-all duration-700 delay-200 ease-out shadow-sm hover:border-line/80 hover:shadow-lg dark:hover:border-line-dark/80 group ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          }`}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold tracking-tight text-ink dark:text-ink-dark">
              Page views
            </h2>
            <span className="text-[12px] font-medium text-ink-tertiary dark:text-ink-dark-secondary bg-ink/[0.04] dark:bg-ink-dark/[0.08] px-2 py-1 rounded-md">
              14 days
            </span>
          </div>

          {loading ? (
            <div className="mt-8 flex-1 animate-pulse rounded-apple-sm bg-ink/[0.04] dark:bg-ink-dark/[0.06]" />
          ) : (
            <>
              <div
                className="mt-8 flex flex-1 items-end gap-[4px]"
                role="img"
                aria-label={`Page views per day over the last 14 days`}
              >
                {trend.map(({ key, count }) => (
                  <div
                    key={key}
                    className="relative flex h-full flex-1 items-end hover:z-10"
                    title={`${shortDayLabel(key)} — ${count} view${count === 1 ? "" : "s"}`}
                  >
                    <div
                      className="w-full rounded-t-[4px] bg-accent/60 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-accent dark:bg-accent-dark/60 dark:hover:bg-accent-dark hover:shadow-[0_0_12px_rgba(var(--accent),0.5)]"
                      style={{ height: animateCharts ? `${Math.max(count > 0 ? 5 : 1, (count / maxTrend) * 100)}%` : "0%" }}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-[4px]">
                {trend.map(({ key }, i) => (
                  <span
                    key={key}
                    className="flex-1 truncate text-center text-[10px] font-medium text-ink-tertiary dark:text-ink-dark-secondary"
                  >
                    {i % 3 === 1 ? shortDayLabel(key) : ""}
                  </span>
                ))}
              </div>
            </>
          )}
        </section>

        {/* Device Breakdown */}
        <section
          className={`col-span-1 md:col-span-1 lg:col-span-1 flex flex-col rounded-apple-lg border border-line/50 bg-surface-card/60 backdrop-blur-xl p-5 sm:p-7 dark:border-line-dark/50 dark:bg-surface-dark-card/60 transition-all duration-700 delay-300 ease-out shadow-sm hover:border-line/80 hover:shadow-lg dark:hover:border-line-dark/80 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          }`}
        >
          <h2 className="text-[15px] font-semibold tracking-tight text-ink dark:text-ink-dark">
            Devices
          </h2>

          {loading ? (
            <div className="mt-6 flex flex-col gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-10 w-full animate-pulse rounded-md bg-ink/[0.04] dark:bg-ink-dark/[0.06]" />
              ))}
            </div>
          ) : analyticsRows.length === 0 ? (
            <p className="mt-auto mb-auto text-[13px] text-ink-secondary dark:text-ink-dark-secondary text-center">
              No data yet.
            </p>
          ) : (
            <div className="mt-6 flex flex-col gap-6">
              <div className="relative flex justify-center items-center">
                <svg viewBox="0 0 100 100" className="h-32 w-32 -rotate-90 drop-shadow-md">
                  {/* Background Rings */}
                  <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="7" className="text-ink/[0.04] dark:text-ink-dark/[0.06]" fill="none" />
                  <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="7" className="text-ink/[0.04] dark:text-ink-dark/[0.06]" fill="none" />
                  <circle cx="50" cy="50" r="20" stroke="currentColor" strokeWidth="7" className="text-ink/[0.04] dark:text-ink-dark/[0.06]" fill="none" />
                  
                  {/* Animated Foreground Rings */}
                  {devices.map(({ device, pct }, i) => {
                    const radius = 40 - i * 10;
                    const circumference = 2 * Math.PI * radius;
                    const offset = animateCharts ? circumference - (circumference * pct) / 100 : circumference;
                    const colors: Record<string, string> = {
                      mobile: "text-blue-500",
                      tablet: "text-violet-500",
                      desktop: "text-emerald-500",
                    };
                    
                    return (
                      <circle
                        key={device}
                        cx="50"
                        cy="50"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="7"
                        strokeLinecap="round"
                        className={`${colors[device]} transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] delay-[${400 + i * 100}ms]`}
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                      />
                    );
                  })}
                </svg>
              </div>

              {/* Legend */}
              <ul className="flex flex-col gap-3">
                {devices.map(({ device, pct }) => {
                  const dots: Record<string, string> = {
                    mobile: "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]",
                    tablet: "bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]",
                    desktop: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]",
                  };
                  return (
                    <li key={device} className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className={`h-2.5 w-2.5 rounded-full ${dots[device]}`} />
                        <span className="text-[13px] font-medium text-ink dark:text-ink-dark capitalize">
                          {device}
                        </span>
                      </div>
                      <span className="text-[12px] font-semibold text-ink-secondary dark:text-ink-dark-secondary tabular-nums">
                        {pct}%
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </section>

        {/* Recent activity */}
        <section
          className={`col-span-1 md:col-span-3 lg:col-span-1 flex flex-col rounded-apple-lg border border-line/50 bg-surface-card/60 backdrop-blur-xl p-5 sm:p-7 dark:border-line-dark/50 dark:bg-surface-dark-card/60 transition-all duration-700 delay-[400ms] ease-out shadow-sm hover:border-line/80 hover:shadow-lg dark:hover:border-line-dark/80 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          }`}
        >
          <div className="flex items-center justify-between border-b border-line/40 pb-4 dark:border-line-dark/40">
            <h2 className="text-[15px] font-semibold tracking-tight text-ink dark:text-ink-dark">
              Recent activity
            </h2>
          </div>

          {loading ? (
            <div className="mt-5 flex flex-col gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-5 w-full max-w-[200px] animate-pulse rounded-full bg-ink/[0.04] dark:bg-ink-dark/[0.06]" />
              ))}
            </div>
          ) : activity.length === 0 ? (
            <p className="mt-6 text-[13.5px] text-ink-secondary dark:text-ink-dark-secondary text-center">
              No activity yet.
            </p>
          ) : (
            <ul className="mt-3 flex flex-col">
              {activity.map((row) => (
                <li
                  key={row.id}
                  className="group flex items-start gap-3.5 border-b border-line/30 py-3.5 last:border-none dark:border-line-dark/30 transition-colors hover:bg-ink/[0.03] dark:hover:bg-ink-dark/[0.03] -mx-3 px-3 rounded-md"
                >
                  <ActivityDot type={row.type} />

                  <span className="flex-1 text-[13.5px] font-medium leading-snug text-ink dark:text-ink-dark">
                    {row.title}
                  </span>

                  <time
                    dateTime={row.created_at}
                    className="shrink-0 text-[12px] font-medium tabular-nums text-ink-tertiary dark:text-ink-dark-secondary group-hover:text-ink-secondary dark:group-hover:text-ink-dark transition-colors"
                  >
                    {relativeTime(row.created_at)}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
