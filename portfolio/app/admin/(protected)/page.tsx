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
  const [mounted, setMounted] = useState(false);
  const [justLoggedIn, setJustLoggedIn] = useState(false);
  const [dateStr, setDateStr] = useState("");
  const [hasSpokenWelcome, setHasSpokenWelcome] = useState(false);

  // Force load voices on mount for speech synthesis
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  const speakText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    
    // Find French or American voice
    let preferredVoice = voices.find(v => v.lang.toLowerCase().includes('fr-') || v.name.toLowerCase().includes('french'));
    if (!preferredVoice) {
      preferredVoice = voices.find(v => v.lang === 'en-US');
    }
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.pitch = 1;
    utterance.rate = 1.05;

    window.speechSynthesis.speak(utterance);
  };

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
      if (sessionStorage.getItem("admin_just_logged_in") === "1") {
        setJustLoggedIn(true);
        sessionStorage.removeItem("admin_just_logged_in");
      }
    }

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

  useEffect(() => {
    if (!loading && justLoggedIn && mounted && !hasSpokenWelcome) {
      setHasSpokenWelcome(true);
      const summary = `Welcome back, Dylan Ramos. You have ${stats.newInquiries} new inquiries, ${stats.upcomingBookings} upcoming bookings, and a total of ${stats.visitors} visitors on your portfolio.`;
      
      // Add a slight delay to ensure the DOM is ready and the user is fully logged in
      setTimeout(() => {
        speakText(summary);
      }, 500);
    }
  }, [loading, justLoggedIn, mounted, stats, hasSpokenWelcome]);

  return (
    <div className="flex flex-col gap-7 sm:gap-8">
      {/* Welcome Header / Banner */}
      <div
        className={`relative overflow-hidden rounded-apple-xl border border-line/70 bg-surface-card p-5 sm:p-7 md:p-8 dark:border-line-dark/70 dark:bg-surface-dark-card shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_24px_-8px_rgba(0,0,0,0.35)] transition-all duration-700 ease-out ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        }`}
      >
        {/* Subtle atmospheric glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-accent/5 blur-3xl dark:bg-accent-dark/10"
        />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            {/* Status & Category Eyebrow */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent dark:text-accent-dark">
                Admin Dashboard
              </span>
              <span className="text-line-dark/30 dark:text-line/20">•</span>
              <span className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-ink-secondary dark:text-ink-dark-secondary">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Session
              </span>
              {justLoggedIn && (
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10.5px] font-medium text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                  Signed in
                </span>
              )}
            </div>

            {/* Smooth Greeting Title */}
            <h1 className="text-[26px] min-[380px]:text-[30px] sm:text-[34px] md:text-[36px] font-semibold tracking-[-0.03em] text-ink dark:text-ink-dark">
              Welcome back, Dylan Ramos
            </h1>

            {/* Subtitle */}
            <p className="text-[13.5px] sm:text-[14.5px] leading-relaxed text-ink-secondary dark:text-ink-dark-secondary max-w-xl">
              {justLoggedIn
                ? "You have successfully signed in. Here is your portfolio activity and live metrics today."
                : "Portfolio activity, client inquiries, and performance metrics at a glance."}
            </p>
          </div>

          {/* Date pill */}
          {dateStr && (
            <div className="self-start sm:self-auto shrink-0 inline-flex items-center gap-2 rounded-full border border-line/60 bg-surface/70 px-3.5 py-1.5 text-[12px] font-medium text-ink-secondary backdrop-blur-sm dark:border-line-dark/60 dark:bg-surface-dark/70 dark:text-ink-dark-secondary shadow-sm">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-70"
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

      {/* Stats */}
      <div
        className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 transition-all duration-700 delay-100 ease-out ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        }`}
      >
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
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
      <section
        className={`rounded-apple-lg border border-line/70 bg-surface-card p-4 sm:p-6 dark:border-line-dark/70 dark:bg-surface-dark-card transition-all duration-700 delay-200 ease-out ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        }`}
      >
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
