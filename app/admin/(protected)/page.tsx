"use client";

import { useEffect, useState } from "react";

import StatCard from "@/components/admin/StatCard";
import { fetchActivityFeed } from "@/lib/admin/activity";
import { getSupabase } from "@/lib/supabase";

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
  inquiry: "bg-blue-500",
  booking: "bg-emerald-500",
  email: "bg-violet-500",
  project: "bg-amber-500",
  visitor: "bg-zinc-400 dark:bg-zinc-600",
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const supabase = getSupabase();

      const [visitorsRow, pageViews, inquiriesAll, inquiriesNew, upcoming, projects] =
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

      setActivity(await fetchActivityFeed(8));
      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent dark:text-accent-dark">
          Dashboard
        </span>

        <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.03em] text-ink dark:text-ink-dark">
          Overview
        </h1>

        <p className="mt-1 text-[14px] text-ink-secondary dark:text-ink-dark-secondary">
          Portfolio activity at a glance.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[132px] animate-pulse rounded-apple-lg border border-line/70 bg-surface-card dark:border-line-dark/70 dark:bg-surface-dark-card"
            />
          ))
        ) : (
          <>
            <StatCard label="Total visitors" value={stats.visitors.toLocaleString()} />
            <StatCard label="Page views" value={stats.pageViews.toLocaleString()} />
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

      {/* Recent activity */}
      <section className="rounded-apple-lg border border-line/70 bg-surface-card p-6 dark:border-line-dark/70 dark:bg-surface-dark-card">
        <h2 className="text-[15px] font-semibold tracking-tight text-ink dark:text-ink-dark">
          Recent activity
        </h2>

        {loading ? (
          <div className="mt-5 flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-5 w-full max-w-md animate-pulse rounded-full bg-ink/[0.06] dark:bg-ink-dark/[0.08]" />
            ))}
          </div>
        ) : activity.length === 0 ? (
          <p className="mt-4 text-[14px] text-ink-secondary dark:text-ink-dark-secondary">
            No activity yet — events like new inquiries will appear here.
          </p>
        ) : (
          <ul className="mt-5 flex flex-col">
            {activity.map((row) => (
              <li
                key={row.id}
                className="flex items-start gap-3 border-b border-line/50 py-3 last:border-none dark:border-line-dark/50"
              >
                <ActivityDot type={row.type} />

                <span className="flex-1 text-[14px] leading-snug text-ink dark:text-ink-dark">
                  {row.title}
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
